const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "Valued Client",
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    source: {
      type: String,
      enum: ["Website Live Chat", "Facebook Messenger", "WhatsApp", "Instagram", "Manual Entry"],
      default: "Website Live Chat",
    },
    serviceNeeded: {
      type: String,
      default: "Interior Design & Consultation",
    },
    details: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Consultation Scheduled", "In Progress", "Completed", "Cancelled"],
      default: "New",
    },
    notes: {
      type: String,
      default: "",
    },
    sessionId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
