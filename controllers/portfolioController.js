const Portfolio = require("../models/Portfolio");
const { uploadToCloudinary, deleteFromCloudinary, extractPublicId } = require("../utils/cloudinaryConfig");
const mongoose = require("mongoose");

const getAllPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find().sort({ createdAt: -1 });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;
    let project = mongoose.Types.ObjectId.isValid(id) ? await Portfolio.findById(id) : null;
    if (!project) project = await Portfolio.findOne({ slug: id });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const createPortfolio = async (req, res) => {
  try {
    const { title, category, location, year, area, duration, client, description, featured, tags } = req.body;
    if (!title || !category) return res.status(400).json({ success: false, message: "Title and category are required." });
    if (!req.file) return res.status(400).json({ success: false, message: "Project cover image is required." });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "portfolio");

    const project = await Portfolio.create({
      title, category, location, year, area, duration, client, description,
      featured: featured === "true" || featured === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
      image: result.secure_url,
      imagePublicId: result.public_id,
      images: [],
    });

    res.status(201).json({ success: true, message: "Project added!", data: project });
  } catch (error) {
    console.error("Create portfolio error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

const updatePortfolio = async (req, res) => {
  try {
    const project = await Portfolio.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const updateData = { ...req.body };
    if (updateData.featured !== undefined) updateData.featured = updateData.featured === "true" || updateData.featured === true;
    if (updateData.tags && !Array.isArray(updateData.tags)) updateData.tags = updateData.tags.split(",").map(t => t.trim());
    if (updateData.title && updateData.title !== project.title) delete updateData.slug;

    if (req.file) {
      if (project.imagePublicId) await deleteFromCloudinary(project.imagePublicId);
      else if (project.image) await deleteFromCloudinary(extractPublicId(project.image));

      const result = await uploadToCloudinary(req.file.buffer, "portfolio");
      updateData.image = result.secure_url;
      updateData.imagePublicId = result.public_id;
    }

    const updated = await Portfolio.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: "Project updated!", data: updated });
  } catch (error) {
    console.error("Update portfolio error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

const deletePortfolio = async (req, res) => {
  try {
    const project = await Portfolio.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    if (project.imagePublicId) await deleteFromCloudinary(project.imagePublicId);
    else if (project.image) await deleteFromCloudinary(extractPublicId(project.image));

    for (const img of project.images || []) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }

    res.json({ success: true, message: "Project deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const addGalleryImages = async (req, res) => {
  try {
    const project = await Portfolio.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: "No images uploaded." });

    const captions = req.body.captions ? JSON.parse(req.body.captions) : [];

    const uploadPromises = req.files.map((file, i) =>
      uploadToCloudinary(file.buffer, "portfolio").then(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        caption: captions[i] || "",
      }))
    );

    const newImages = await Promise.all(uploadPromises);
    project.images.push(...newImages);
    await project.save();

    res.json({ success: true, message: `${newImages.length} image(s) added!`, data: project });
  } catch (error) {
    console.error("Add gallery images error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

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
