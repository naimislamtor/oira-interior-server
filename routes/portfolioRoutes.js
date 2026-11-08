const express = require("express");
const router = express.Router();
const {
  getAllPortfolio, getPortfolioById, createPortfolio,
  updatePortfolio, deletePortfolio, addGalleryImages, deleteGalleryImage
} = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");
const { createUploader } = require("../utils/cloudinaryConfig");

const upload = createUploader("portfolio");

const handleSingle = (req, res, next) => {
  upload.single("image")(req, res, (err) => { if (err) return next(err); next(); });
};

const handleMultiple = (req, res, next) => {
  upload.array("images", 20)(req, res, (err) => { if (err) return next(err); next(); });
};

// Public routes
router.get("/", getAllPortfolio);
router.get("/:id", getPortfolioById);                       // supports _id or slug

// Admin routes
router.post("/", protect, handleSingle, createPortfolio);
router.put("/:id", protect, handleSingle, updatePortfolio);
router.delete("/:id", protect, deletePortfolio);

// Gallery image management
router.post("/:id/images", protect, handleMultiple, addGalleryImages);
router.delete("/:id/images/:imageId", protect, deleteGalleryImage);

module.exports = router;
