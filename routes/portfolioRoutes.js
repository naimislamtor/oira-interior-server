const express = require("express");
const router = express.Router();
const {
  getAllPortfolio, getPortfolioById, createPortfolio,
  updatePortfolio, deletePortfolio, addGalleryImages, deleteGalleryImage
} = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../utils/cloudinaryConfig");

router.get("/", getAllPortfolio);
router.get("/:id", getPortfolioById);
router.post("/", protect, upload.single("image"), createPortfolio);
router.put("/:id", protect, upload.single("image"), updatePortfolio);
router.delete("/:id", protect, deletePortfolio);
router.post("/:id/images", protect, upload.array("images", 20), addGalleryImages);
router.delete("/:id/images/:imageId", protect, deleteGalleryImage);

module.exports = router;
