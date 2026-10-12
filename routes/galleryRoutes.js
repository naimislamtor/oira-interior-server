const express = require("express");
const router = express.Router();
const {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require("../controllers/galleryController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getGalleryItems);
router.post("/", protect, createGalleryItem);
router.put("/:id", protect, updateGalleryItem);
router.delete("/:id", protect, deleteGalleryItem);

module.exports = router;
