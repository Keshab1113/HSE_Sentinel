import pool from "../config/db.js";
import { MistralService } from "../services/ai/mistral.service.js";
import { DeepSeekService } from "../services/ai/deepseek.service.js";

export const runAI = async (resourceId) => {
  try {
    // Get extracted text
    const [[textRow]] = await pool.execute(
      "SELECT * FROM extracted_text WHERE resource_id = ?",
      [resourceId]
    );

    if (!textRow) {
      throw new Error(`No extracted text found for resource ${resourceId}`);
    }

    // Classify with Mistral
    const mistral = new MistralService();
    const aiResult = await mistral.classifySafetyEvent(textRow.raw_text);

    // Get enhanced analysis from DeepSeek if available
    let deepseekResult = null;
    try {
      const deepseek = new DeepSeekService();
      deepseekResult = await deepseek.analyzeRiskPatterns({
        text: textRow.raw_text.substring(0, 1000),
        classification: aiResult
      });
    } catch (deepseekError) {
      console.warn("DeepSeek analysis failed, using Mistral only:", deepseekError.message);
    }

    // Store in database
    await pool.execute(
      `INSERT INTO ai_analysis 
       (resource_id, event_type, indicator_type, category, severity, risk_score, ai_confidence, analysis_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resourceId,
        aiResult.category || 'unknown',
        aiResult.indicator_type || 'neutral',
        aiResult.category || 'general',
        aiResult.risk_score > 7 ? 'high' : aiResult.risk_score > 4 ? 'medium' : 'low',
        aiResult.risk_score || 5,
        aiResult.confidence || 0.8,
        JSON.stringify({
          mistral: aiResult,
          deepseek: deepseekResult,
          timestamp: new Date().toISOString()
        })
      ]
    );

    await pool.execute(
      "UPDATE resources SET status='analyzed', analyzed_at=NOW() WHERE id=?",
      [resourceId]
    );

    return {
      ...aiResult,
      deepseek: deepseekResult,
      resourceId
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    
    // Update resource status to failed
    await pool.execute(
      "UPDATE resources SET status='ai_failed', error_message=? WHERE id=?",
      [error.message, resourceId]
    );
    
    throw error;
  }
};