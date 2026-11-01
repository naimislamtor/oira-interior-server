require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const FaqItem = require("./models/FaqItem");

const faqs = [
  // ── ক্যাটাগরি ১: কোম্পানি পরিচিতি ──
  { category: "কোম্পানি পরিচিতি", keywords: ["Oria Interior কী", "কোম্পানি সম্পর্কে বলুন", "oria interior ki", "company ki", "apnara ki koren"], answer: "Oria Interior একটি প্রফেশনাল ইন্টেরিয়র ডিজাইন স্টুডিও। আমরা বাসা, অফিস, রেস্টুরেন্ট ও বাণিজ্যিক স্থানের ডিজাইন ও সাজসজ্জার কাজ করি।" },
  { category: "কোম্পানি পরিচিতি", keywords: ["কোথায় অবস্থিত", "ঠিকানা কী", "office kothay", "address ki", "kothay achen"], answer: "Oria Interior-এর অফিস: ৬৭, ইন্দিরা রোড, পশ্চিম রাজাবাজার, ঢাকা ১২১৫। মানচিত্রে দেখুন: https://maps.google.com/?q=67+Indira+Road+West+Raja+Bazar+Dhaka+1215" },
  { category: "কোম্পানি পরিচিতি", keywords: ["কতদিন ধরে কাজ করছেন", "কত বছর", "kotdin dhore", "experience koto", "established kobe"], answer: "Oria Interior ১৩+ বছর ধরে ইন্টেরিয়র ডিজাইনের কাজ করে আসছে।" },
  { category: "কোম্পানি পরিচিতি", keywords: ["MD কে", "ব্যবস্থাপনা পরিচালক কে", "boss ke", "malik ke", "director ke"], answer: "Oria Interior-এর ব্যবস্থাপনা পরিচালক (MD) হলেন MD Sahin Hossain।" },
  { category: "কোম্পানি পরিচিতি", keywords: ["ওয়েবসাইট কী", "সাইট লিংক", "website ki", "website link", "web address"], answer: "Oria Interior-এর ওয়েবসাইট ভিজিট করুন — সার্ভিস, পোর্টফোলিও ও যোগাযোগের সব তথ্য পাবেন: https://www.oriainteriorbd.com" },
  { category: "কোম্পানি পরিচিতি", keywords: ["কতটি প্রজেক্ট", "কত কাজ", "koto project", "koto kaj", "completed projects"], answer: "Oria Interior এখন পর্যন্ত ১০০+ সফল প্রজেক্ট সম্পন্ন করেছে।" },
  { category: "কোম্পানি পরিচিতি", keywords: ["কতজন ক্লায়েন্ট", "কাস্টমার", "koto client", "happy clients", "satisfied customers"], answer: "Oria Interior-এর ৮০+ সন্তুষ্ট ক্লায়েন্ট রয়েছেন, যারা আমাদের সেরা পরিচয়।" },
  { category: "কোম্পানি পরিচিতি", keywords: ["ভিশন কী", "লক্ষ্য কী", "vision ki", "goal ki", "aim ki"], answer: "Oria Interior-এর লক্ষ্য: এ অঞ্চলের সবচেয়ে বিশ্বস্ত ইন্টেরিয়র ডিজাইন ব্র্যান্ড হওয়া — সাধারণ স্থানকে অসাধারণে রূপান্তরিত করা।" },
  { category: "কোম্পানি পরিচিতি", keywords: ["মিশন কী", "mission ki", "uddeshyo ki", "laksho ki"], answer: "Oria Interior-এর মিশন: সৎ যোগাযোগ, সৃজনশীলতা ও ক্লায়েন্ট সন্তুষ্টির মাধ্যমে উচ্চমানের ইন্টেরিয়র ডিজাইন সমাধান দেওয়া।" },
  { category: "কোম্পানি পরিচিতি", keywords: ["নির্ভরযোগ্য কিনা", "বিশ্বস্ত কিনা", "reliable kina", "trustworthy", "믿을 수 있나"], answer: "হ্যাঁ! Oria Interior-এর ১৩+ বছরের অভিজ্ঞতা, ১০০+ সফল প্রজেক্ট ও ১০০% সময়মতো ডেলিভারি আমাদের বিশ্বাসযোগ্যতার প্রমাণ।" },

  // ── ক্যাটাগরি ২: যোগাযোগ ──
  { category: "যোগাযোগ", keywords: ["ফোন নম্বর", "phone number", "fone number", "call korbo", "number deen"], answer: "Oria Interior-এ সরাসরি ফোন করুন: 01334003388" },
  { category: "যোগাযোগ", keywords: ["WhatsApp", "whatsapp number", "whatsapp e message", "wa number"], answer: "Oria Interior-এর WhatsApp: 01334003388 — সরাসরি চ্যাট করুন: https://wa.me/8801334003388" },
  { category: "যোগাযোগ", keywords: ["ইমেইল", "email", "mail address", "email address"], answer: "Oria Interior-এ ইমেইল করুন: info@oriainteriorbd.com — আমরা ২৪ ঘণ্টার মধ্যে উত্তর দিই।" },
  { category: "যোগাযোগ", keywords: ["অফিসের সময়", "কখন খোলা", "office time", "office hours", "kakhon khola"], answer: "Oria Interior অফিস খোলা: শনি থেকে বৃহস্পতিবার, সকাল ৯টা – সন্ধ্যা ৭টা।" },
  { category: "যোগাযোগ", keywords: ["শুক্রবার খোলা", "friday khola", "chuti er din", "holiday"], answer: "না, শুক্রবার Oria Interior অফিস বন্ধ থাকে। শনিবার থেকে যোগাযোগ করুন।" },
  { category: "যোগাযোগ", keywords: ["কত সময়ে রিপ্লাই", "উত্তর কবে পাবো", "reply koto time", "response time"], answer: "সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর পাবেন। দ্রুত সাড়ার জন্য WhatsApp করুন: 01334003388" },
  { category: "যোগাযোগ", keywords: ["ফ্রি কনসালটেশন", "বিনামূল্যে পরামর্শ", "free consultation", "free advice", "free meeting"], answer: "হ্যাঁ! Oria Interior বিনামূল্যে প্রথম কনসালটেশন দেয়। আজই বুক করুন: https://www.oriainteriorbd.com/consultation" },
  { category: "যোগাযোগ", keywords: ["যোগাযোগ পেজ", "contact page", "contact korbo kivabe"], answer: "Oria Interior-এর সকল যোগাযোগ তথ্য এক জায়গায় পাবেন: https://www.oriainteriorbd.com/contact" },

  // ── ক্যাটাগরি ৩: সার্ভিস ──
  { category: "সার্ভিস", keywords: ["কী কী সার্ভিস", "কী কী করেন", "services ki ki", "what services", "ki kaj koren"], answer: "Oria Interior ৬টি সার্ভিস দেয়: ১) রেসিডেন্শিয়াল ইন্টেরিয়র, ২) কমার্শিয়াল ইন্টেরিয়র, ৩) অফিস ইন্টেরিয়র, ৪) রেস্টুরেন্ট ইন্টেরিয়র, ৫) কাস্টম ফার্নিচার, ৬) ৩D ভিজুয়ালাইজেশন। বিস্তারিত: https://www.oriainteriorbd.com/services" },
  { category: "সার্ভিস", keywords: ["বাসার ডিজাইন", "ঘর সাজানো", "basar design", "ghor sajano", "flat decoration", "flat design", "residential"], answer: "হ্যাঁ! Oria Interior লিভিং রুম, বেডরুম, কিচেন, ডাইনিং সহ পুরো বাসার রেসিডেন্শিয়াল ইন্টেরিয়র ডিজাইন করে।" },
  { category: "সার্ভিস", keywords: ["অফিস ইন্টেরিয়র", "অফিস সাজানো", "office interior", "office design", "office sajano"], answer: "হ্যাঁ! Oria Interior মিটিং রুম, ওপেন ও প্রাইভেট ওয়ার্কস্পেস সহ সম্পূর্ণ অফিস ইন্টেরিয়র করে।" },
  { category: "সার্ভিস", keywords: ["রেস্টুরেন্ট ডিজাইন", "restaurant design", "restaurant interior", "cafe design", "ক্যাফে ডিজাইন"], answer: "হ্যাঁ! Oria Interior থিম, অ্যাম্বিয়্যান্স, সিটিং লেআউট ও লাইটিং সহ রেস্টুরেন্ট ও ক্যাফে ডিজাইন করে।" },
  { category: "সার্ভিস", keywords: ["কমার্শিয়াল ডিজাইন", "শোরুম ডিজাইন", "commercial interior", "showroom design", "shop design", "দোকান সাজানো"], answer: "হ্যাঁ! Oria Interior রিটেইল শপ, শোরুম ও বাণিজ্যিক স্থানের ব্র্যান্ড-অ্যালাইন্ড ডিজাইন করে।" },
  { category: "সার্ভিস", keywords: ["কাস্টম ফার্নিচার", "আসবাব বানানো", "custom furniture", "furniture banano", "wardrobe banano"], answer: "হ্যাঁ! Oria Interior কাস্টম সোফা, ওয়ার্ডরোব, ক্যাবিনেট, ডাইনিং ও অফিস ফার্নিচার তৈরি করে।" },
  { category: "সার্ভিস", keywords: ["3D ভিজুয়ালাইজেশন", "3d design", "3d render", "3d visualization", "visualization ki"], answer: "Oria Interior কাজ শুরুর আগেই ফটো-রিয়েলিস্টিক 3D রেন্ডার তৈরি করে দেয় — আগেই দেখুন স্পেস কেমন হবে।" },
  { category: "সার্ভিস", keywords: ["ক্লিনিক ডিজাইন", "চেম্বার ডিজাইন", "clinic design", "chamber design", "hospital design"], answer: "হ্যাঁ! Oria Interior কমার্শিয়াল ইন্টেরিয়র সার্ভিসের আওতায় ক্লিনিক ও চেম্বারের ডিজাইনও করে।" },

  // ── ক্যাটাগরি ৪: খরচ ও বাজেট ──
  { category: "খরচ ও বাজেট", keywords: ["খরচ কত", "দাম কত", "মূল্য কত", "cost ki", "price ki", "rate ki", "koto taka lagbe"], answer: "খরচ নির্ভর করে স্পেসের আকার, ডিজাইনের ধরন ও ম্যাটেরিয়ালের উপর। সঠিক বাজেট জানতে WhatsApp করুন: 01334003388" },
  { category: "খরচ ও বাজেট", keywords: ["বাজেটে কাজ করেন", "সাশ্রয়ী", "budget e kaj", "affordable", "kom taka", "cheap"], answer: "হ্যাঁ! Oria Interior ক্লায়েন্টের বাজেট অনুযায়ী সর্বোত্তম ডিজাইন সমাধান দেয়।" },
  { category: "খরচ ও বাজেট", keywords: ["সর্বনিম্ন খরচ", "কত টাকা থেকে", "minimum cost", "starting price", "sorbonimno mulo"], answer: "সর্বনিম্ন বাজেট প্রজেক্টভেদে আলাদা হয়। আপনার বাজেট জানান, সেরা পরামর্শ পাবেন — WhatsApp: 01334003388" },
  { category: "খরচ ও বাজেট", keywords: ["পেমেন্ট পদ্ধতি", "কীভাবে পেমেন্ট", "payment method", "kivabe payment dibo", "payment system"], answer: "পেমেন্ট পদ্ধতির বিস্তারিত জানতে সরাসরি কথা বলুন — ফোন: 01334003388" },
  { category: "খরচ ও বাজেট", keywords: ["কিস্তিতে পেমেন্ট", "ইএমআই", "installment", "kisti te payment", "emi", "monthly payment"], answer: "কিস্তি সুবিধা সম্পর্কে বিস্তারিত জানতে যোগাযোগ করুন — WhatsApp: 01334003388" },
  { category: "খরচ ও বাজেট", keywords: ["কোটেশন", "দরপত্র", "quotation", "estimate", "budget jante chai"], answer: "হ্যাঁ! Oria Interior বিনামূল্যে কোটেশন দেয়। আজই অনুরোধ করুন: https://www.oriainteriorbd.com/quote" },

  // ── ক্যাটাগরি ৫: সময় ও প্রক্রিয়া ──
  { category: "সময় ও প্রক্রিয়া", keywords: ["কতদিন লাগে", "সময় কত", "koto din lagbe", "how long", "somoy koto", "time ki"], answer: "একটি রুম: ২–৪ সপ্তাহ, পুরো ফ্ল্যাট: ৪–৮ সপ্তাহ। প্রজেক্টের আকার অনুযায়ী সময় পরিবর্তিত হয়।" },
  { category: "সময় ও প্রক্রিয়া", keywords: ["কাজ শুরু কবে", "kaj shuru kobe", "when start", "project start"], answer: "চুক্তির পর সাধারণত ১–২ সপ্তাহের মধ্যে কাজ শুরু হয়।" },
  { category: "সময় ও প্রক্রিয়া", keywords: ["কাজের ধাপ", "প্রক্রিয়া কী", "process ki", "working process", "kaj er dhopon"], answer: "পরামর্শ ও পরিকল্পনা → ডিজাইন তৈরি → অনুমোদন → বাস্তবায়ন → চূড়ান্ত প্রদর্শন।" },
  { category: "সময় ও প্রক্রিয়া", keywords: ["কাজ শুরুতে কী লাগে", "শুরু করতে কী লাগবে", "kaj shuru korte ki lagbe", "requirements"], answer: "প্রথমে কনসালটেশন, তারপর স্পেসের পরিমাপ ও ডিজাইন পরিকল্পনা তৈরি করা হয়।" },
  { category: "সময় ও প্রক্রিয়া", keywords: ["কাজ দেখতে পারবো", "পরিদর্শন", "kaj dekhte parbo", "site visit", "progress dekhbo"], answer: "হ্যাঁ! নিয়মিত আপডেট দেওয়া হয় এবং ক্লায়েন্ট যেকোনো সময় সাইট ভিজিট করতে পারেন।" },

  // ── ক্যাটাগরি ৬: ডিজাইন ও স্টাইল ──
  { category: "ডিজাইন ও স্টাইল", keywords: ["নিজের পছন্দ অনুযায়ী", "কাস্টম ডিজাইন", "custom design", "nijer design", "nijo pochhondo"], answer: "হ্যাঁ! Oria Interior ক্লায়েন্টের পছন্দ, জীবনযাত্রা ও বাজেট অনুযায়ী কাস্টম ডিজাইন তৈরি করে।" },
  { category: "ডিজাইন ও স্টাইল", keywords: ["মডার্ন ডিজাইন", "আধুনিক", "modern design", "contemporary", "latest design"], answer: "হ্যাঁ! আধুনিক মিনিমালিস্ট থেকে ক্লাসিক — সব ধরনের ডিজাইন Oria Interior করে।" },
  { category: "ডিজাইন ও স্টাইল", keywords: ["থিমভিত্তিক ডিজাইন", "theme design", "themed interior", "theme based"], answer: "হ্যাঁ! Oria Interior যেকোনো থিমে ডিজাইন করে — রেস্টুরেন্ট, অফিস বা বাসা যেটাই হোক।" },
  { category: "ডিজাইন ও স্টাইল", keywords: ["রঙ পছন্দ", "কালার সিলেকশন", "color selection", "rong pochhondo", "color palette"], answer: "হ্যাঁ! Oria Interior আপনার জন্য সেরা কালার প্যালেট নির্বাচনে পরামর্শ দেয়।" },
  { category: "ডিজাইন ও স্টাইল", keywords: ["ইসলামিক থিম", "আরবিক স্টাইল", "islamic interior", "arabic style", "islamic design"], answer: "হ্যাঁ! ইসলামিক ও আরবিক ইন্টেরিয়র থিম Oria Interior-এর সক্ষমতার মধ্যে আছে।" },
  { category: "ডিজাইন ও স্টাইল", keywords: ["স্কান্ডিনেভিয়ান", "মিনিমালিস্ট", "scandinavian", "minimalist", "bohemian", "industrial style"], answer: "হ্যাঁ! স্কান্ডিনেভিয়ান, বোহো, ইন্ডাস্ট্রিয়াল যেকোনো আন্তর্জাতিক স্টাইলে Oria Interior কাজ করে।" },
  { category: "ডিজাইন ও স্টাইল", keywords: ["কাস্টম ওয়ার্ডরোব", "আলমারি", "custom wardrobe", "almirah banano", "built in wardrobe"], answer: "হ্যাঁ! কাস্টম মাপের Built-In ওয়ার্ডরোব ও ক্যাবিনেট তৈরি করা হয়।" },
  { category: "ডিজাইন ও স্টাইল", keywords: ["ফার্নিচার সরবরাহ", "furniture supply", "furniture dao", "installation", "installation korben"], answer: "হ্যাঁ! Oria Interior ডিজাইন থেকে সম্পূর্ণ ইন্সটলেশন পর্যন্ত সব কিছু করে।" },

  // ── ক্যাটাগরি ৭: রেসিডেন্শিয়াল ──
  { category: "রেসিডেন্শিয়াল", keywords: ["লিভিং রুম", "বৈঠকখানা", "living room", "drawing room", "sitting room"], answer: "হ্যাঁ! সোফা, কার্পেট, লাইটিং ও দেওয়ালের রঙ সহ সম্পূর্ণ লিভিং রুম ডিজাইন করা হয়।" },
  { category: "রেসিডেন্শিয়াল", keywords: ["বেডরুম", "শোবার ঘর", "bedroom design", "master bedroom", "bedroom sajano"], answer: "হ্যাঁ! বেড, ওয়ার্ডরোব, লাইটিং ও সামগ্রিক অ্যাম্বিয়্যান্স তৈরি করা হয়।" },
  { category: "রেসিডেন্শিয়াল", keywords: ["কিচেন", "রান্নাঘর", "kitchen design", "modular kitchen", "rannaghor design"], answer: "হ্যাঁ! মডুলার কিচেন লেআউট সহ সম্পূর্ণ রান্নাঘর ডিজাইন করা হয়।" },
  { category: "রেসিডেন্শিয়াল", keywords: ["ডাইনিং রুম", "dining room", "dining table", "khaoar ghor"], answer: "হ্যাঁ! ডাইনিং রুমের ডিজাইন ও ফার্নিচার সিলেকশন করা হয়।" },
  { category: "রেসিডেন্শিয়াল", keywords: ["ছোট ঘর", "ছোট স্পেস", "small room", "small space", "choto ghor", "choto flat"], answer: "হ্যাঁ! স্মার্ট স্টোরেজ ও লেআউটের মাধ্যমে ছোট স্পেসকে সর্বোচ্চ ব্যবহারযোগ্য করে তোলা হয়।" },
  { category: "রেসিডেন্শিয়াল", keywords: ["বাথরুম", "bathroom design", "toilet design", "washroom"], answer: "হ্যাঁ! আধুনিক বাথরুম ডিজাইন ও ফিটিংস নির্বাচনে সহায়তা করা হয়।" },
  { category: "রেসিডেন্শিয়াল", keywords: ["বারান্দা", "ব্যালকনি", "balcony design", "barandah sajano", "roof design"], answer: "হ্যাঁ! ব্যালকনি ও ছাদের সাজসজ্জার পরামর্শ ও ডিজাইন করা হয়।" },

  // ── ক্যাটাগরি ৮: অফিস ──
  { category: "অফিস", keywords: ["অফিস ডিজাইনে কী কী", "office design includes", "office a ki ki thakbe"], answer: "ওপেন ও প্রাইভেট ওয়ার্কস্পেস, মিটিং রুম, রিসেপশন, লাউঞ্জ, ব্র্যান্ডিং ও লাইটিং সহ সম্পূর্ণ অফিস।" },
  { category: "অফিস", keywords: ["ছোট অফিস", "small office", "choto office", "startup office"], answer: "হ্যাঁ! ছোট অফিসকেও প্রোডাক্টিভ ও পেশাদার রূপ দিতে Oria Interior সদা প্রস্তুত।" },
  { category: "অফিস", keywords: ["অফিসে ব্র্যান্ডিং", "office branding", "logo lagano", "brand identity office"], answer: "হ্যাঁ! আপনার ব্র্যান্ডের লোগো, রঙ ও আইডেন্টিটি ইন্টেরিয়রে সুন্দরভাবে যোগ করা হয়।" },
  { category: "অফিস", keywords: ["মিটিং রুম", "meeting room design", "conference room"], answer: "হ্যাঁ! প্রফেশনাল ও আধুনিক মিটিং রুম ডিজাইন করা হয়।" },
  { category: "অফিস", keywords: ["রিসেপশন ডিজাইন", "reception area", "front desk design", "lobby design"], answer: "হ্যাঁ! আকর্ষণীয় রিসেপশন এরিয়া ডিজাইন Oria Interior-এর স্পেশালিটি।" },

  // ── ক্যাটাগরি ৯: রেস্টুরেন্ট ──
  { category: "রেস্টুরেন্ট", keywords: ["রেস্টুরেন্টে কী পাবো", "restaurant e ki ki", "restaurant package"], answer: "লেআউট, থিম, বার ও কিচেন ইন্টিগ্রেশন, সিটিং অপ্টিমাইজেশন, লাইটিং ও কাস্টম ফার্নিচার — সবকিছু।" },
  { category: "রেস্টুরেন্ট", keywords: ["ক্যাফে ডিজাইন", "cafe design", "coffee shop", "tea stall design"], answer: "হ্যাঁ! কোজি থেকে হাইপ — যেকোনো ধরনের ক্যাফে থিম Oria Interior করে।" },
  { category: "রেস্টুরেন্ট", keywords: ["ফাস্ট ফুড", "fast food shop", "food court", "burger shop design"], answer: "হ্যাঁ! কার্যকরী ও আকর্ষণীয় ফাস্ট ফুড ও ফুড কোর্ট ডিজাইন করা হয়।" },
  { category: "রেস্টুরেন্ট", keywords: ["সিটিং ব্যবস্থা", "seating arrangement", "sitting capacity", "table layout"], answer: "আয়তন অনুযায়ী সর্বোচ্চ সিটিং ক্যাপাসিটি নিশ্চিত করে Oria Interior ডিজাইন করে।" },

  // ── ক্যাটাগরি ১০: ৩D ভিজুয়ালাইজেশন ──
  { category: "৩D ভিজুয়ালাইজেশন", keywords: ["3D দেখবো", "3d design dekhbo", "3d render", "3d preview"], answer: "হ্যাঁ! কাজ শুরুর আগেই Oria Interior ফটো-রিয়েলিস্টিক 3D রেন্ডার তৈরি করে দেয়।" },
  { category: "৩D ভিজুয়ালাইজেশন", keywords: ["ভার্চুয়াল ওয়াকথ্রু", "virtual walkthrough", "3d tour", "virtual tour"], answer: "হ্যাঁ! ঘরে বসেই আপনার ভবিষ্যৎ স্পেস ভার্চুয়ালি ঘুরে দেখতে পারবেন।" },
  { category: "৩D ভিজুয়ালাইজেশন", keywords: ["3D রেন্ডারে কী দেখবো", "3d render e ki thakbe", "what to see in 3d"], answer: "ম্যাটেরিয়াল, রঙ, ফার্নিচার ও লাইটিং — সবকিছু নির্মাণের আগেই চোখের সামনে দেখতে পাবেন।" },
  { category: "৩D ভিজুয়ালাইজেশন", keywords: ["3D পরিবর্তন", "3d change korte parbo", "3d modify"], answer: "হ্যাঁ! আপনার মতামত অনুযায়ী 3D ডিজাইনে পরিবর্তন করা হয়।" },

  // ── ক্যাটাগরি ১১: গুণমান ──
  { category: "গুণমান ও গ্যারান্টি", keywords: ["কাজের মান কেমন", "quality ki", "kaj er maan", "standard ki"], answer: "Oria Interior প্রিমিয়াম ম্যাটেরিয়াল ব্যবহার করে এবং প্রতিটি ধাপে কোয়ালিটি চেক করা হয়।" },
  { category: "গুণমান ও গ্যারান্টি", keywords: ["গ্যারান্টি আছে", "guarantee ki", "warranty ache", "promise ki"], answer: "Oria Interior কাজের মান ও সময়মতো ডেলিভারিতে সম্পূর্ণ প্রতিশ্রুতিবদ্ধ।" },
  { category: "গুণমান ও গ্যারান্টি", keywords: ["কাজ শেষে সমস্যা", "after service", "kaj sesh howa por", "after sales support"], answer: "হ্যাঁ! Oria Interior প্রজেক্ট শেষেও ক্লায়েন্টকে আফটার-সেলস সাপোর্ট দেয়।" },
  { category: "গুণমান ও গ্যারান্টি", keywords: ["কাজের মাঝে পরিবর্তন", "change during work", "majhe change korte parbo", "revision"], answer: "হ্যাঁ, আলোচনা সাপেক্ষে ডিজাইনে পরিবর্তন করা যায়।" },
  { category: "গুণমান ও গ্যারান্টি", keywords: ["কী ম্যাটেরিয়াল", "material ki use koren", "quality material", "material standard"], answer: "উচ্চমানের, টেকসই ম্যাটেরিয়াল ব্যবহার করা হয় এবং বাজেট অনুযায়ী সেরা অপশন বেছে দেওয়া হয়।" },

  // ── ক্যাটাগরি ১২: পোর্টফোলিও ──
  { category: "পোর্টফোলিও", keywords: ["কাজের নমুনা", "পোর্টফোলিও দেখবো", "portfolio dekhi", "sample work", "previous work"], answer: "Oria Interior-এর সম্পন্ন প্রজেক্টগুলো দেখতে পোর্টফোলিও পেজ ভিজিট করুন: https://www.oriainteriorbd.com/portfolio" },
  { category: "পোর্টফোলিও", keywords: ["Before After ছবি", "before after", "gallery dekhi", "transformation photos"], answer: "আগের ও পরের তুলনামূলক ছবি দেখতে গ্যালারি পেজ ভিজিট করুন: https://www.oriainteriorbd.com/gallery" },
  { category: "পোর্টফোলিও", keywords: ["কাজের ছবি", "photo dekhbo", "project photos", "work photos"], answer: "হ্যাঁ! Oria Interior-এর ওয়েবসাইট ও ফেসবুকে নিয়মিত কাজের ছবি শেয়ার করা হয়।" },

  // ── ক্যাটাগরি ১৩: অ্যাপয়েন্টমেন্ট ──
  { category: "অ্যাপয়েন্টমেন্ট", keywords: ["অ্যাপয়েন্টমেন্ট নেবো", "appointment nibo", "book appointment", "meeting book"], answer: "Oria Interior-এ অ্যাপয়েন্টমেন্ট বুক করতে: https://www.oriainteriorbd.com/appointment" },
  { category: "অ্যাপয়েন্টমেন্ট", keywords: ["ফ্রি কনসালটেশন বুক", "free consultation book", "pরামর্শ নিতে চাই", "free advice book"], answer: "বিনামূল্যে কনসালটেশন নিতে ফর্ম পূরণ করুন: https://www.oriainteriorbd.com/consultation — অথবা WhatsApp: 01334003388" },
  { category: "অ্যাপয়েন্টমেন্ট", keywords: ["অনলাইন মিটিং", "virtual meeting", "online consultation", "video call"], answer: "হ্যাঁ! Oria Interior WhatsApp বা ভিডিও কলে অনলাইন কনসালটেশনও দেয়।" },
  { category: "অ্যাপয়েন্টমেন্ট", keywords: ["বাড়িতে আসবেন", "site visit", "barite ashben", "home visit"], answer: "হ্যাঁ! প্রয়োজন হলে Oria Interior-এর টিম সাইট ভিজিট করে পরিমাপ নেয় ও পরামর্শ দেয়।" },

  // ── ক্যাটাগরি ১৪: কোটেশন ──
  { category: "কোটেশন", keywords: ["কোটেশন পাবো কীভাবে", "quotation kivabe", "estimate pete chai", "price list"], answer: "বিনামূল্যে কোটেশন পেতে ফর্ম পূরণ করুন: https://www.oriainteriorbd.com/quote — অথবা WhatsApp: 01334003388" },
  { category: "কোটেশন", keywords: ["কাজের অর্ডার", "order kivabe dibo", "how to order", "start project"], answer: "কনসালটেশন → ডিজাইন অনুমোদন → চুক্তি → কাজ শুরু। যোগাযোগ করুন: 01334003388" },
  { category: "কোটেশন", keywords: ["ফ্রি কোটেশন", "free quotation", "binamulye estimate", "free estimate"], answer: "হ্যাঁ! Oria Interior সম্পূর্ণ বিনামূল্যে কোটেশন দেয়। এখনই অনুরোধ করুন: https://www.oriainteriorbd.com/quote" },

  // ── ক্যাটাগরি ১৫: সাধারণ প্রশ্ন ──
  { category: "সাধারণ", keywords: ["কোন এলাকায়", "dhaka te", "area ki", "kothay kaj koren", "coverage area"], answer: "Oria Interior মূলত ঢাকায় কাজ করে। অন্য এলাকার জন্য সরাসরি জানুন: 01334003388" },
  { category: "সাধারণ", keywords: ["ঢাকার বাইরে", "outside dhaka", "dhaka r bayre", "chittagong", "sylhet"], answer: "ঢাকার বাইরে কাজের সম্ভাবনা আছে। বিস্তারিত জানতে যোগাযোগ করুন: 01334003388" },
  { category: "সাধারণ", keywords: ["এখন খালি আছেন", "new project nebo", "slot ache", "available kina"], answer: "বর্তমান প্রজেক্ট স্লট সম্পর্কে জানতে WhatsApp করুন: 01334003388" },
  { category: "সাধারণ", keywords: ["ফলো-আপ", "follow up", "project update", "kaj er update"], answer: "WhatsApp: 01334003388 বা ইমেইল: info@oriainteriorbd.com-এ যোগাযোগ করুন।" },
  { category: "সাধারণ", keywords: ["কতজন ডিজাইনার", "team ki", "koto designer", "how many designers"], answer: "Oria Interior-এ দক্ষ টিম রয়েছে — আর্কিটেক্ট, ডিজাইনার ও কারিগর সকলে মিলে কাজ করেন।" },
  { category: "সাধারণ", keywords: ["শুধু বড়লোকদের জন্য", "shudhu dhoni der jonno", "affordable kina", "all budget"], answer: "মোটেও না! Oria Interior সকল বাজেটের ক্লায়েন্টের জন্য সর্বোত্তম সমাধান দেয়।" },
  { category: "সাধারণ", keywords: ["আমার ঘর সুন্দর হবে", "flat sundor hobe", "good result dibe", "result ki hobe"], answer: "অবশ্যই! Oria Interior আপনার স্বপ্নের বাসস্থান তৈরিতে প্রতিশ্রুতিবদ্ধ। আজই কনসালটেশন বুক করুন।" },
  { category: "সাধারণ", keywords: ["নিজের আইডিয়া দিতে পারবো", "nijer idea dite parbo", "own idea", "custom idea"], answer: "হ্যাঁ! ক্লায়েন্টের আইডিয়া ও পছন্দই Oria Interior-এর ডিজাইনের ভিত্তি।" },
  { category: "সাধারণ", keywords: ["পুরনো ফার্নিচার রাখা যাবে", "old furniture", "purono furniture", "existing furniture"], answer: "হ্যাঁ! পুরনো ফার্নিচারকে নতুন ডিজাইনে সুন্দরভাবে ইন্টিগ্রেট করার চেষ্টা করা হয়।" },
  { category: "সাধারণ", keywords: ["ইন্টেরিয়রের সুবিধা", "interior er fayeda", "why interior design", "keno interior design"], answer: "সঠিক ইন্টেরিয়র ডিজাইন জীবনমান উন্নত করে, স্পেসের সর্বোচ্চ ব্যবহার নিশ্চিত করে ও সম্পত্তির মূল্য বাড়ায়।" },
  { category: "সাধারণ", keywords: ["শুরুতে কী নিয়ে যাবো", "ki niye ashbo", "what to bring", "first meeting requirements"], answer: "শুধু আপনার ধারণা ও বাজেট নিয়ে আসুন। ফ্লোর প্ল্যান থাকলে ভালো, না থাকলেও পরিমাপ নেওয়া হয়।" },
  { category: "সাধারণ", keywords: ["ওয়েবসাইট কে বানিয়েছেন", "website developer", "developer ke", "website baniyeche ke"], answer: "Oria Interior-এর ওয়েবসাইট তৈরি করেছেন Naim Islam — NetHist: https://nethist.online" },

  // ── ক্যাটাগরি ১৬: বিশেষ ──
  { category: "বিশেষ", keywords: ["কেন Oria Interior বেছে নেবো", "why choose oria", "keno oria choose korbo"], answer: "১৩+ বছরের অভিজ্ঞতা, ১০০+ সফল প্রজেক্ট, প্রিমিয়াম মান, সৃজনশীলতা ও ১০০% সময়মতো ডেলিভারি।" },
  { category: "বিশেষ", keywords: ["অন্যদের থেকে আলাদা", "why different", "unique ki", "compared to others"], answer: "Oria Interior প্রতিটি প্রজেক্টে ব্যক্তিগত মনোযোগ দেয়, সৎ যোগাযোগ রাখে ও সময়মতো ডেলিভারি নিশ্চিত করে।" },
  { category: "বিশেষ", keywords: ["রিভিউ", "রেফারেন্স", "review", "client feedback", "rating"], answer: "Oria Interior-এর সম্পন্ন কাজ ও ক্লায়েন্ট ফিডব্যাক দেখুন: https://www.oriainteriorbd.com/portfolio" },
  { category: "বিশেষ", keywords: ["ফেসবুক পেজ", "facebook page", "fb page", "social media"], answer: "Facebook-এ 'Oria Interior' খুঁজুন। যোগাযোগ: 01334003388" },
  { category: "বিশেষ", keywords: ["রেফারেল সুবিধা", "referral", "refer korle ki", "bonus"], answer: "রেফারেল অফার সম্পর্কে বিস্তারিত জানতে যোগাযোগ করুন: 01334003388" },

  // ── ক্যাটাগরি ১৭: সাপোর্ট ──
  { category: "সাপোর্ট", keywords: ["জরুরি যোগাযোগ", "urgent contact", "emergency", "jotil somossa"], answer: "Oria Interior-এ জরুরি যোগাযোগের সবচেয়ে দ্রুত মাধ্যম — WhatsApp: 01334003388" },
  { category: "সাপোর্ট", keywords: ["অভিযোগ জানাবো", "complaint", "ovioge", "problem janaibo"], answer: "আপনার অভিযোগ বা পরামর্শ জানান — ইমেইল: info@oriainteriorbd.com বা WhatsApp: 01334003388" },
  { category: "সাপোর্ট", keywords: ["কাজ চলাকালীন সমস্যা", "during work problem", "kaj er somoi somossa", "issue during project"], answer: "Oria Interior-এর টিমকে সরাসরি জানান — WhatsApp: 01334003388 — দ্রুত সমাধান পাবেন।" },

  // ── ক্যাটাগরি ১৮: ওয়েবসাইট নেভিগেশন ──
  { category: "ওয়েবসাইট", keywords: ["সার্ভিস পেজ", "service page", "services dekhbo", "all services"], answer: "Oria Interior-এর সকল সার্ভিসের বিস্তারিত দেখুন: https://www.oriainteriorbd.com/services" },
  { category: "ওয়েবসাইট", keywords: ["পোর্টফোলিও পেজ", "portfolio page", "portfolio dekhbo"], answer: "Oria Interior-এর সম্পন্ন প্রজেক্টগুলো দেখতে যান: https://www.oriainteriorbd.com/portfolio" },
  { category: "ওয়েবসাইট", keywords: ["গ্যালারি পেজ", "gallery page", "gallery dekhbo", "photos dekhbo"], answer: "Before & After সহ সব কাজের ছবি দেখুন গ্যালারিতে: https://www.oriainteriorbd.com/gallery" },
  { category: "ওয়েবসাইট", keywords: ["ব্লগ পেজ", "blog page", "blog porhte chai", "articles"], answer: "ইন্টেরিয়র ডিজাইন টিপস ও আইডিয়া পেতে ব্লগ পড়ুন: https://www.oriainteriorbd.com/blog" },
  { category: "ওয়েবসাইট", keywords: ["FAQ পেজ", "faq page", "question answer page", "help page"], answer: "সাধারণ প্রশ্নের উত্তর পেতে FAQ পেজ দেখুন: https://www.oriainteriorbd.com/faq" },
  { category: "ওয়েবসাইট", keywords: ["About পেজ", "about page", "about us", "company details page"], answer: "Oria Interior সম্পর্কে বিস্তারিত জানতে About পেজ দেখুন: https://www.oriainteriorbd.com/about" },

  // ── ক্যাটাগরি ১৯: সালাম ও বিবিধ ──
  { category: "সালাম ও বিবিধ", keywords: ["হ্যালো", "হাই", "hello", "hi", "hey", "good morning", "good evening"], answer: "আস্সালামু আলাইকুম! Oria Interior-এ আপনাকে স্বাগতম। আপনার স্বপ্নের বাসস্থান বা অফিস সাজাতে আমরা প্রস্তুত। কীভাবে সাহায্য করতে পারি? 😊" },
  { category: "সালাম ও বিবিধ", keywords: ["আস্সালামু আলাইকুম", "সালাম", "assalamu alaikum", "salam"], answer: "ওয়ালাইকুম আস্সালাম! Oria Interior-এ আপনাকে স্বাগতম। আজ কীভাবে সাহায্য করতে পারি? 😊" },
  { category: "সালাম ও বিবিধ", keywords: ["ধন্যবাদ", "thanks", "thank you", "shukriya", "dhonnobad"], answer: "আপনাকেও ধন্যবাদ! যেকোনো প্রয়োজনে Oria Interior সবসময় পাশে আছে। 😊" },
  { category: "সালাম ও বিবিধ", keywords: ["বিদায়", "আল্লাহ হাফেজ", "bye", "goodbye", "allah hafez"], answer: "আল্লাহ হাফেজ! আপনার সুন্দর বাসস্থানের জন্য শুভকামনা। যেকোনো প্রয়োজনে Oria Interior-এ যোগাযোগ করুন: 01334003388 😊" },
  { category: "সালাম ও বিবিধ", keywords: ["মানুষ না রোবট", "ai kina", "real manush kina", "bot kina", "automated"], answer: "আমি Oria Interior-এর ডিজিটাল সহকারী। সরাসরি মানবিক সাহায্যের জন্য WhatsApp করুন: 01334003388" },
  { category: "সালাম ও বিবিধ", keywords: ["আপনার নাম কী", "name ki", "tomar nam ki", "ki nametumi"], answer: "আমি Oria Interior-এর ডিজিটাল সহকারী। আপনার যেকোনো প্রশ্নের উত্তর দিতে সদা প্রস্তুত! 😊" },
  { category: "সালাম ও বিবিধ", keywords: ["সরাসরি কথা বলতে চাই", "human support", "manusher sathe kothা", "direct talk"], answer: "অবশ্যই! Oria Interior-এর টিম আপনার জন্য প্রস্তুত — WhatsApp: 01334003388 বা ফোন করুন।" },
  { category: "সালাম ও বিবিধ", keywords: ["এটা কোন কোম্পানির চ্যাট", "kono company er chat", "official chat", "whose chatbot"], answer: "এটি Oria Interior-এর অফিশিয়াল চ্যাট সিস্টেম। আরও জানুন: https://www.oriainteriorbd.com" },
  { category: "সালাম ও বিবিধ", keywords: ["উত্তর পাচ্ছি না", "bujhlam na", "answer pailam na", "dont understand"], answer: "দুঃখিত! আপনার প্রশ্নটি সরাসরি Oria Interior-এর টিমকে জানান — WhatsApp: 01334003388 — দ্রুত সাহায্য পাবেন।" },
  { category: "সালাম ও বিবিধ", keywords: ["কেউ নেই", "keu nei", "কেউ আছেন", "keu achen", "is anyone there"], answer: "আমি এখানেই আছি! আপনার প্রশ্ন করুন। সরাসরি টিমের সাথে কথা বলতে WhatsApp: 01334003388" },
];

async function seed() {
  await connectDB();
  console.log("🗑️  Clearing old FAQ data...");
  await FaqItem.deleteMany({});

  console.log("🌱 Seeding FAQ data...");
  for (let i = 0; i < faqs.length; i++) {
    const faq = new FaqItem(faqs[i]);
    await faq.save();
    process.stdout.write(`\r   ✅ ${i + 1}/${faqs.length} inserted`);
  }
  console.log("\n🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
