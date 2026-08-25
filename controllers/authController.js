const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required." });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    res.json({
      success: true,
      message: "Login successful!",
      token: generateToken(admin._id),
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const setupAdmin = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res
        .status(403)
        .json({ success: false, message: "Admin already exists." });
    }

    const { name, email, password } = req.body;
    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      success: true,
      message: "Admin created successfully!",
      token: generateToken(admin._id),
    });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const adminEmail = "naimislamtor@gmail.com";
    const currentAdmin = await Admin.findOne({});
    
    const { sendEmail } = require("../utils/sendEmail");

    const loginUrl = `${req.headers.origin || process.env.CLIENT_URL || "https://oriainteriorbd.com"}/admin/login`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #c9a84c;">Oria Interior - Admin Login Assistance</h2>
        <p>Hello Naim Islam,</p>
        <p>You requested password recovery assistance for your Oria Interior Admin Panel.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #c9a84c; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Admin Email:</strong> ${currentAdmin ? currentAdmin.email : 'info@oriainteriorbd.com'}</p>
          <p style="margin: 0;"><strong>Password:</strong> admin123</p>
        </div>
        <p>Log in at: <a href="${loginUrl}">${loginUrl}</a></p>
        <p style="font-size: 12px; color: #777; margin-top: 30px;">This is an automated notification sent to your private admin email.</p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: "Oria Admin Password Recovery Instructions",
      html: htmlContent,
    });

    res.json({
      success: true,
      message: "Password recovery details sent to naimislamtor@gmail.com",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Failed to send reset email." });
  }
};

module.exports = { loginAdmin, getMe, setupAdmin, forgotPassword };
