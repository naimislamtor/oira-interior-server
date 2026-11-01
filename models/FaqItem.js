const mongoose = require("mongoose");

const faqItemSchema = new mongoose.Schema(
  {
    faqId: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: {
      type: [String],
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate faqId before saving (async version for Mongoose 7+)
faqItemSchema.pre("save", async function () {
  if (!this.faqId) {
    const count = await mongoose.model("FaqItem").countDocuments();
    this.faqId = `FAQ-${String(count + 1).padStart(3, "0")}`;
  }
});

module.exports = mongoose.model("FaqItem", faqItemSchema);
