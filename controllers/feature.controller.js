import Feature from "../models/feature.model.js";

// GET ALL FEATURES
export const getAllFeatures = async (req, res) => {
  try {
    const features = await Feature.find();
    res.json(features);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch features" });
  }
};

// CREATE FEATURE
export const createFeature = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newFeature = new Feature({
      img: `/uploads/${req.file.filename}`,
      title: req.body.title,
      text: req.body.text,
      link: req.body.link || "",
    });

    await newFeature.save();
    res.json(newFeature);
  } catch (err) {
    res.status(500).json({ message: "Failed to create feature" });
  }
};

// UPDATE FEATURE
export const updateFeature = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      text: req.body.text,
      link: req.body.link || "",
    };

    if (req.file) {
      updateData.img = `/uploads/${req.file.filename}`;
    }

    const updatedFeature = await Feature.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedFeature);
  } catch (err) {
    res.status(500).json({ message: "Failed to update feature" });
  }
};

// DELETE FEATURE
export const deleteFeature = async (req, res) => {
  try {
    await Feature.findByIdAndDelete(req.params.id);
    res.json({ message: "Feature deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete feature" });
  }
};
