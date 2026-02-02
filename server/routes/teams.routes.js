const router = require("express").Router();
const {
  getTeams,
  createTeam,
  updateTeamStatus,
  getTeamDetails,
  getTeamUsers
} = require("../controllers/teams.controller");
const authenticate = require("../middlewares/auth.middleware");
const checkRole = require("../middlewares/role.middleware");

router.get("/", authenticate, checkRole(['super_admin', 'group_admin']), getTeams);
router.post("/", authenticate, checkRole(['super_admin', 'group_admin']), createTeam);
router.get("/:id", authenticate, checkRole(['super_admin', 'group_admin', 'team_admin']), getTeamDetails);
router.patch("/:id/status", authenticate, checkRole(['super_admin', 'group_admin']), updateTeamStatus);
router.get("/:id/users", authenticate, checkRole(['super_admin', 'group_admin', 'team_admin']), getTeamUsers);

// Add route for getting teams by group (this will be handled by groups.routes)
// router.get("/group/:id", authenticate, checkRole(['super_admin', 'group_admin']), getTeamsByGroup);

module.exports = router;