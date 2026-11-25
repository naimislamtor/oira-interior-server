const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "https://oriainteriorbd.com",
  "https://www.oriainteriorbd.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  abortOnLimit: true,
  useTempFiles: false, // keep files in memory as Buffer
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/quote", require("./routes/quoteRoutes"));
app.use("/api/appointment", require("./routes/appointmentRoutes"));
app.use("/api/consultation", require("./routes/consultationRoutes"));
app.use("/api/blog", require("./routes/blogRoutes"));
app.use("/api/portfolio", require("./routes/portfolioRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/webhook", require("./routes/webhookRoutes"));
app.use("/api/admin/leads", require("./routes/leadRoutes"));
app.use("/api/knowledge", require("./routes/knowledgeRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/faq", require("./routes/faqRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Oria Interior Server Running ✅" });
});

// Global error handler — catches multer, cloudinary, and other errors
app.use((err, req, res, next) => {
  console.error("Global error:", err.message || err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "ছবির সাইজ ১০MB-এর বেশি হবে না।" });
  }

  // Cloudinary / network timeout
  if (err.code === "ETIMEDOUT" || err.name === "AggregateError" || (err.message && err.message.includes("ETIMEDOUT"))) {
    return res.status(503).json({ success: false, message: "Cloudinary-তে সংযোগ হচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।" });
  }

  // Cloudinary API error
  if (err.http_code) {
    return res.status(err.http_code).json({ success: false, message: `Cloudinary error: ${err.message}` });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error.",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
