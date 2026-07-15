const express = require("express");
const router = express.Router();
const {
  getAllPortfolio,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../utils/multerConfig");

// Public routes
router.get("/", getAllPortfolio);
router.get("/:id", getPortfolioById);

// Admin only routes
router.post("/", protect, upload.single("image"), createPortfolio);
router.put("/:id", protect, upload.single("image"), updatePortfolio);
router.delete("/:id", protect, deletePortfolio);

module.exports = router;
