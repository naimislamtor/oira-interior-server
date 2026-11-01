const express = require("express");
const router = express.Router();
const { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } = require("../controllers/galleryController");
const { protect } = require("../middleware/authMiddleware");
const { createUploader } = require("../utils/cloudinaryConfig");

const upload = createUploader("gallery");

const handleUpload = (req, res, next) => {
  upload.fields([{ name: "beforeImage", maxCount: 1 }, { name: "afterImage", maxCount: 1 }])(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get("/", getGalleryItems);
router.post("/", protect, handleUpload, createGalleryItem);
router.put("/:id", protect, handleUpload, updateGalleryItem);
router.delete("/:id", protect, deleteGalleryItem);

module.exports = router;
