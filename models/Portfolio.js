const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Residential", "Commercial", "Restaurant", "Office"],
    },
    location: { type: String },
    year: { type: String },
    description: { type: String },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
