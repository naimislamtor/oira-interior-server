const Team = require("../models/Team");
const { uploadToCloudinary, deleteFromCloudinary, extractPublicId } = require("../utils/cloudinaryConfig");

const getAllTeamMembers = async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const createTeamMember = async (req, res) => {
  try {
    const { name, designation, order } = req.body;
    if (!name || !designation) return res.status(400).json({ success: false, message: "Name and designation are required." });

    let imageUrl = req.body.imageUrl || "";
    let imagePublicId = null;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "team");
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    if (!imageUrl) return res.status(400).json({ success: false, message: "Team member photo is required." });

    const member = await Team.create({ name, designation, order: order || 0, imageUrl, imagePublicId });
    res.status(201).json({ success: true, message: "Team member added!", data: member });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Team member not found." });

    const updateData = { ...req.body };

    if (req.file) {
      if (member.imagePublicId) await deleteFromCloudinary(member.imagePublicId);
      else if (member.imageUrl) await deleteFromCloudinary(extractPublicId(member.imageUrl));

      const result = await uploadToCloudinary(req.file.buffer, "team");
      updateData.imageUrl = result.secure_url;
      updateData.imagePublicId = result.public_id;
    }

    const updated = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, message: "Team member updated!", data: updated });
  } catch (error) {
    console.error("Update team error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error." });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Team member not found." });

    if (member.imagePublicId) await deleteFromCloudinary(member.imagePublicId);
    else if (member.imageUrl) await deleteFromCloudinary(extractPublicId(member.imageUrl));

    res.json({ success: true, message: "Team member deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
