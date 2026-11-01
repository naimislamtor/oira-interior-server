require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const FaqItem = require("./models/FaqItem");

// Extra Banglish keywords to ADD to existing FAQs
const updates = [
  {
    faqId: "FAQ-002",
    addKeywords: [
      "apnader location kothai", "location ki", "thikana ki", "office location",
      "apnader office kothay", "kivabe jabo apnader kache", "office er address",
      "apnader thikana bolun", "kothay achen apnara", "where is your office"
    ]
  },
  {
    faqId: "FAQ-001",
    addKeywords: [
      "oria interior ki", "apnara ki koren", "company ki", "company somporke bolun",
      "ki bishoye kaj koren", "ki dhoner company", "what do you do", "about company"
    ]
  },
  {
    faqId: "FAQ-004",
    addKeywords: [
      "MD er naam ki", "company ke run kore", "boss er naam ki", "malik ke",
      "owner ke", "director er naam", "managing director ke", "company head ke"
    ]
  },
  {
    faqId: "FAQ-003",
    addKeywords: [
      "kotodin dhore kaj koren", "koto bochor holo", "company kobe theke", 
      "experience koto bochor", "how old is company", "established year"
    ]
  },
  {
    faqId: "FAQ-011",
    addKeywords: [
      "phone number bolun", "call korbo kothay", "number deen", "contact number",
      "mobile number ki", "phone korar number", "call center number"
    ]
  },
  {
    faqId: "FAQ-029",
    addKeywords: [
      "service er dam koto", "koto taka lagbe", "design er price", "interior er cost",
      "rate ki", "budget ki", "taka koto lagbe", "kaj korate koto lage"
    ]
  },
  {
    faqId: "FAQ-019",
    addKeywords: [
      "design ki ki ache", "apnara ki ki service den", "service list", 
      "ki ki kaj koren", "kono ki service ache", "what services available",
      "service gulo ki ki"
    ]
  },
  {
    faqId: "FAQ-020",
    addKeywords: [
      "flat er kaj korben ki", "flat design", "flat sajabo", "flat interior",
      "apartment er kaj", "basar kaj korben", "ghor sajabo", "flat er interior"
    ]
  },
  {
    faqId: "FAQ-065",
    addKeywords: [
      "3d dekha jabe ki", "3d design dekhte chai", "3d preview ache ki",
      "design age dekhte parbo", "3d model dekhabo", "virtual design dekhi"
    ]
  },
  {
    faqId: "FAQ-077",
    addKeywords: [
      "appointment nite chai", "appointment debo kivabe", "booking kivabe",
      "meeting er jonno book korbo", "konsultasion book", "visit book"
    ]
  },
  {
    faqId: "FAQ-078",
    addKeywords: [
      "free consultation ache ki", "free advice pabo ki", "binamulle poramorsh",
      "free meeting", "free visit", "free estimate ache", "cost free advice"
    ]
  },
  {
    faqId: "FAQ-050",
    addKeywords: [
      "bedroom design", "bedroom sajabo", "bedroom interior", 
      "master bedroom", "shobar ghor design"
    ]
  },
  {
    faqId: "FAQ-061",
    addKeywords: [
      "restaurant banate chai", "restaurant design kivabe hobe", "restaurant interior",
      "khaoar ghor design", "hotel design", "restaurant er kaj korben"
    ]
  },
  {
    faqId: "FAQ-021",
    addKeywords: [
      "office sazate chai", "office design dibo", "office interior banabo",
      "office er kaj", "office renovation", "office makeover"
    ]
  },
  {
    faqId: "FAQ-024",
    addKeywords: [
      "custom furniture banaben", "furniture order dibo", "custom almirah",
      "furniture baniye deben", "furniture banate chai", "wardrobe order"
    ]
  },
  {
    faqId: "FAQ-084",
    addKeywords: [
      "kotodur theke kaj koren", "ki area cover koren", "dhaka chara kaj",
      "apnader area", "service area ki", "coverage area"
    ]
  },
  {
    faqId: "FAQ-033",
    addKeywords: [
      "payment kivabe dibo", "payment method ki", "koto percent advance",
      "taka dibo kivabe", "pay korbo kivabe", "payment system ki"
    ]
  },
  {
    faqId: "FAQ-015",
    addKeywords: [
      "office ki kota theke khola", "office time", "kokhon ashbo",
      "office er somoy", "kotokhon khola thake", "working hours"
    ]
  },
  {
    faqId: "FAQ-036",
    addKeywords: [
      "koto din lagbe", "kaj shesh hote koto time", "project koto time",
      "koto din er moddhe hobe", "completion time", "delivery time"
    ]
  },
  {
    faqId: "FAQ-035",
    addKeywords: [
      "quotation pete chai", "estimate dao", "budget estimate", 
      "free quote dao", "cost er hisab", "kaj er estimate"
    ]
  },
];

async function update() {
  await connectDB();
  console.log("🔄 Updating FAQ keywords with Banglish variants...\n");
  
  let updated = 0;
  for (const u of updates) {
    const faq = await FaqItem.findOne({ faqId: u.faqId });
    if (!faq) {
      console.log(`  ⚠️  ${u.faqId} not found`);
      continue;
    }
    
    // Add only new keywords (avoid duplicates)
    const existing = new Set(faq.keywords);
    const newKws = u.addKeywords.filter(k => !existing.has(k));
    
    if (newKws.length > 0) {
      faq.keywords = [...faq.keywords, ...newKws];
      await faq.save();
      console.log(`  ✅ ${u.faqId} [${faq.category}]: +${newKws.length} keywords`);
      updated++;
    } else {
      console.log(`  ⏭️  ${u.faqId}: all keywords already exist`);
    }
  }
  
  console.log(`\n🎉 Done! Updated ${updated} FAQs with extra Banglish keywords.`);
  process.exit(0);
}

update().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
