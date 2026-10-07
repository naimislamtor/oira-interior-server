const ChatMessage = require("../models/ChatMessage");
const Lead = require("../models/Lead");
const KnowledgeRule = require("../models/KnowledgeRule");
const Portfolio = require("../models/Portfolio");

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.8-flash-lite",
  "gemini-2.5-flash",
];


/**
 * 1. Check MongoDB KnowledgeRule & Portfolio database first before calling AI
 */
async function searchDBKnowledge(userMessage) {
  const query = (userMessage || "").toLowerCase().trim();
  if (!query) return null;

  try {
    // A. Check custom KnowledgeRule collection in database
    const rules = await KnowledgeRule.find({});
    for (const rule of rules) {
      const match = rule.keywords.some((kw) => query.includes(kw.toLowerCase()));
      if (match) {
        console.log(`[DB Match Found] Triggered rule: "${rule.question}"`);
        return rule.answer;
      }
    }

    // B. Check Portfolio collection in database
    if (query.includes("পোর্টফোলিও") || query.includes("portfolio") || query.includes("প্রজেক্ট") || query.includes("কাজ")) {
      const projects = await Portfolio.find({}).limit(4);
      if (projects.length > 0) {
        const projectTitles = projects.map((p) => `- ${p.title} (${p.category || "Residential"})`).join("\n");
        return `ওরিয়া ইন্টেরিয়রের সাম্প্রতিক কিছু উল্লেখযোগ্য প্রজেক্ট:\n${projectTitles}\n\nআমাদের সমস্ত প্রজেক্ট গ্যালারি দেখতে ওয়েবসাইট গ্যালারি অপশন চেক করুন অথবা আপনার ফোন নম্বর দিয়ে অ্যাপয়েন্টমেন্ট বুক করুন।`;
      }
    }
  } catch (err) {
    console.error("DB Knowledge Search Error:", err.message);
  }

  return null;
}

/**
 * 2. Smart Fallback response generator for Oria Interior when Gemini API is unavailable
 */
function getSmartFallbackReply(userMessage) {
  const msg = (userMessage || "").toLowerCase().trim();

  if (msg.includes("সালাম") || msg.includes("salam") || msg.includes("hello") || msg.includes("hi")) {
    return "আসসালামু আলাইকুম! ওরিয়া ইন্টেরিয়র (Oria Interior)-এ আপনাকে স্বাগতম। আমরা আপনার স্বপ্নের বাসা বা অফিস সাজাতে প্রফেশনাল ডিজাইন ও বাস্তবায়নে প্রস্তুত। আজ আপনাকে কীভাবে সহযোগিতা করতে পারি?";
  }

  if (msg.includes("ঠিকানা") || msg.includes("কোথায়") || msg.includes("location") || msg.includes("address")) {
    return "আমাদের প্রধান কার্যালয় ঢাকা, বাংলাদেশে অবস্থিত। আপনার সুবিধার্থে আমাদের ইন্টেরিয়র কনসালট্যান্ট আপনার সাইট সরাসরি ভিজিট করবে। অ্যাপয়েন্টমেন্টের জন্য আপনার ফোন নম্বর জানান।";
  }

  if (msg.includes("খরচ") || msg.includes("দাম") || msg.includes("cost") || msg.includes("price") || msg.includes("বাজেট")) {
    return "ইন্টেরিয়রের খরচ সাধারণত স্কয়ার ফিট, ম্যাটেরিয়াল চয়েস এবং ডিজাইনের ওপর নির্ভর করে। সম্পূর্ণ ফ্রি কনসালটেশন ও স্কয়ার ফিট আনুমানিক বাজেট জানতে আপনার ফোন নম্বর অথবা সাইটের মাপ শেয়ার করুন।";
  }

  if (msg.includes("সার্ভিস") || msg.includes("service") || msg.includes("কাজ")) {
    return "ওরিয়া ইন্টেরিয়র সার্ভিসসমূহ: \n১. রেসিডেন্সিয়াল ইন্টেরিয়র (বাসা/অ্যাপার্টমেন্ট)\n২. কমার্শিয়াল ও অফিস ইন্টেরিয়র\n৩. আর্কিটেকচারাল ৩ডি ডিজাইন\n৪. কাস্টম ফার্নিচার ও মেকওভার।\nআপনি কোন ধরণের প্রজেক্ট করতে চাচ্ছেন?";
  }

  if (msg.includes("ফোন") || msg.includes("contact") || msg.includes("যোগাযোগ") || msg.includes("নম্বর")) {
    return "আমাদের সাথে সরাসরি কথা বলতে কল বা হোয়াটসঅ্যাপ করুন: 01334003388 (অথবা আপনার ফোন নম্বরটি এখানে লিখে দিন, আমাদের টিম অতি শীঘ্রই আপনার সাথে যোগাযোগ করবে)।";
  }

  return "ধন্যবাদ আপনার বার্তার জন্য! ওরিয়া ইন্টেরিয়র একটি প্রিমিয়াম আর্কিটেকচার ও ইন্টেরিয়র ডিজাইন ফার্ম। আমাদের সার্ভিস ও ফ্রি কনসালটেশনের জন্য আপনার ফোন নম্বর অথবা ঠিকানা লিখে দিন।";
}

