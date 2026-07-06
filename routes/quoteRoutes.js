const express = require("express");
const router = express.Router();
const {
  submitQuote,
  getAllQuotes,
  updateQuoteStatus,
} = require("../controllers/quoteController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../utils/multerConfig");

router.post("/", upload.array("files", 5), submitQuote);
router.get("/", protect, getAllQuotes);
router.put("/:id/status", protect, updateQuoteStatus);

module.exports = router;
