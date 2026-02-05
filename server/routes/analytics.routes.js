import { Router } from 'express';
import authenticate from '../middlewares/auth.middleware.js';
import {
  getTrends,
  getCompliance,
  generateReport,
  sendReportEmail,
  getDashboardData
} from "../controllers/analytics.controller.js";

const router = Router();

router.get("/trends", authenticate, getTrends);
router.get("/compliance", authenticate, getCompliance);
router.get("/dashboard", authenticate, getDashboardData);
router.post("/reports/generate", authenticate, generateReport);
router.post("/reports/email", authenticate, sendReportEmail);

export default router;