const Portfolio = require("../models/Portfolio");
const { deleteFromCloudinary, extractPublicId } = require("../utils/cloudinaryConfig");

// @GET /api/portfolio (public)
const getAllPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.find().sort({ createdAt: -1 });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @GET /api/portfolio/:id (public)
const getPortfolioById = async (req, res) => {
  try {
    const project = await Portfolio.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @POST /api/portfolio (admin only)
const createPortfolio = async (req, res) => {
  try {
    const { title, category, location, year, description, featured } = req.body;
    if (!title || !category) return res.status(400).json({ success: false, message: "Title and category are required." });
    if (!req.file) return res.status(400).json({ success: false, message: "Project image is required." });

    const project = await Portfolio.create({
      title, category, location, year, description,
      featured: featured === "true" || featured === true,
      image: req.file.path,           // Cloudinary secure URL
      imagePublicId: req.file.filename, // Cloudinary public_id
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
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === "true" || updateData.featured === true;
    }

    if (req.file) {
      // Delete old image from Cloudinary
      if (project.imagePublicId) await deleteFromCloudinary(project.imagePublicId);
      else if (project.image) await deleteFromCloudinary(extractPublicId(project.image));

      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    const updated = await Portfolio.findByIdAndUpdate(req.params.id, updateData, { new: true });
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

    // Delete from Cloudinary
    if (project.imagePublicId) await deleteFromCloudinary(project.imagePublicId);
    else if (project.image) await deleteFromCloudinary(extractPublicId(project.image));

    res.json({ success: true, message: "Project deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAllPortfolio, getPortfolioById, createPortfolio, updatePortfolio, deletePortfolio };
