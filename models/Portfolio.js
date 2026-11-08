const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Residential", "Commercial", "Restaurant", "Office"],
    },
    location: { type: String },
    year: { type: String },
    area: { type: String },        // e.g. "1200 sqft"
    duration: { type: String },    // e.g. "3 months"
    client: { type: String },      // client name (optional)
    description: { type: String },
    // Cover image (main/thumbnail)
    image: { type: String, required: true },
    imagePublicId: { type: String, default: null },
    // Additional gallery images
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: null },
        caption: { type: String, default: "" },
      },
    ],
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

// Auto-generate slug from title
portfolioSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") + "-" + Date.now().toString().slice(-4);
  }
  next();
});

module.exports = mongoose.model("Portfolio", portfolioSchema);
