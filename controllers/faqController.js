const FaqItem = require("../models/FaqItem");
const Fuse = require("fuse.js");

// ─── PUBLIC: Match a user message to best FAQ answer ───────────────────────
exports.matchFaq = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const allFaqs = await FaqItem.find({ isActive: true });
    if (!allFaqs.length) {
      return res.json({ success: true, matched: false, answer: null });
    }

    // Build flat search index: each keyword maps to its FAQ
    const searchItems = [];
    allFaqs.forEach((faq) => {
      faq.keywords.forEach((kw) => {
        searchItems.push({ faqId: faq.faqId, keyword: kw, answer: faq.answer, category: faq.category });
      });
    });

    const fuse = new Fuse(searchItems, {
      keys: ["keyword"],
      threshold: 0.45,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const results = fuse.search(message.trim());
    if (results.length === 0) {
      return res.json({ success: true, matched: false, answer: null });
    }

    const best = results[0].item;
    return res.json({ success: true, matched: true, answer: best.answer, category: best.category, faqId: best.faqId });
  } catch (err) {
    console.error("matchFaq error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── ADMIN: Get all FAQs (with optional search) ────────────────────────────
exports.getAllFaqs = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category) query.category = category;

    let faqs = await FaqItem.find(query).sort({ faqId: 1 });

    // If search query provided, filter by faqId or keywords
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      faqs = faqs.filter(
        (f) =>
          f.faqId.toLowerCase().includes(s) ||
          f.keywords.some((k) => k.toLowerCase().includes(s)) ||
          f.answer.toLowerCase().includes(s) ||
          f.category.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, data: faqs, total: faqs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Get single FAQ by id ────────────────────────────────────────────
exports.getFaqById = async (req, res) => {
  try {
    const faq = await FaqItem.findById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Create new FAQ ──────────────────────────────────────────────────
exports.createFaq = async (req, res) => {
  try {
    const { category, keywords, answer, isActive } = req.body;
    if (!category || !keywords || !answer) {
      return res.status(400).json({ success: false, message: "category, keywords, answer required" });
    }
    const kws = Array.isArray(keywords)
      ? keywords.filter(Boolean)
      : keywords.split("\n").map((k) => k.trim()).filter(Boolean);

    const faq = new FaqItem({ category, keywords: kws, answer, isActive: isActive !== false });
    await faq.save();
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Update FAQ ──────────────────────────────────────────────────────
exports.updateFaq = async (req, res) => {
  try {
    const { category, keywords, answer, isActive } = req.body;
    const kws = keywords
      ? Array.isArray(keywords)
        ? keywords.filter(Boolean)
        : keywords.split("\n").map((k) => k.trim()).filter(Boolean)
      : undefined;

    const update = {};
    if (category !== undefined) update.category = category;
    if (kws !== undefined) update.keywords = kws;
    if (answer !== undefined) update.answer = answer;
    if (isActive !== undefined) update.isActive = isActive;

    const faq = await FaqItem.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Delete FAQ ──────────────────────────────────────────────────────
exports.deleteFaq = async (req, res) => {
  try {
    const faq = await FaqItem.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, message: "FAQ not found" });
    res.json({ success: true, message: "FAQ deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: Get all categories ──────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const cats = await FaqItem.distinct("category");
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
