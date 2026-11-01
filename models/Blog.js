const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, index: true },
    category: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
        imagePublicId: { type: String, default: null },
    image: { type: String, required: true },
    readTime: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Blog", blogSchema);