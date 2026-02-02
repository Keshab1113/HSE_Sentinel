import { Router } from 'express';
import { 
  uploadAndAnalyze, 
  getSafetyScores, 
  runPredictiveAnalysis,
  getAlerts,
  acknowledgeAlert 
} from '../controllers/indicators.controller.js';
import authenticate from '../middlewares/auth.middleware.js';
import checkRole from '../middlewares/role.middleware.js';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'temp_uploads/' });

// Document upload and AI analysis
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  uploadAndAnalyze
);

// Safety scores
router.get(
  '/scores',
  authenticate,
  getSafetyScores
);

// Predictive analysis (admin only)
router.post(
  '/predictive',
  authenticate,
  checkRole(['super_admin', 'group_admin']),
  runPredictiveAnalysis
);

// Alerts
router.get(
  '/alerts',
  authenticate,
  getAlerts
);

router.post(
  '/alerts/:alertId/acknowledge',
  authenticate,
  checkRole(['super_admin', 'group_admin', 'team_admin']),
  acknowledgeAlert
);

export default router;