const Team = require("../models/Team");

// @GET /api/team (public)
const getAllTeamMembers = async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: team });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @POST /api/team (admin only)
const createTeamMember = async (req, res) => {
  try {
    const { name, designation, imageUrl, order } = req.body;

    if (!name || !designation || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Name, designation, and image URL are required.",
      });
    }

    const member = await Team.create({
      name,
      designation,
      imageUrl,
      order: order ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Team member added successfully!",
      data: member,
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @PUT /api/team/:id (admin only)
const updateTeamMember = async (req, res) => {
  try {
    const { name, designation, imageUrl, order } = req.body;

    const member = await Team.findByIdAndUpdate(
      req.params.id,
      { name, designation, imageUrl, order: order ? Number(order) : 0 },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    res.json({
      success: true,
      message: "Team member updated successfully!",
      data: member,
    });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @DELETE /api/team/:id (admin only)
const deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    res.json({ success: true, message: "Team member deleted successfully!" });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
