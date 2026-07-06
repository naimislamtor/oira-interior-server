const Appointment = require("../models/Appointment");
const { sendEmail } = require("../utils/sendEmail");

const submitAppointment = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      service,
      preferredDate,
      preferredTime,
      meetingType,
      message,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !service ||
      !preferredDate ||
      !preferredTime ||
      !meetingType
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields." });
    }

    const appointment = await Appointment.create({
      name,
      email,
      phone,
      service,
      preferredDate,
      preferredTime,
      meetingType,
      message,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Appointment: ${name} — ${preferredDate} at ${preferredTime}`,
      html: `
        <h2>New Appointment Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Date:</strong> ${preferredDate}</p>
        <p><strong>Time:</strong> ${preferredTime}</p>
        <p><strong>Meeting Type:</strong> ${meetingType}</p>
        <p><strong>Notes:</strong> ${message || "N/A"}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked!",
      data: appointment,
    });
  } catch (error) {
    console.error("Appointment error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = {
  submitAppointment,
  getAllAppointments,
  updateAppointmentStatus,
};
