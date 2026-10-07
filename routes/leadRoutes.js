const express = require("express");
const router = express.Router();
const {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getRealtimeLogs,
  clearRealtimeLogs,
} = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");

// Real-time live log monitor endpoints
router.get("/live-logs", getRealtimeLogs);
router.delete("/live-logs", clearRealtimeLogs);

// All lead admin management endpoints
router.get("/", protect, getLeads);
router.post("/", protect, createLead);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, deleteLead);

module.exports = router;
