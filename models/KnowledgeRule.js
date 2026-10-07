const mongoose = require("mongoose");

const knowledgeRuleSchema = new mongoose.Schema(
  {
    keywords: [{ type: String, required: true, trim: true, lowercase: true }],
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "General" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KnowledgeRule", knowledgeRuleSchema);
