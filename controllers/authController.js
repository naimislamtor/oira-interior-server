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

module.exports = { loginAdmin, getMe, setupAdmin };
