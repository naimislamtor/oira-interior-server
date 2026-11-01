const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    beforeImage: { type: String, required: true, trim: true },
    beforePublicId: { type: String, default: null },
    afterImage: { type: String, required: true, trim: true },
    afterPublicId: { type: String, default: null },
    category: { type: String, default: "Residential", trim: true },
    description: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
