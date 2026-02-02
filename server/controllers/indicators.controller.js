import { IndicatorService } from '../services/predictive/indicator.service.js';
import { FTPUploader } from '../utils/ftpUploader.js';

const indicatorService = new IndicatorService();
const ftpUploader = new FTPUploader();

// In uploadAndAnalyze function, add validation:
export const uploadAndAnalyze = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            });
        }

        // Parse and validate IDs
        const groupId = req.body.groupId ? parseInt(req.body.groupId) : null;
        const teamId = req.body.teamId ? parseInt(req.body.teamId) : null;
        const documentType = req.body.documentType;
        const userId = req.user.id;

        // Log the values for debugging
        console.log('Upload parameters:', {
            userId,
            groupId,
            teamId,
            documentType,
            file: req.file.originalname
        });

        // Upload to FTP
        const uploadResult = await ftpUploader.uploadFile(req.file.path, {
            onProgress: (progress) => {
                console.log(`Upload progress: ${progress.percentage.toFixed(1)}%`);
            }
        });

        // Process with AI
        const analysisResult = await indicatorService.processSafetyDocument(
            uploadResult.url,
            req.file.mimetype,
            userId,
            groupId,
            teamId
        );

        // Clean up local file if needed
        // fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            upload: uploadResult,
            analysis: analysisResult,
            message: 'File uploaded and analyzed successfully'
        });

    } catch (error) {
        console.error('Upload and analyze error:', error);
        res.status(500).json({
            success: false,
            message: 'Analysis failed',
            error: error.message
        });
    }
};

export const getSafetyScores = async (req, res) => {
    try {
        const { groupId, teamId, startDate, endDate } = req.query;
        const user = req.user;

        // Authorization check
        if (user.role === 'group_admin' && user.group_id != groupId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (user.role === 'team_admin' && user.team_id != teamId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const scores = await indicatorService.calculateSafetyScore(
            groupId || user.group_id,
            teamId || user.team_id,
            endDate ? new Date(endDate) : new Date()
        );

        res.json({
            success: true,
            data: scores
        });

    } catch (error) {
        console.error('Get safety scores error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get safety scores',
            error: error.message
        });
    }
};

export const runPredictiveAnalysis = async (req, res) => {
    try {
        const { groupId, teamId } = req.body;
        const user = req.user;

        // Only group_admin and super_admin can run predictive analysis
        if (!['super_admin', 'group_admin'].includes(user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Insufficient permissions' 
            });
        }

        const analysis = await indicatorService.runPredictiveAnalysis(
            groupId || user.group_id,
            teamId || user.team_id
        );

        res.json({
            success: true,
            data: analysis,
            message: 'Predictive analysis completed'
        });

    } catch (error) {
        console.error('Predictive analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Predictive analysis failed',
            error: error.message
        });
    }
};

export const getAlerts = async (req, res) => {
    try {
        const user = req.user;
        const { status, severity, limit = 50 } = req.query;

        let query = `
            SELECT pa.*, 
                   g.name as group_name,
                   t.name as team_name,
                   u.name as acknowledged_by_name
            FROM predictive_alerts pa
            LEFT JOIN \`groups\` g ON pa.group_id = g.id
            LEFT JOIN teams t ON pa.team_id = t.id
            LEFT JOIN users u ON pa.acknowledged_by = u.id
            WHERE 1=1
        `;

        const params = [];

        // Role-based filtering
        if (user.role === 'group_admin') {
            query += ' AND pa.group_id = ?';
            params.push(user.group_id);
        } else if (user.role === 'team_admin') {
            query += ' AND pa.team_id = ?';
            params.push(user.team_id);
        }

        if (status) {
            query += ' AND pa.status = ?';
            params.push(status);
        }

        if (severity) {
            query += ' AND pa.severity = ?';
            params.push(severity);
        }

        query += ' ORDER BY pa.created_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [alerts] = await pool.execute(query, params);

        res.json({
            success: true,
            count: alerts.length,
            data: alerts
        });

    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get alerts',
            error: error.message
        });
    }
};

export const acknowledgeAlert = async (req, res) => {
    try {
        const { alertId } = req.params;
        const userId = req.user.id;

        const [result] = await pool.execute(
            `UPDATE predictive_alerts 
             SET status = 'acknowledged',
                 acknowledged_by = ?,
                 acknowledged_at = NOW()
             WHERE id = ? AND status = 'active'`,
            [userId, alertId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found or already acknowledged'
            });
        }

        res.json({
            success: true,
            message: 'Alert acknowledged successfully'
        });

    } catch (error) {
        console.error('Acknowledge alert error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to acknowledge alert',
            error: error.message
        });
    }
};