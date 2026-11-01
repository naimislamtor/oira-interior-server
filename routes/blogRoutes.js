const express = require("express");
const router = express.Router();
const { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController");
const { protect } = require("../middleware/authMiddleware");
const { createUploader } = require("../utils/cloudinaryConfig");

const upload = createUploader("blog");

const handleUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", protect, handleUpload, createBlog);
router.put("/:id", protect, handleUpload, updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;
