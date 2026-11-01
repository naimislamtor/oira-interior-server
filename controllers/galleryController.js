const GalleryItem = require("../models/GalleryItem");
const { deleteFromCloudinary, extractPublicId } = require("../utils/cloudinaryConfig");

// Get all gallery items
exports.getGalleryItems = async (req, res) => {
  try {
    const items = await GalleryItem.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching gallery items" });
  }
};

// Create gallery item — accepts file uploads (beforeImage, afterImage)
exports.createGalleryItem = async (req, res) => {
  try {
    const { title, category, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required." });

    const files = req.files || {};
    const beforeFile = files.beforeImage?.[0];
    const afterFile  = files.afterImage?.[0];

    // Allow either uploaded file OR manually provided URL
    const beforeImage = beforeFile ? beforeFile.path : req.body.beforeImage;
    const afterImage  = afterFile  ? afterFile.path  : req.body.afterImage;
    const beforePublicId = beforeFile ? beforeFile.filename : null;
    const afterPublicId  = afterFile  ? afterFile.filename  : null;

    if (!beforeImage || !afterImage) {
      return res.status(400).json({ success: false, message: "Before and After images are required." });
    }

    const newItem = await GalleryItem.create({
      title: title.trim(),
      beforeImage, afterImage,
      beforePublicId, afterPublicId,
      category: category?.trim() || "Residential",
      description: description?.trim() || "",
    });

    return res.status(201).json({ success: true, data: newItem, message: "Transformation added!" });
  } catch (error) {
    console.error("Create Gallery Error:", error);
    return res.status(500).json({ success: false, message: "Error creating gallery item" });
  }
};

// Update gallery item
exports.updateGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });

    const files = req.files || {};
    const updateData = {};

    if (req.body.title) updateData.title = req.body.title.trim();
    if (req.body.category) updateData.category = req.body.category.trim();
    if (req.body.description !== undefined) updateData.description = req.body.description.trim();

    const beforeFile = files.beforeImage?.[0];
    const afterFile  = files.afterImage?.[0];

    if (beforeFile) {
      if (item.beforePublicId) await deleteFromCloudinary(item.beforePublicId);
      else if (item.beforeImage) await deleteFromCloudinary(extractPublicId(item.beforeImage));
      updateData.beforeImage = beforeFile.path;
      updateData.beforePublicId = beforeFile.filename;
    } else if (req.body.beforeImage) {
      updateData.beforeImage = req.body.beforeImage;
    }

    if (afterFile) {
      if (item.afterPublicId) await deleteFromCloudinary(item.afterPublicId);
      else if (item.afterImage) await deleteFromCloudinary(extractPublicId(item.afterImage));
      updateData.afterImage = afterFile.path;
      updateData.afterPublicId = afterFile.filename;
    } else if (req.body.afterImage) {
      updateData.afterImage = req.body.afterImage;
    }

    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.json({ success: true, data: updated, message: "Gallery item updated!" });
  } catch (error) {
    console.error("Update Gallery Error:", error);
    return res.status(500).json({ success: false, message: "Error updating gallery item" });
  }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Gallery item not found" });

    if (item.beforePublicId) await deleteFromCloudinary(item.beforePublicId);
    else if (item.beforeImage) await deleteFromCloudinary(extractPublicId(item.beforeImage));

    if (item.afterPublicId) await deleteFromCloudinary(item.afterPublicId);
    else if (item.afterImage) await deleteFromCloudinary(extractPublicId(item.afterImage));

    return res.json({ success: true, message: "Gallery item deleted!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting gallery item" });
  }
};
