const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer — memory storage (no disk, no cloudinary-storage dependency)
const memoryStorage = multer.memoryStorage();

const createUploader = (folder, fields = null) => {
  const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image files are allowed"), false);
    },
  });

  if (fields) return upload.fields(fields);
  return upload;
};

// Upload a single buffer to Cloudinary (stream)
const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `oria-interior/${folder}`,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Delete image from Cloudinary using public_id
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

// Extract public_id from a Cloudinary URL
const extractPublicId = (url) => {
  if (!url || !url.includes("cloudinary")) return null;
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  const afterUpload = parts.slice(uploadIndex + 1);
  if (afterUpload[0] && afterUpload[0].startsWith("v")) afterUpload.shift();
  const withExt = afterUpload.join("/");
  return withExt.replace(/\.[^.]+$/, "");
};

module.exports = {
  cloudinary,
  createUploader,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
};
