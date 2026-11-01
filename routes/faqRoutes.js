const express = require("express");
const router = express.Router();
const {
  matchFaq,
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  getCategories,
} = require("../controllers/faqController");
const { protect } = require("../middleware/authMiddleware");

// Public — chatbot matching
router.post("/match", matchFaq);

// Admin — protected
router.get("/", protect, getAllFaqs);
router.get("/categories", protect, getCategories);
router.get("/:id", protect, getFaqById);
router.post("/", protect, createFaq);
router.put("/:id", protect, updateFaq);
router.delete("/:id", protect, deleteFaq);

module.exports = router;
