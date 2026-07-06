const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    city: { type: String },
    service: { type: String, required: true },
    projectSize: { type: String },
    rooms: { type: String },
    projectAddress: { type: String },
    budget: { type: String, required: true },
    startDate: { type: String },
    deadline: { type: String },
    description: { type: String, required: true },
    heardFrom: { type: String },
    files: [{ type: String }],
    status: {
      type: String,
      enum: ["new", "reviewed", "quoted", "accepted", "rejected"],
      default: "new",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quote", quoteSchema);
