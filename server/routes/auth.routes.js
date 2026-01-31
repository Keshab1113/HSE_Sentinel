const router = require("express").Router();
const { register, login, getPendingApprovals, approveUser, rejectUser } = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);

// Protected routes for approvals
router.get("/pending-approvals", authenticate, getPendingApprovals);
router.post("/approve/:userId", authenticate, approveUser);
router.post("/reject/:userId", authenticate, rejectUser);

module.exports = router;