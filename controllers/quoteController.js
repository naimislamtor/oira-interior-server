const Quote = require("../models/Quote");
const { sendEmail } = require("../utils/sendEmail");

const submitQuote = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      service,
      projectSize,
      rooms,
      projectAddress,
      budget,
      startDate,
      deadline,
      description,
      heardFrom,
    } = req.body;

    if (!name || !email || !phone || !service || !budget || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields." });
    }

    const files = req.files ? req.files.map((f) => f.filename) : [];

    const quote = await Quote.create({
      name,
      email,
      phone,
      city,
      service,
      projectSize,
      rooms,
      projectAddress,
      budget,
      startDate,
      deadline,
      description,
      heardFrom,
      files,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Quote Request: ${service} — ${name}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city || "N/A"}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Project Size:</strong> ${projectSize || "N/A"}</p>
        <p><strong>Rooms:</strong> ${rooms || "N/A"}</p>
        <p><strong>Budget:</strong> ${budget}</p>
        <p><strong>Start Date:</strong> ${startDate || "N/A"}</p>
        <p><strong>Deadline:</strong> ${deadline || "N/A"}</p>
        <p><strong>Description:</strong><br/>${description}</p>
        <p><strong>Files uploaded:</strong> ${files.length}</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Quote request submitted!",
      data: quote,
    });
  } catch (error) {
    console.error("Quote error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

const getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateQuoteStatus = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { submitQuote, getAllQuotes, updateQuoteStatus };
