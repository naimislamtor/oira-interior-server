const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ["website", "facebook", "whatsapp", "instagram"],
      default: "website",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
