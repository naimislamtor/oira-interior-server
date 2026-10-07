const express = require("express");
const router = express.Router();
const {
  verifyMetaWebhook,
  handleMetaWebhook,
  handleWhatsAppWebhook,
} = require("../controllers/webhookController");

router.get("/meta", verifyMetaWebhook);
router.post("/meta", handleMetaWebhook);
router.post("/whatsapp", handleWhatsAppWebhook);

module.exports = router;
