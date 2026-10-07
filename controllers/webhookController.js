const { generateAIReply } = require("../services/aiService");
const Lead = require("../models/Lead");

/**
 * Send Facebook Messenger message using Meta Graph API
 */
async function sendMetaGraphApiMessage(recipientPsid, textReply) {
  const pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN || process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken) {
    console.log("[Meta Graph API] Notice: FB_PAGE_ACCESS_TOKEN not set in .env. Skipping Graph API request.");
    return;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientPsid },
        message: { text: textReply },
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[Meta Graph API] Auto-reply successfully sent to PSID ${recipientPsid}`);
    } else {
      console.error("[Meta Graph API Error]", data.error?.message || data);
    }
  } catch (error) {
    console.error("[Meta Graph API Error]", error.message);
  }
}

// Meta (Facebook / Instagram) Webhook Verification (GET)
exports.verifyMetaWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "oria_interior_meta_secret_2026";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe") {
      console.log("[Webhook] Meta Webhook Verified Successfully!");
      return res.status(200).send(challenge);
    }
  }
  return res.status(400).send("Bad request");
};

// Meta (Facebook Messenger / Instagram DM) Event Receiver (POST)
exports.handleMetaWebhook = async (req, res) => {
  try {
    const body = req.body;
    console.log("[Meta Webhook Event Received]", JSON.stringify(body));

    // Send 200 OK fast to Meta
    res.status(200).send("EVENT_RECEIVED");

    // 1. Handle Meta Console Test Button Payloads ({ sample: { field: "messages", value: ... } })
    if (body.sample) {
      const sampleField = body.sample.field;
      const value = body.sample.value;

      if (sampleField === "messages" && value) {
        const senderId = value.sender?.id || "12345";
        const messageText = value.message?.text || "test_message";
        console.log(`[Meta Console Test Message] from ${senderId}: "${messageText}"`);

        const reply = await generateAIReply({
          sessionId: `meta_${senderId}`,
          senderId,
          userMessage: messageText,
          platform: "facebook",
        });

        await sendMetaGraphApiMessage(senderId, reply);
      }
      return;
    }

    // 2. Handle Live Webhook Payloads (body.entry)
    if (!body.entry || !Array.isArray(body.entry)) return;

    for (const entry of body.entry) {
      const messagingList = entry.messaging || entry.standby || [];
      for (const messagingEvent of messagingList) {
        if (!messagingEvent) continue;
        if (messagingEvent.message?.is_echo) continue;

        const senderPsid = messagingEvent.sender?.id;
        const userMsgText =
          messagingEvent.message?.text ||
          messagingEvent.message?.quick_reply?.payload ||
          messagingEvent.postback?.title ||
          messagingEvent.postback?.payload;

        if (senderPsid && userMsgText) {
          console.log(`[Meta Webhook] Incoming Message from PSID ${senderPsid}: "${userMsgText}"`);

          const platform = body.object === "instagram" ? "instagram" : "facebook";
          const reply = await generateAIReply({
            sessionId: `meta_${senderPsid}`,
            senderId: senderPsid,
            userMessage: userMsgText,
            platform,
          });

          console.log(`[Meta Webhook] AI Reply prepared for ${senderPsid}: "${reply}"`);
          await sendMetaGraphApiMessage(senderPsid, reply);
        }
      }
    }
  } catch (error) {
    console.error("Meta Webhook Handler Error:", error.message);
  }
};

// WhatsApp Webhook (POST)
exports.handleWhatsAppWebhook = async (req, res) => {
  try {
    const body = req.body;
    console.log("[WhatsApp Webhook] Incoming event:", JSON.stringify(body, null, 2));

    res.status(200).send({ success: true });

    const entry = body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message && message.text) {
      const fromPhone = message.from;
      const userText = message.text.body;

      console.log(`[WhatsApp Webhook] Message from ${fromPhone}: "${userText}"`);

      await Lead.findOneAndUpdate(
        { phone: fromPhone },
        {
          $set: {
            name: entry?.contacts?.[0]?.profile?.name || "WhatsApp Client",
            phone: fromPhone,
            source: "WhatsApp",
            details: userText,
          },
        },
        { upsert: true, new: true }
      );

      await generateAIReply({
        sessionId: `wa_${fromPhone}`,
        senderId: fromPhone,
        userMessage: userText,
        platform: "whatsapp",
      });
    }
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return res.status(500).send("WhatsApp Error");
  }
};
