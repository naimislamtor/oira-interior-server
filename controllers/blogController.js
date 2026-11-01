const Blog = require("../models/Blog");
const mongoose = require("mongoose");
const { deleteFromCloudinary, extractPublicId } = require("../utils/cloudinaryConfig");

const slugify = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase().trim()
    .replace(/[\s\p{P}\p{S}]+/gu, "-").replace(/^-+|-+$/g, "") || "post";
};

// @GET /api/blog (public)
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    for (let b of blogs) {
      if (!b.slug) { b.slug = slugify(b.title); await b.save(); }
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
    let blog = mongoose.Types.ObjectId.isValid(id) ? await Blog.findById(id) : null;
    if (!blog) blog = await Blog.findOne({ slug: id });
    if (!blog) return res.status(404).json({ success: false, message: "Blog post not found." });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @POST /api/blog (admin only)
const createBlog = async (req, res) => {
  try {
    const { title, category, excerpt, content, readTime } = req.body;
    if (!title || !category || !excerpt || !content)
      return res.status(400).json({ success: false, message: "Title, category, excerpt and content are required." });
    if (!req.file)
      return res.status(400).json({ success: false, message: "Blog image is required." });

    let slug = slugify(title);
    if (await Blog.findOne({ slug })) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const blog = await Blog.create({
      title, slug, category, excerpt, content, readTime,
      image: req.file.path,
      imagePublicId: req.file.filename,
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
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog post not found." });

    const updateData = { ...req.body };
    if (updateData.title) {
      let slug = slugify(updateData.title);
      if (await Blog.findOne({ slug, _id: { $ne: req.params.id } }))
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      updateData.slug = slug;
    }

    if (req.file) {
      if (blog.imagePublicId) await deleteFromCloudinary(blog.imagePublicId);
      else if (blog.image) await deleteFromCloudinary(extractPublicId(blog.image));
      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, message: "Blog post updated!", data: updated });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @DELETE /api/blog/:id (admin only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog post not found." });

    if (blog.imagePublicId) await deleteFromCloudinary(blog.imagePublicId);
    else if (blog.image) await deleteFromCloudinary(extractPublicId(blog.image));

    res.json({ success: true, message: "Blog post deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog };
