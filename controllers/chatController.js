const { generateAIReply } = require("../services/aiService");
const ChatMessage = require("../models/ChatMessage");
const { addLiveLog } = require("../utils/logger");

// Handles live web chat send message
exports.sendWebChatMessage = async (req, res) => {
  try {
    const { sessionId, message, userName } = req.body;

    if (!sessionId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: "sessionId and message are required." });
    }

    const replyText = await generateAIReply({
      sessionId,
      userMessage: message.trim(),
      platform: "website",
      userName: userName || null,
    });

    addLiveLog("Website Live Chat", "WEB_CHAT", sessionId, message.trim(), replyText, "Success");

    return res.json({
      success: true,
      data: {
        reply: replyText,
        sessionId,
      },
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    addLiveLog("Website Live Chat", "ERROR", req.body?.sessionId || "Unknown", req.body?.message || "", error.message, "Failed");
    return res.status(500).json({ success: false, message: "Server error generating response" });
  }
};

// Fetches history for a session
exports.getWebChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID required" });
    }

    const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 }).limit(50);

    return res.json({
      success: true,
      messages: messages.map((m) => ({
        id: m._id,
        role: m.role,
        text: m.text,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get History Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching history" });
  }
};
