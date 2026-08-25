const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  getMe,
  setupAdmin,
  forgotPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", loginAdmin);
router.get("/me", protect, getMe);
router.post("/setup", setupAdmin);
router.post("/forgot-password", forgotPassword);

module.exports = router;
