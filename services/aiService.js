const ChatMessage = require("../models/ChatMessage");
const Lead = require("../models/Lead");
const KnowledgeRule = require("../models/KnowledgeRule");
const Portfolio = require("../models/Portfolio");

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
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
        return `ওরিয়া ইন্টেরিয়রের সাম্প্রতিক কিছু উল্লেখযোগ্য প্রজেক্ট:\n${projectTitles}\n\nআমাদের সমস্ত প্রজেক্ট ও পোর্টফোলিও গ্যালারি দেখতে ভিজিট করুন: https://oriainteriorbd.com/portfolio`;
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

  // Developer / ডেভলপার
  if (msg.includes("developer") || msg.includes("ডেভেলপার") || msg.includes("ডেভলপার") || msg.includes("বানিয়েছে") || msg.includes("তৈরি")) {
    return "ওরিয়া ইন্টেরিয়রের এই অফিশিয়াল ওয়েবসাইটটি অত্যন্ত দক্ষতার সাথে ডেভেলপ করেছেন নাঈম ইসলাম (Naim Islam / NetHist)। পোর্টফোলিও লিংক: https://nethist.online";
  }

  // Managing Director / CEO / পরিচালক / এমডি / ব্যবস্থাপনা পরিচালক
  if (msg.includes("পরিচালক") || msg.includes("পরিচালনা") || msg.includes("মালিক") || msg.includes("md") || msg.includes("ceo") || msg.includes("founder") || msg.includes("porichalok") || msg.includes("porichalona") || msg.includes("babosthapona") || msg.includes("ব্যবস্থাপনা")) {
    return "ওরিয়া ইন্টেরিয়রের প্রতিষ্ঠাতা ও ব্যবস্থাপনা পরিচালক (Managing Director & Founder) হলেন MD Sahin Hossain। আমাদের কোম্পানি সম্পর্কে বিস্তারিত জানতে ভিজিট করুন: https://oriainteriorbd.com/about";
  }

  // About Us / সম্পর্কে / বিস্তারিত
  if (msg.includes("সম্পর্কে") || msg.includes("about") || msg.includes("বিস্তারিত") || msg.includes("পরিচয়")) {
    return "ওরিয়া ইন্টেরিয়র (Oria Interior) বাংলাদেশের একটি অন্যতম বিশ্বস্ত প্রিমিয়াম আর্কিটেকচার ও ইন্টেরিয়র ডিজাইন ফার্ম। আমরা ১৩+ বছর ধরে আবাসিক, বাণিজ্যিক ও অফিস ডেকোরেশন সার্ভিস প্রদান করছি। আমাদের সম্পর্কে বিস্তারিত জানতে ভিজিট করুন: https://oriainteriorbd.com/about";
  }

  // Contact / কন্টাক্ট / ঠিকানা / ম্যাপ
  if (msg.includes("contact") || msg.includes("কন্টাক্ট") || msg.includes("ঠিকানা") || msg.includes("location") || msg.includes("address") || msg.includes("যোগাযোগ")) {
    return "আমাদের প্রধান অফিস: ৬৭, ইন্দিরা রোড, পশ্চিম রাজা বাজার, ঢাকা ১২১৫। আমাদের সকল যোগাযোগের মাধ্যম ও কন্টাক্ট ফরম পেতে কন্টাক্ট পেজে ভিজিট করুন: https://oriainteriorbd.com/contact";
  }

  // Blog / ব্লগ / আর্টিকেলে
  if (msg.includes("blog") || msg.includes("ব্লগ") || msg.includes("block") || msg.includes("পরামর্শ") || msg.includes("আর্টিকেল")) {
    return "ইন্টেরিয়র ডিজাইন টিপস ও আমাদের ট্রেন্ডিং ব্লগ পোস্টগুলো পড়তে সরাসরি ভিজিট করুন: https://oriainteriorbd.com/blog";
  }

  // Portfolio / প্রজেক্ট
  if (msg.includes("portfolio") || msg.includes("পোর্টফোলিও") || msg.includes("প্রজেক্ট") || msg.includes("ছবি")) {
    return "আমাদের সম্পন্ন করা আধুনিক বাসা, অফিস ও রেস্টুরেন্টের সব ডিজাইন প্রজেক্ট দেখতে ভিজিট করুন: https://oriainteriorbd.com/portfolio";
  }

  // Gallery / মেকওভার
  if (msg.includes("gallery") || msg.includes("গ্যালারি") || msg.includes("before") || msg.includes("মেকওভার")) {
    return "আমাদের সম্পন্ন কাজের আগের ও পরের (Before & After) আকর্ষণীয় ট্রান্সফরমেশন দেখতে গ্যালারি পেজে ভিজিট করুন: https://oriainteriorbd.com/gallery";
  }

  // Services / সেবা
  if (msg.includes("সার্ভিস") || msg.includes("service") || msg.includes("সেবা")) {
    return "ওরিয়া ইন্টেরিয়রের প্রধান সেবাসমূহ: \n১. রেসিডেন্সিয়াল (বাসা/অ্যাপার্টমেন্ট)\n২. কমার্শিয়াল ও অফিস ইন্টেরিয়র\n৩. আর্কিটেকচারাল ৩ডি পরিকল্পনা\n৪. কাস্টম ফার্নিচার।\nসব সার্ভিস দেখুন: https://oriainteriorbd.com/services";
  }

  // Cost / Price / খরচ / বাজেট / কোটেশন
  if (msg.includes("খরচ") || msg.includes("দাম") || msg.includes("cost") || msg.includes("price") || msg.includes("বাজেট") || msg.includes("quote") || msg.includes("কোটেশন")) {
    return "ইন্টেরিয়রের খরচ আপনার স্পেসের স্কয়ার ফিট ও উপাদান (Materials)-এর ওপর নির্ভর করে। আপনার স্পেসের ইন্সট্যান্ট কোটেশন হিসাব করতে ভিজিট করুন: https://oriainteriorbd.com/quote";
  }

  // Consultation / অ্যাপয়েন্টমেন্ট / ভিজিট
  if (msg.includes("কনসালটেশন") || msg.includes("appointment") || msg.includes("ভিজিট") || msg.includes("বুক")) {
    return "আমরা সম্পূর্ণ বিনামূল্যে প্রাথমিক সাইট মেজারমেন্ট ও কনসালটেশন সার্ভিস প্রদান করি। ফ্রি বুকিং দিতে ভিজিট করুন: https://oriainteriorbd.com/consultation";
  }

  // Greetings
  if (msg.includes("সালাম") || msg.includes("salam") || msg.includes("hello") || msg.includes("hi")) {
    return "আসসালামু আলাইকুম! ওরিয়া ইন্টেরিয়র (Oria Interior)-এ আপনাকে স্বাগতম। আমরা আপনার স্বপ্নের বাসা বা অফিস সাজাতে প্রফেশনাল ডিজাইন ও বাস্তবায়নে প্রস্তুত। আজ আপনাকে কীভাবে সহযোগিতা করতে পারি?";
  }

  return "ধন্যবাদ আপনার বার্তার জন্য! ওরিয়া ইন্টেরিয়র একটি প্রিমিয়াম আর্কিটেকচার ও ইন্টেরিয়র ডিজাইন ফার্ম। আমাদের সার্ভিস ও ফ্রি কনসালটেশনের জন্য ভিজিট করুন: https://oriainteriorbd.com/consultation অথবা কল/হোয়াটসঅ্যাপ করুন 01334003388 এ।";
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
  let contentsPayload = [];
  if (sessionId) {
    try {
      const pastHistory = await ChatMessage.find({ sessionId }).sort({ createdAt: -1 }).limit(10);
      pastHistory.reverse();

      let expectedRole = "user";
      for (const m of pastHistory) {
        if (!m.text || !m.text.trim()) continue;
        const role = m.role === "user" ? "user" : "model";
        if (role === expectedRole) {
          contentsPayload.push({
            role,
            parts: [{ text: m.text.trim() }],
          });
          expectedRole = expectedRole === "user" ? "model" : "user";
        }
      }
    } catch (err) {
      console.error("Error loading chat history:", err.message);
    }
  }

  if (contentsPayload.length > 0 && contentsPayload[contentsPayload.length - 1].role === "user") {
    contentsPayload.pop();
  }

  contentsPayload.push({
    role: "user",
    parts: [{ text: userMessage.trim() }],
  });

  // E. STEP 2: System Prompt Definition (Strictly Oria Interior Representative - NO mention of AI/Bot)
  const systemPromptText = `আপনি "Oria Interior" (ওরিয়া ইন্টেরিয়র)-এর একজন অফিশিয়াল প্রফেশনাল আর্কিটেকচার ও ইন্টেরিয়র এক্সিকিউটিভ প্রতিনিধি।

কোম্পানি ও টিম পরিচিতি:
- প্রতিষ্ঠাতা ও ব্যবস্থাপনা পরিচালক (Managing Director & Founder): MD Sahin Hossain (আমাদের পরিচালনা টিম পরিচিতি পেজ: https://oriainteriorbd.com/about)।
- ওয়েবসাইট ডেভেলপার (Website Developer): নাঈম ইসলাম (Naim Islam / NetHist - https://nethist.online)।
- প্রধান অফিস ঠিকানা: ৬৭, ইন্দিরা রোড, পশ্চিম রাজা বাজার, ঢাকা ১২১৫।
- হটলাইন/হোয়াটসঅ্যাপ: 01334003388 (https://wa.me/8801334003388)
- অভিজ্ঞতা: ১৩+ বছরের সফল অভিজ্ঞতা ও ১০০+ সম্পন্ন প্রজেক্ট।

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
- অফিস ঠিকানা, ম্যাপ ও পরিচিতি (Contact): https://oriainteriorbd.com/contact
- ব্লগ ও ডিজাইন টিপস (Blog): https://oriainteriorbd.com/blog
- সাধারণ প্রশ্ন উত্তর (FAQ): https://oriainteriorbd.com/faq
- অফিশিয়াল হোয়াটসঅ্যাপ (WhatsApp): https://wa.me/8801334003388

গুরুত্বপূর্ণ নির্দেশনাবলী:
১. কখনই বলবেন না যে আপনি AI, Bot বা Automation। সর্বদা সরাসরি ওরিয়া ইন্টেরিয়র টিমের কর্মকর্তা হিসেবে উত্তর দেবেন।
২. উত্তর সবসময় অত্যন্ত বিনীত, প্রফেশনাল ও সহজ বাংলায় দেবেন (২৫-৫০ শব্দ)।
৩. ওয়েবসাইট ডেভেলপ করেছে কে জানতে চাইলে নাঈম ইসলাম (Naim Islam / NetHist - https://nethist.online) নাম ও লিংক দেবেন। ওরিয়া ইন্টেরিয়রের ব্যবস্থাপনা পরিচালক (MD/Founder) কে জানতে চাইলে MD Sahin Hossain নাম ও About Us পেজ লিংক (https://oriainteriorbd.com/about) দেবেন।
৪. কন্টাক্ট, ব্লগ, পোর্টফোলিও বা সার্ভিস পেজ দেখতে চাইলে সরাসরি সংশ্লিষ্ট পেজের পিওর URL লিংক যোগ করে দেবেন।
৫. যেকোনো ওয়েবসাইটের লিংক লেখার সময় লিংকের সাথে গায়ে-গায়ে কোনো বন্ধনী (parenthesis ')') বা চিহ্ন বা ডট যোগ করবেন না। লিংকটি আলাদাভাবে স্পষ্ট করে লিখবেন।
৬. প্রতি উত্তরের শেষে বিনীতভাবে ক্লায়েন্টের ফোন নম্বর বা সাইটের ঠিকানা চেয়ে নেবেন।`;

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
        const textPart = candidateParts.find((p) => p.text && !p.thought) || candidateParts[candidateParts.length - 1];
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
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`[AI Service] Model ${modelName} returned HTTP ${response.status}:`, errData.error?.message || response.statusText);
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
