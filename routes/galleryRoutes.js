const express = require("express");
const router = express.Router();
const { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } = require("../controllers/galleryController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../utils/cloudinaryConfig");

const galleryUpload = upload.fields([
  { name: "beforeImage", maxCount: 1 },
  { name: "afterImage",  maxCount: 1 }
]);

router.get("/", getGalleryItems);
router.post("/", protect, galleryUpload, createGalleryItem);
router.put("/:id", protect, galleryUpload, updateGalleryItem);
router.delete("/:id", protect, deleteGalleryItem);

module.exports = router;
