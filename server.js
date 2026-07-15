const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/quote", require("./routes/quoteRoutes"));
app.use("/api/appointment", require("./routes/appointmentRoutes"));
app.use("/api/consultation", require("./routes/consultationRoutes"));
app.use("/api/portfolio", require("./routes/portfolioRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "Oria Interior Server Running ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
