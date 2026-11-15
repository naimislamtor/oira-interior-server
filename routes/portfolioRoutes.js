const express = require("express");
const router = express.Router();
const { getAllPortfolio, getPortfolioById, createPortfolio, updatePortfolio, deletePortfolio, addGalleryImages, deleteGalleryImage } = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");
const { createUploader } = require("../utils/cloudinaryConfig");

const singleUpload = createUploader("portfolio").single("image");
const multiUpload  = createUploader("portfolio").array("images", 20);

const handleSingle = (req, res, next) => singleUpload(req, res, err => err ? next(err) : next());
const handleMulti  = (req, res, next) => multiUpload(req, res, err => err ? next(err) : next());

router.get("/", getAllPortfolio);
router.get("/:id", getPortfolioById);
router.post("/", protect, handleSingle, createPortfolio);
router.put("/:id", protect, handleSingle, updatePortfolio);
router.delete("/:id", protect, deletePortfolio);
router.post("/:id/images", protect, handleMulti, addGalleryImages);
router.delete("/:id/images/:imageId", protect, deleteGalleryImage);

module.exports = router;
