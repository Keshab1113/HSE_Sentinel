const pool = require("../../config/db.js");
const { MistralService } = require("../ai/mistral.service.js");
const { DeepSeekService } = require("../ai/deepseek.service.js");
const { VectorService } = require("../ai/vector.service.js");

class IndicatorService {
  constructor() {
    this.mistral = new MistralService();
    this.deepseek = new DeepSeekService();
    this.vector = new VectorService();
  }

  async processSafetyDocument(fileUrl, fileType, userId, groupId, teamId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Extract text with Mistral
      const extraction = await this.mistral.extractTextFromDocument(
        fileUrl,
        fileType,
      );

      // 2. Classify as leading/lagging
      const classification = await this.mistral.classifySafetyEvent(
        extraction.extractedText,
      );

      // 3. Store in database
      const [result] = await connection.execute(
        `INSERT INTO ai_analysis_results 
                (resource_type, resource_id, analysis_type, indicator_type, 
                 risk_score, confidence, category, extracted_data, ai_model)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "document",
          0, // Will be updated with actual resource ID
          "classification",
          classification.indicator_type,
          classification.risk_score || 0,
          classification.confidence || 0,
          classification.category,
          JSON.stringify({
            text: extraction.extractedText.substring(0, 1000),
            classification,
            metadata: extraction.metadata,
          }),
          "mistral-large-latest",
        ],
      );

      // 4. Generate vector embedding for similarity search
      const embedding = await this.vector.generateEmbedding(
        extraction.extractedText,
      );

      // Map string resource_type to integer codes
      const resourceTypeMap = {
        'document': 1,
        'incident': 2,
        'training': 3,
        'inspection': 4,
        'maintenance': 5,
        'safety_meeting': 6
      };

      const resourceTypeCode = resourceTypeMap['document'] || 1;

      await connection.execute(
        `INSERT INTO vector_embeddings 
                (resource_type, resource_id, embedding, text_content, 
                 indicator_type, category, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          resourceTypeCode, // Use integer instead of string
          result.insertId,
          JSON.stringify(embedding),
          extraction.extractedText.substring(0, 500),
          classification.indicator_type,
          classification.category,
          JSON.stringify({
            file_type: fileType,
            user_id: userId,
            group_id: groupId,
            team_id: teamId,
          }),
        ],
      );

      // 5. Create indicator measurement if numerical data found
      if (classification.indicator_type !== "none") {
        await this.createIndicatorMeasurement(
          connection,
          classification,
          extraction.extractedText,
          userId,
          groupId,
          teamId,
          result.insertId,
        );
      }

      await connection.commit();

      return {
        success: true,
        analysisId: result.insertId,
        classification,
        extraction: {
          textLength: extraction.extractedText.length,
          metadata: extraction.metadata,
        },
      };
    } catch (error) {
      await connection.rollback();
      console.error("Document processing error:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async createIndicatorMeasurement(
    connection,
    classification,
    text,
    userId,
    groupId,
    teamId,
    sourceId,
  ) {
    // Extract numerical values from text using regex
    const numbers = text.match(/\d+(\.\d+)?/g) || [];
    const numericValue = numbers.length > 0 ? parseFloat(numbers[0]) : 1;

    // Find or create indicator
    let indicatorId;

    const tableName = classification.indicator_type === 'leading' 
      ? 'leading_indicators' 
      : 'lagging_indicators';

    const [indicators] = await connection.execute(
      `SELECT id FROM ${tableName} 
             WHERE category = ? AND is_active = TRUE LIMIT 1`,
      [classification.category],
    );

    if (indicators.length > 0) {
      indicatorId = indicators[0].id;
    } else {
      // Create new indicator
      const [newIndicator] = await connection.execute(
        `INSERT INTO ${tableName} 
                (indicator_code, name, category, created_by)
                VALUES (?, ?, ?, ?)`,
        [
          `${classification.category}_${Date.now()}`,
          `Auto-generated ${classification.category} indicator`,
          classification.category,
          userId,
        ],
      );
      indicatorId = newIndicator.insertId;
    }

    // Create measurement
    await connection.execute(
      `INSERT INTO indicator_measurements
            (indicator_id, indicator_type, group_id, team_id, 
             measured_value, measurement_date, data_source, 
             source_record_id, confidence_score, recorded_by)
            VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
      [
        indicatorId,
        classification.indicator_type,
        groupId,
        teamId,
        numericValue,
        "ai_extracted",
        sourceId,
        classification.confidence || 0.5,
        userId,
      ],
    );
  }

  async calculateSafetyScore(groupId, teamId, date = new Date()) {
    const connection = await pool.getConnection();

    try {
      // Calculate leading score (higher is better)
      const [leadingMetrics] = await connection.execute(
        `SELECT 
                    li.category,
                    AVG(im.measured_value / li.target_value * 100) as performance,
                    COUNT(*) as measurement_count
                FROM indicator_measurements im
                JOIN leading_indicators li ON im.indicator_id = li.id
                WHERE im.indicator_type = 'leading'
                AND im.group_id = ?
                AND im.team_id = ?
                AND im.measurement_date >= DATE_SUB(?, INTERVAL 30 DAY)
                AND li.target_value > 0
                GROUP BY li.category`,
        [groupId, teamId, date],
      );

      // Calculate lagging score (lower is better)
      const [laggingMetrics] = await connection.execute(
        `SELECT 
                    li.category,
                    SUM(im.measured_value * li.severity_weight) as weighted_incidents,
                    COUNT(*) as incident_count
                FROM indicator_measurements im
                JOIN lagging_indicators li ON im.indicator_id = li.id
                WHERE im.indicator_type = 'lagging'
                AND im.group_id = ?
                AND im.team_id = ?
                AND im.measurement_date >= DATE_SUB(?, INTERVAL 30 DAY)
                GROUP BY li.category`,
        [groupId, teamId, date],
      );

      // Calculate scores (simplified formula)
      const leadingScore = leadingMetrics.reduce(
        (acc, curr) =>
          acc + (curr.performance || 0) / Math.max(leadingMetrics.length, 1),
        0,
      );

      const laggingScore = laggingMetrics.reduce(
        (acc, curr) => acc + (curr.weighted_incidents || 0),
        0,
      );

      // Composite score (70% leading, 30% inverse lagging)
      const maxLaggingScore = 100; // Normalization factor
      const normalizedLagging = Math.max(
        0,
        maxLaggingScore - laggingScore * 10,
      );
      const compositeScore = leadingScore * 0.7 + normalizedLagging * 0.3;

      // Determine trend
      const [previousScore] = await connection.execute(
        `SELECT composite_score 
                 FROM safety_scores 
                 WHERE group_id = ? AND team_id = ?
                 AND score_date = DATE_SUB(?, INTERVAL 7 DAY)
                 ORDER BY score_date DESC LIMIT 1`,
        [groupId, teamId, date],
      );

      let trend = "stable";
      if (previousScore.length > 0) {
        const change = compositeScore - previousScore[0].composite_score;
        if (change > 5) trend = "improving";
        else if (change < -5) trend = "declining";
        else if (compositeScore < 60) trend = "critical";
      }

      // Generate AI insights
      const aiInsights = await this.deepseek.generateExecutiveSummary(
        {
          leading: leadingMetrics,
          lagging: laggingMetrics,
          scores: {
            leading: leadingScore,
            lagging: laggingScore,
            composite: compositeScore,
            trend,
          },
        },
        "last 30 days",
      );

      // Store score
      await connection.execute(
        `INSERT INTO safety_scores
                (group_id, team_id, score_date, leading_score, 
                 lagging_score, composite_score, trend, 
                 leading_contribution, lagging_contribution, ai_insights)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                leading_score = VALUES(leading_score),
                lagging_score = VALUES(lagging_score),
                composite_score = VALUES(composite_score),
                trend = VALUES(trend),
                leading_contribution = VALUES(leading_contribution),
                lagging_contribution = VALUES(lagging_contribution),
                ai_insights = VALUES(ai_insights)`,
        [
          groupId,
          teamId,
          date.toISOString().split("T")[0],
          leadingScore,
          laggingScore,
          compositeScore,
          trend,
          JSON.stringify(leadingMetrics),
          JSON.stringify(laggingMetrics),
          aiInsights,
        ],
      );

      return {
        leadingScore,
        laggingScore,
        compositeScore,
        trend,
        leadingMetrics,
        laggingMetrics,
        aiInsights,
      };
    } catch (error) {
      console.error("Safety score calculation error:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async runPredictiveAnalysis(groupId, teamId) {
    try {
      // Get historical data
      const [historical] = await pool.execute(
        `SELECT 
                    DATE(ss.score_date) as date,
                    ss.leading_score,
                    ss.lagging_score,
                    ss.composite_score,
                    im.measured_value,
                    im.indicator_type,
                    li.category
                FROM safety_scores ss
                LEFT JOIN indicator_measurements im ON 
                    im.group_id = ss.group_id AND 
                    im.team_id = ss.team_id AND
                    DATE(im.measurement_date) = ss.score_date
                LEFT JOIN leading_indicators li ON im.indicator_id = li.id
                WHERE ss.group_id = ? AND ss.team_id = ?
                AND ss.score_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
                ORDER BY ss.score_date`,
        [groupId, teamId],
      );

      if (historical.length < 7) {
        return { warning: "Insufficient data for predictive analysis" };
      }

      // Prepare data for AI analysis
      const analysisData = {
        timeframe: "90 days",
        data_points: historical.length,
        scores: historical.map((h) => ({
          date: h.date,
          leading: h.leading_score,
          lagging: h.lagging_score,
          composite: h.composite_score,
        })),
        recent_measurements: historical
          .filter((h) => h.measured_value)
          .slice(-20),
      };

      // Get AI predictions
      const predictions = await this.deepseek.analyzeRiskPatterns(analysisData);

      // Check for alert conditions
      const alerts = [];

      // Leading indicator decline alert
      const recentLeading = historical
        .filter((h) => h.indicator_type === "leading")
        .slice(-5);

      if (recentLeading.length >= 3) {
        const trend = this.calculateTrend(
          recentLeading.map((r) => r.measured_value),
        );
        if (trend < -0.1) {
          // 10% decline
          alerts.push({
            type: "leading_decline",
            severity: "medium",
            message: `Leading indicators showing ${Math.abs(trend * 100).toFixed(1)}% decline over last ${recentLeading.length} measurements`,
            data: recentLeading,
          });
        }
      }

      // Composite score critical alert
      const recentScores = historical
        .map((h) => h.composite_score)
        .filter((s) => s !== null)
        .slice(-3);

      if (
        recentScores.length >= 2 &&
        recentScores[recentScores.length - 1] < 60
      ) {
        alerts.push({
          type: "score_drop",
          severity: "high",
          message: `Safety score dropped to critical level: ${recentScores[recentScores.length - 1].toFixed(1)}`,
          threshold: 60,
        });
      }

      // Store alerts
      for (const alert of alerts) {
        await pool.execute(
          `INSERT INTO predictive_alerts
                    (alert_code, title, alert_type, severity, group_id, team_id,
                     predicted_risk_score, confidence, trigger_conditions)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `${alert.type}_${Date.now()}`,
            alert.message,
            alert.type,
            alert.severity,
            groupId,
            teamId,
            predictions.predicted_risk_score || 5,
            predictions.confidence || 0.7,
            JSON.stringify(alert),
          ],
        );
      }

      return {
        predictions,
        alerts,
        historical_summary: {
          period: "90 days",
          data_points: historical.length,
          average_score:
            historical.reduce((a, b) => a + (b.composite_score || 0), 0) /
            historical.length,
        },
      };
    } catch (error) {
      console.error("Predictive analysis error:", error);
      throw error;
    }
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];

    if (first === 0) return 0;

    return (last - first) / first;
  }
}

module.exports = { IndicatorService };