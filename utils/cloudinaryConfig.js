const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a multer-cloudinary uploader for a specific folder
const createUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `oria-interior/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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
  // e.g. https://res.cloudinary.com/yjxq2hci/image/upload/v123/oria-interior/portfolio/abc.jpg
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex === -1) return null;
  // Skip version segment (v1234...)
  const afterUpload = parts.slice(uploadIndex + 1);
  if (afterUpload[0] && afterUpload[0].startsWith("v")) afterUpload.shift();
  const withExt = afterUpload.join("/");
  return withExt.replace(/\.[^.]+$/, ""); // remove extension
};

module.exports = { cloudinary, createUploader, deleteFromCloudinary, extractPublicId };
