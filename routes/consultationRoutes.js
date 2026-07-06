const express = require("express");
const router = express.Router();
const {
  submitConsultation,
  getAllConsultations,
  updateConsultationStatus,
} = require("../controllers/consultationController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", submitConsultation);
router.get("/", protect, getAllConsultations);
router.put("/:id/status", protect, updateConsultationStatus);

module.exports = router;
