const KnowledgeRule = require("../models/KnowledgeRule");

// Get all knowledge rules
exports.getKnowledgeRules = async (req, res) => {
  try {
    const rules = await KnowledgeRule.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, count: rules.length, data: rules });
  } catch (error) {
    console.error("Get Knowledge Rules Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching knowledge rules" });
  }
};

// Create a new knowledge rule
exports.createKnowledgeRule = async (req, res) => {
  try {
    const { question, keywords, answer, category } = req.body;

    if (!question || !answer || !keywords) {
      return res.status(400).json({ success: false, message: "Question, keywords, and answer are required." });
    }

    // Process keywords as array
    let keywordArray = Array.isArray(keywords)
      ? keywords
      : String(keywords)
          .split(",")
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean);

    const newRule = await KnowledgeRule.create({
      question: question.trim(),
      keywords: keywordArray,
      answer: answer.trim(),
      category: category ? category.trim() : "General",
    });

    return res.status(201).json({ success: true, data: newRule, message: "AI Knowledge Rule created successfully!" });
  } catch (error) {
    console.error("Create Knowledge Rule Error:", error);
    return res.status(500).json({ success: false, message: "Error creating knowledge rule" });
  }
};

// Update an existing knowledge rule
exports.updateKnowledgeRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, keywords, answer, category } = req.body;

    let keywordArray;
    if (keywords) {
      keywordArray = Array.isArray(keywords)
        ? keywords
        : String(keywords)
            .split(",")
            .map((k) => k.trim().toLowerCase())
            .filter(Boolean);
    }

    const updatedRule = await KnowledgeRule.findByIdAndUpdate(
      id,
      {
        ...(question && { question: question.trim() }),
        ...(keywordArray && { keywords: keywordArray }),
        ...(answer && { answer: answer.trim() }),
        ...(category && { category: category.trim() }),
      },
      { new: true }
    );

    if (!updatedRule) {
      return res.status(404).json({ success: false, message: "Knowledge Rule not found" });
    }

    return res.json({ success: true, data: updatedRule, message: "AI Knowledge Rule updated!" });
  } catch (error) {
    console.error("Update Knowledge Rule Error:", error);
    return res.status(500).json({ success: false, message: "Error updating knowledge rule" });
  }
};

// Delete a knowledge rule
exports.deleteKnowledgeRule = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await KnowledgeRule.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Knowledge Rule not found" });
    }

    return res.json({ success: true, message: "Knowledge Rule deleted successfully!" });
  } catch (error) {
    console.error("Delete Knowledge Rule Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting knowledge rule" });
  }
};
