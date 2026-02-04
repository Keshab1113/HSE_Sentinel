import { Router } from "express";
import {
  uploadAndAnalyze,
  getSafetyScores,
  runPredictiveAnalysis,
  getAlerts,
  acknowledgeAlert,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getIndicators,
  getIndicatorById,
  assignIndicator,
  getAssignedIndicators,
  updateAssignmentStatus,
  getIndicatorResults,
  shareIndicatorResult,
  getSharedIndicatorResult,
} from "../controllers/indicators.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/role.middleware.js";
import {requirePermissions} from "../middlewares/rbac.middleware.js"
import multer from "multer";

const router = Router();
const upload = multer({ dest: "temp_uploads/" });

// Document upload and AI analysis
router.post("/upload", authenticate, upload.single("file"), uploadAndAnalyze);

// Indicator CRUD
router.post(
  "/",
  authenticate,
  requirePermissions("create_indicators"),
  createIndicator,
);

router.get("/", authenticate,requirePermissions("view_indicators"), getIndicators);

router.get("/:id", authenticate, getIndicatorById);

router.put(
  "/:id",
  authenticate,
  checkRole(["super_admin", "group_admin", "team_admin"]),
  updateIndicator,
);

router.delete(
  "/:id",
  authenticate,
  requirePermissions("delete_indicators"),
  deleteIndicator,
);

// Assignments
router.post(
  "/:id/assign",
  authenticate,
  checkRole(["super_admin", "group_admin", "team_admin"]),
  assignIndicator,
);

router.get("/assigned/me", authenticate, getAssignedIndicators);

router.put(
  "/assignments/:assignmentId/status",
  authenticate,
  updateAssignmentStatus,
);

// Results
router.get("/results/:indicatorId", authenticate, getIndicatorResults);

// Safety scores
router.get("/scores/all", authenticate, getSafetyScores);

// Predictive analysis (admin only)
router.post(
  "/predictive/run",
  authenticate,
  checkRole(["super_admin", "group_admin"]),
  runPredictiveAnalysis,
);

// Alerts
router.get("/alerts/all", authenticate, getAlerts);

router.post(
  "/alerts/:alertId/acknowledge",
  authenticate,
  checkRole(["super_admin", "group_admin", "team_admin"]),
  acknowledgeAlert,
);

// Share indicator result
router.post("/results/:resultId/share", authenticate, shareIndicatorResult);

// Public route for shared results
router.get("/shared/:shareToken", getSharedIndicatorResult);

export default router;
