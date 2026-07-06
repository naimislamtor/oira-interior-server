const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true },
    service: { type: String },
    budget: { type: String },
    consultationType: { type: String, required: true },
    projectDescription: { type: String, required: true },
    requirements: { type: String },
    questions: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "completed"],
      default: "new",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Consultation", consultationSchema);
