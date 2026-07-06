const express = require("express");
const router = express.Router();
const {
  submitAppointment,
  getAllAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", submitAppointment);
router.get("/", protect, getAllAppointments);
router.put("/:id/status", protect, updateAppointmentStatus);

module.exports = router;
