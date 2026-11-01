const express = require("express");
const router = express.Router();
const { getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");
const { createUploader } = require("../utils/cloudinaryConfig");

const upload = createUploader("team");

const handleUpload = (req, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get("/", getAllTeamMembers);
router.post("/", protect, handleUpload, createTeamMember);
router.put("/:id", protect, handleUpload, updateTeamMember);
router.delete("/:id", protect, deleteTeamMember);

module.exports = router;
