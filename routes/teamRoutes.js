const express = require("express");
const router = express.Router();
const { getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");
const { createUploader } = require("../utils/cloudinaryConfig");

const handleUpload = (req, res, next) => {
  createUploader("team").single("photo")(req, res, err => err ? next(err) : next());
};

router.get("/", getAllTeamMembers);
router.post("/", protect, handleUpload, createTeamMember);
router.put("/:id", protect, handleUpload, updateTeamMember);
router.delete("/:id", protect, deleteTeamMember);

module.exports = router;
