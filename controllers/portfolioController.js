const Portfolio = require("../models/Portfolio");
const { deleteFromCloudinary, extractPublicId } = require("../utils/cloudinaryConfig");
const mongoose = require("mongoose");

// @GET /api/portfolio (public)
const getAllPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find().sort({ createdAt: -1 });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @GET /api/portfolio/:id (public) — supports _id OR slug
const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;
    let project = mongoose.Types.ObjectId.isValid(id)
      ? await Portfolio.findById(id)
      : null;
    if (!project) project = await Portfolio.findOne({ slug: id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @POST /api/portfolio (admin only)
const createPortfolio = async (req, res) => {
  try {
    const { title, category, location, year, area, duration, client, description, featured, tags } = req.body;
    if (!title || !category) return res.status(400).json({ success: false, message: "Title and category are required." });
    if (!req.file) return res.status(400).json({ success: false, message: "Project cover image is required." });

    const project = await Portfolio.create({
      title, category, location, year, area, duration, client, description,
      featured: featured === "true" || featured === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
      image: req.file.path,
      imagePublicId: req.file.filename,
      images: [],
    });

    res.status(201).json({ success: true, message: "Project added!", data: project });
  } catch (error) {
    console.error("Create portfolio error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @PUT /api/portfolio/:id (admin only)
const updatePortfolio = async (req, res) => {
  try {
    const project = await Portfolio.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const updateData = { ...req.body };
    if (updateData.featured !== undefined) updateData.featured = updateData.featured === "true" || updateData.featured === true;
    if (updateData.tags && !Array.isArray(updateData.tags)) updateData.tags = updateData.tags.split(",").map(t => t.trim());
    // Regenerate slug if title changed
    if (updateData.title && updateData.title !== project.title) delete updateData.slug;

    if (req.file) {
      if (project.imagePublicId) await deleteFromCloudinary(project.imagePublicId);
      else if (project.image) await deleteFromCloudinary(extractPublicId(project.image));
      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    const updated = await Portfolio.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: "Project updated!", data: updated });
  } catch (error) {
    console.error("Update portfolio error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @DELETE /api/portfolio/:id (admin only)
const deletePortfolio = async (req, res) => {
  try {
    const project = await Portfolio.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    // Delete cover image
    if (project.imagePublicId) await deleteFromCloudinary(project.imagePublicId);
    else if (project.image) await deleteFromCloudinary(extractPublicId(project.image));

    // Delete all gallery images
    for (const img of project.images || []) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }

    res.json({ success: true, message: "Project deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @POST /api/portfolio/:id/images — Add gallery images to existing project
const addGalleryImages = async (req, res) => {
  try {
    const project = await Portfolio.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: "No images uploaded." });

    const captions = req.body.captions ? JSON.parse(req.body.captions) : [];
    const newImages = req.files.map((file, i) => ({
      url: file.path,
      publicId: file.filename,
      caption: captions[i] || "",
    }));

    project.images.push(...newImages);
    await project.save();

    res.json({ success: true, message: `${newImages.length} image(s) added!`, data: project });
  } catch (error) {
    console.error("Add gallery images error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @DELETE /api/portfolio/:id/images/:imageId — Remove a single gallery image
const deleteGalleryImage = async (req, res) => {
  try {
    const project = await Portfolio.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const imgIndex = project.images.findIndex(img => img._id.toString() === req.params.imageId);
    if (imgIndex === -1) return res.status(404).json({ success: false, message: "Image not found." });

    const img = project.images[imgIndex];
    if (img.publicId) await deleteFromCloudinary(img.publicId);

    project.images.splice(imgIndex, 1);
    await project.save();

    res.json({ success: true, message: "Image removed!", data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAllPortfolio, getPortfolioById, createPortfolio, updatePortfolio, deletePortfolio, addGalleryImages, deleteGalleryImage };
