const Consultation = require("../models/Consultation");
const { sendEmail } = require("../utils/sendEmail");

const submitConsultation = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      service,
      budget,
      consultationType,
      projectDescription,
      requirements,
      questions,
    } = req.body;

    if (!name || !phone || !consultationType || !projectDescription) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields." });
    }

    const consultation = await Consultation.create({
      name,
      email,
      phone,
      service,
      budget,
      consultationType,
      projectDescription,
      requirements,
      questions,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Consultation Request: ${name}`,
      html: `
        <h2>New Free Consultation Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email || "N/A"}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service || "N/A"}</p>
        <p><strong>Budget:</strong> ${budget || "N/A"}</p>
        <p><strong>Consultation Type:</strong> ${consultationType}</p>
        <p><strong>Project Description:</strong><br/>${projectDescription}</p>
        <p><strong>Requirements:</strong><br/>${requirements || "N/A"}</p>
        <p><strong>Questions:</strong><br/>${questions || "N/A"}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Consultation request submitted!",
      data: consultation,
    });
  } catch (error) {
    console.error("Consultation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

const getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateConsultationStatus = async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  submitConsultation,
  getAllConsultations,
  updateConsultationStatus,
};