/**
 * 3. Extract phone number and email from message text if available
 */
function extractLeadInfo(text) {
  const phoneRegex = /(?:\+88)?01[3-9]\d{8}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  const foundPhones = text.match(phoneRegex);
  const foundEmails = text.match(emailRegex);

  return {
    phone: foundPhones ? foundPhones[0] : null,
    email: foundEmails ? foundEmails[0] : null,
  };
}

/**
 * Clean URLs in reply text to remove trailing parentheses or punctuation attached to URLs
 * e.g., "https://oriainteriorbd.com/contact)" -> "https://oriainteriorbd.com/contact )"
 */
function cleanURLPunctuation(text) {
  if (!text) return text;
  return text.replace(/(https?:\/\/[^\s]+)/g, (match) => {
    const cleaned = match.replace(/[).,;!\]]+$/, '');
    const trailing = match.slice(cleaned.length);
    return trailing ? `${cleaned} ${trailing}` : cleaned;
  });
}

/**
 * Main reply generator for Live Web Chat, Facebook Messenger, and WhatsApp
 */
async function generateAIReply({ sessionId, userMessage, platform = "website", senderId = null, userName = null }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY || process.env.GOOGLE_API_KEY || "";

  // A. Save user message to database history
  if (sessionId) {
    try {
      await ChatMessage.create({
        sessionId,
        senderId,
        role: "user",
        text: userMessage,
        platform,
      });
    } catch (e) {
      console.error("Failed to store user message:", e.message);
    }
  }

  // B. Check for Lead extraction (Phone/Email detection)
  const extracted = extractLeadInfo(userMessage);
  if (extracted.phone || extracted.email) {
    try {
      await Lead.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            name: userName || "Live Chat Client",
            source: platform === "website" ? "Website Live Chat" : platform === "facebook" ? "Facebook Messenger" : "WhatsApp",
            details: `User mentioned: "${userMessage}"`,
            ...(extracted.phone && { phone: extracted.phone }),
            ...(extracted.email && { email: extracted.email }),
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("Lead saving error:", err.message);
    }
  }

  // C. STEP 1: Search MongoDB Knowledge DB First!
  const dbMatch = await searchDBKnowledge(userMessage);
  if (dbMatch) {
    const cleanMatch = cleanURLPunctuation(dbMatch);
    if (sessionId) {
      await ChatMessage.create({
        sessionId,
        senderId,
        role: "assistant",
        text: cleanMatch,
        platform,
      });
    }
    return cleanMatch;
  }

  // D. Fetch past conversation history (last 10 messages)
  let historyMessages = [];
  if (sessionId) {
    try {
      const pastHistory = await ChatMessage.find({ sessionId }).sort({ createdAt: -1 }).limit(10);
      pastHistory.reverse();
      historyMessages = pastHistory.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));
    } catch (err) {
      console.error("Error loading chat history:", err.message);
    }
  }

  // E. STEP 2: System Prompt Definition (Strictly Oria Interior Representative - NO mention of AI/Bot)
  const systemPromptText = `আপনি "Oria Interior" (ওরিয়া ইন্টেরিয়র)-এর একজন অফিশিয়াল প্রফেশনাল আর্কিটেকচার ও ইন্টেরিয়র এক্সিকিউটিভ প্রতিনিধি।

আপনার কাছে আমাদের পুরো ওয়েবসাইট (https://oriainteriorbd.com)-এর সমস্ত পেজ ও তথ্যের অ্যাক্সেস রয়েছে:

ওয়েবসাইট সায়টম্যাপ ও লিংকসমূহ (Sitemap & Direct Links):
- মূল ওয়েবসাইট (Home): https://oriainteriorbd.com
- সব সেবা ও সার্ভিস (Services): https://oriainteriorbd.com/services
  * রেসিডেন্সিয়াল ইন্টেরিয়র (ফ্ল্যাট/বাসা): https://oriainteriorbd.com/services/residential
  * কমার্শিয়াল ও অফিস ইন্টেরিয়র: https://oriainteriorbd.com/services/commercial
  * রেস্টুরেন্ট ডেকোরেশন: https://oriainteriorbd.com/services/restaurant
  * কাস্টম ফার্নিচার ও মেকওভার: https://oriainteriorbd.com/services/furniture
  * ৩ডি আর্কিটেকচারাল ভিজ্যুয়ালাইজেশন: https://oriainteriorbd.com/services/visualization
- সম্পন্ন কাজ ও প্রজেক্ট (Portfolio): https://oriainteriorbd.com/portfolio
- আগে ও পরের মেকওভার গ্যালারি (Gallery): https://oriainteriorbd.com/gallery
- ফ্রি সাইট কনসালটেশন বুকিং: https://oriainteriorbd.com/consultation
- বাজেট ও ইনস্ট্যান্ট খরচ কোটেশন: https://oriainteriorbd.com/quote
- অফিস ঠিকানা ও পরিচিতি (Contact): https://oriainteriorbd.com/contact
- ব্লগ ও ডিজাইন টিপস (Blog): https://oriainteriorbd.com/blog
- সাধারণ প্রশ্ন উত্তর (FAQ): https://oriainteriorbd.com/faq
- অফিশিয়াল হোয়াটসঅ্যাপ (WhatsApp): https://wa.me/8801334003388

গুরুত্বপূর্ণ নির্দেশনাবলী:
১. কখনই বলবেন না যে আপনি AI, Bot বা Automation। সর্বদা সরাসরি ওরিয়া ইন্টেরিয়র টিমের কর্মকর্তা হিসেবে উত্তর দেবেন।
২. উত্তর সবসময় অত্যন্ত বিনীত, প্রফেশনাল ও সহজ বাংলায় দেবেন (২৫-৫০ শব্দ)।
৩. টেক্সটে সাধারণ প্রশ্নের উত্তর দেবেন। তবে ক্লায়েন্ট যদি পোর্টফোলিও, গ্যালারি, কন্টাক্ট বা বুকিং পেজ দেখতে চায়—সরাসরি উপরের সংশ্লিষ্ট ওয়েবসাইটের লিংক যুক্ত করে দেবেন।
৪. যেমন: পোর্টফোলিও দেখতে চাইলে https://oriainteriorbd.com/portfolio লিংকটি দেবেন; সার্ভিস দেখতে চাইলে https://oriainteriorbd.com/services লিংকটি দেবেন; অ্যাপয়েন্টমেন্টের জন্য https://oriainteriorbd.com/consultation দেবেন।
৫. হোয়াটসঅ্যাপে সরাসরি কথা বলতে চাইলে https://wa.me/8801334003388 লিংকটি দেবেন।
৬. যেকোনো ওয়েবসাইটের লিংক লেখার সময় লিংকের সাথে গায়ে-গায়ে কোনো বন্ধনী (parenthesis ')') বা চিহ্ন বা ডট যোগ করবেন না। লিংকটি আলাদাভাবে স্পেস দিয়ে স্পষ্ট করে লিখবেন।
৭. প্রতি উত্তরের শেষে বিনীতভাবে ক্লায়েন্টের ফোন নম্বর বা সাইটের ঠিকানা চেয়ে নেবেন।`;

  // If no Gemini API key configured, use local smart fallback
  if (!apiKey) {
    const fallbackText = getSmartFallbackReply(userMessage);
    if (sessionId) {
      await ChatMessage.create({
        sessionId,
        senderId,
        role: "assistant",
        text: fallbackText,
        platform,
      });
    }
    return fallbackText;
  }

  // Call Gemini REST API
  const contentsPayload = [
    ...historyMessages.slice(0, historyMessages.length - 1),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const requestBody = {
    systemInstruction: { parts: [{ text: systemPromptText }] },
    contents: contentsPayload,
  };

  for (const modelName of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateParts = data?.candidates?.[0]?.content?.parts || [];
        const textPart = candidateParts.find((p) => p.text && !p.thought) || candidateParts[0];
        const aiResponseText = textPart?.text;

        if (aiResponseText && aiResponseText.trim()) {
          const finalReply = cleanURLPunctuation(aiResponseText.trim());

          if (sessionId) {
            await ChatMessage.create({
              sessionId,
              senderId,
              role: "assistant",
              text: finalReply,
              platform,
            });
          }
          return finalReply;
        }
      }
    } catch (error) {
      console.log(`[AI Service] Error with model ${modelName}:`, error.message);
    }
  }

  const fallbackText = cleanURLPunctuation(getSmartFallbackReply(userMessage));
  if (sessionId) {
    await ChatMessage.create({
      sessionId,
      senderId,
      role: "assistant",
      text: fallbackText,
      platform,
    });
  }
  return fallbackText;
}

module.exports = {
  generateAIReply,
  searchDBKnowledge,
  getSmartFallbackReply,
  extractLeadInfo,
};
