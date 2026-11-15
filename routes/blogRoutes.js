const express = require("express");
const router = express.Router();
const { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");
const { createUploader } = require("../utils/cloudinaryConfig");

const handleUpload = (req, res, next) => {
  createUploader("blog").single("image")(req, res, err => err ? next(err) : next());
};

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", protect, handleUpload, createBlog);
router.put("/:id", protect, handleUpload, updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
