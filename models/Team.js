const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
