const Blog = require("../models/Blog");
const mongoose = require("mongoose");

const slugify = (text) => {
  if (!text) return "";
  const str = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\p{P}\p{S}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return str || "post";
};

// @GET /api/blog (public)
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    // Backfill slug for legacy posts if missing
    for (let b of blogs) {
      if (!b.slug) {
        b.slug = slugify(b.title);
        await b.save();
      }
    }
    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @GET /api/blog/:id (public)
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    let blog;
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id);
    }
    if (!blog) {
      blog = await Blog.findOne({ slug: id });
    }
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog post not found." });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @POST /api/blog (admin only)
const createBlog = async (req, res) => {
  try {
    const { title, category, excerpt, content, readTime } = req.body;

    if (!title || !category || !excerpt || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Title, category, excerpt and content are required." });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Blog image is required." });
    }

    let slug = slugify(title);
    const existing = await Blog.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const blog = await Blog.create({
      title,
      slug,
      category,
      excerpt,
      content,
      readTime,
      image: req.file.filename,
    });

    res.status(201).json({ success: true, message: "Blog post added!", data: blog });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @PUT /api/blog/:id (admin only)
const updateBlog = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.title) {
      let slug = slugify(updateData.title);
      const existing = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
      updateData.slug = slug;
    }
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog post not found." });
    }

    res.json({ success: true, message: "Blog post updated!", data: blog });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @DELETE /api/blog/:id (admin only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog post not found." });
    }
    res.json({ success: true, message: "Blog post deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};