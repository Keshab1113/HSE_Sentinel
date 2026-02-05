import { Router } from "express";
import {
  getComplianceItems,
  addComplianceItem,
  updateComplianceStatus,
  uploadComplianceEvidence,
  getComplianceReport
} from "../controllers/compliance.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", authenticate, getComplianceItems);
router.post("/", authenticate, checkRole(["super_admin", "group_admin"]), addComplianceItem);
router.put("/:id/status", authenticate, updateComplianceStatus);
router.post("/upload-evidence", authenticate, uploadComplianceEvidence);
router.get("/report", authenticate, getComplianceReport);

export default router;