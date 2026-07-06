const express = require("express");
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  updateContactStatus,
} = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", submitContact);
router.get("/", protect, getAllContacts);
router.put("/:id/status", protect, updateContactStatus);

module.exports = router;
