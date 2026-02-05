import { Router } from "express";
import {
  sendAssignmentNotification,
  sendAlertNotification,
  sendReportEmail,
  getEmailLogs
} from "../controllers/email.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/role.middleware.js";

const router = Router();

router.post("/assignment/:assignmentId", authenticate, sendAssignmentNotification);
router.post("/alert/:alertId", authenticate, checkRole(["super_admin", "group_admin"]), sendAlertNotification);
router.post("/report", authenticate, sendReportEmail);
router.get("/logs", authenticate, checkRole(["super_admin", "group_admin"]), getEmailLogs);

export default router;