const express = require("express");
const router = express.Router();
const { getAllPortfolio, getPortfolioById, createPortfolio, updatePortfolio, deletePortfolio } = require("../controllers/portfolioController");
const { protect } = require("../middleware/authMiddleware");
const { createUploader } = require("../utils/cloudinaryConfig");

const upload = createUploader("portfolio");

const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get("/", getAllPortfolio);
router.get("/:id", getPortfolioById);
router.post("/", protect, handleUpload, createPortfolio);
router.put("/:id", protect, handleUpload, updatePortfolio);
router.delete("/:id", protect, deletePortfolio);

module.exports = router;
