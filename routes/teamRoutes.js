const express = require("express");
const router = express.Router();
const {
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllTeamMembers);

// Admin routes
router.post("/", protect, createTeamMember);
router.put("/:id", protect, updateTeamMember);
router.delete("/:id", protect, deleteTeamMember);

module.exports = router;
