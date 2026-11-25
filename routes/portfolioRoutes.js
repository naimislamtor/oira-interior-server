const express = require("express");
const router = express.Router();
const {
  getAllPortfolio, getPortfolioById, createPortfolio,
  updatePortfolio, deletePortfolio, addGalleryImages, deleteGalleryImage
} = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllPortfolio);
router.get("/:id", getPortfolioById);
router.post("/", protect, createPortfolio);
router.put("/:id", protect, updatePortfolio);
router.delete("/:id", protect, deletePortfolio);
router.post("/:id/images", protect, addGalleryImages);
router.delete("/:id/images/:imageId", protect, deleteGalleryImage);

module.exports = router;
