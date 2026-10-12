const GalleryItem = require("../models/GalleryItem");

// Get all before & after gallery items
exports.getGalleryItems = async (req, res) => {
  try {
    const items = await GalleryItem.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error("Get Gallery Items Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching gallery items" });
  }
};

// Create a new before & after gallery item
exports.createGalleryItem = async (req, res) => {
  try {
    const { title, beforeImage, afterImage, category, description } = req.body;

    if (!title || !beforeImage || !afterImage) {
      return res.status(400).json({ success: false, message: "Title, Before Image, and After Image are required." });
    }

    const newItem = await GalleryItem.create({
      title: title.trim(),
      beforeImage: beforeImage.trim(),
      afterImage: afterImage.trim(),
      category: category ? category.trim() : "Residential",
      description: description ? description.trim() : "",
    });

    return res.status(201).json({ success: true, data: newItem, message: "Before & After transformation added successfully!" });
  } catch (error) {
    console.error("Create Gallery Item Error:", error);
    return res.status(500).json({ success: false, message: "Error creating gallery item" });
  }
};

// Update an existing gallery item
exports.updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, beforeImage, afterImage, category, description } = req.body;

    const updatedItem = await GalleryItem.findByIdAndUpdate(
      id,
      {
        ...(title && { title: title.trim() }),
        ...(beforeImage && { beforeImage: beforeImage.trim() }),
        ...(afterImage && { afterImage: afterImage.trim() }),
        ...(category && { category: category.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    return res.json({ success: true, data: updatedItem, message: "Gallery item updated successfully!" });
  } catch (error) {
    console.error("Update Gallery Item Error:", error);
    return res.status(500).json({ success: false, message: "Error updating gallery item" });
  }
};

// Delete a gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GalleryItem.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }

    return res.json({ success: true, message: "Gallery item deleted successfully!" });
  } catch (error) {
    console.error("Delete Gallery Item Error:", error);
    return res.status(500).json({ success: false, message: "Error deleting gallery item" });
  }
};
