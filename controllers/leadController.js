const Lead = require("../models/Lead");

// Get all leads (with optional filtering)
exports.getLeads = async (req, res) => {
  try {
    const { source, status, search } = req.query;
    let query = {};

    if (source) query.source = source;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Get Leads Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching leads" });
  }
};

// Create a new lead manually
exports.createLead = async (req, res) => {
  try {
    const { name, phone, email, source, serviceNeeded, details, notes } = req.body;

    if (!name || (!phone && !email)) {
      return res.status(400).json({ success: false, message: "Name and at least one contact method (phone or email) are required." });
    }

    const lead = await Lead.create({
      name,
      phone,
      email,
      source: source || "Manual Entry",
      serviceNeeded: serviceNeeded || "Interior Design & Consultation",
      details: details || "",
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);
    return res.status(500).json({ success: false, message: "Error creating lead" });
  }
};

// Update lead status/notes
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, name, phone, email, serviceNeeded } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
          ...(name && { name }),
          ...(phone && { phone }),
          ...(email && { email }),
          ...(serviceNeeded && { serviceNeeded }),
        },
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    return res.json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);
    return res.status(500).json({ success: false, message: "Error updating lead" });
  }
};

// Delete a lead
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    return res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting lead" });
  }
};
