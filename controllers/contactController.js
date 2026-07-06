const Contact = require("../models/Contact");
const { sendEmail } = require("../utils/sendEmail");

const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields." });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Email notification to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: contact,
    });
  } catch (error) {
    console.error("Contact error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { submitContact, getAllContacts, updateContactStatus };
