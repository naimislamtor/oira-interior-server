const express = require("express");
const router = express.Router();
const { getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../utils/cloudinaryConfig");

router.get("/", getAllTeamMembers);
router.post("/", protect, upload.single("photo"), createTeamMember);
router.put("/:id", protect, upload.single("photo"), updateTeamMember);
router.delete("/:id", protect, deleteTeamMember);

module.exports = router;
