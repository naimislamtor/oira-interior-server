const express = require("express");
const router = express.Router();
const {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");

// All lead admin management endpoints can use protect middleware if required or public read for demo
router.get("/", protect, getLeads);
router.post("/", protect, createLead);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, deleteLead);

module.exports = router;
