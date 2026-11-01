const Team = require("../models/Team");
const { deleteFromCloudinary, extractPublicId } = require("../utils/cloudinaryConfig");

// @GET /api/team (public)
const getAllTeamMembers = async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @POST /api/team (admin only)
const createTeamMember = async (req, res) => {
  try {
    const { name, designation, order } = req.body;
    if (!name || !designation) return res.status(400).json({ success: false, message: "Name and designation are required." });

    // Accept file upload OR manual URL
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;
    const imagePublicId = req.file ? req.file.filename : null;
    if (!imageUrl) return res.status(400).json({ success: false, message: "Team member photo is required." });

    const member = await Team.create({ name, designation, imageUrl, imagePublicId, order: order ? Number(order) : 0 });
    res.status(201).json({ success: true, message: "Team member added!", data: member });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @PUT /api/team/:id (admin only)
const updateTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });

    const updateData = { ...req.body };
    if (updateData.order) updateData.order = Number(updateData.order);

    if (req.file) {
      if (member.imagePublicId) await deleteFromCloudinary(member.imagePublicId);
      else if (member.imageUrl) await deleteFromCloudinary(extractPublicId(member.imageUrl));
      updateData.imageUrl = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    const updated = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: "Team member updated!", data: updated });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @DELETE /api/team/:id (admin only)
const deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });

    if (member.imagePublicId) await deleteFromCloudinary(member.imagePublicId);
    else if (member.imageUrl) await deleteFromCloudinary(extractPublicId(member.imageUrl));

    res.json({ success: true, message: "Team member deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
