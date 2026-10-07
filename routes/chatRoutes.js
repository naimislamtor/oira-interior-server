const express = require("express");
const router = express.Router();
const { sendWebChatMessage, getWebChatHistory } = require("../controllers/chatController");

router.post("/send", sendWebChatMessage);
router.get("/history/:sessionId", getWebChatHistory);

module.exports = router;
