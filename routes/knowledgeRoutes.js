const express = require("express");
const router = express.Router();
const {
  getKnowledgeRules,
  createKnowledgeRule,
  updateKnowledgeRule,
  deleteKnowledgeRule,
} = require("../controllers/knowledgeController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getKnowledgeRules);
router.post("/", protect, createKnowledgeRule);
router.put("/:id", protect, updateKnowledgeRule);
router.delete("/:id", protect, deleteKnowledgeRule);

module.exports = router;
