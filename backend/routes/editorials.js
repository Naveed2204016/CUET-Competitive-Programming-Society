const express = require("express");
const mongoose = require("mongoose");
const checkLogin = require("../middleware/authMiddleware");
const Editorial = require("../models/editorialSchema");
const editorial = mongoose.model("Editorial", Editorial);
const { adminChecker } = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all editorials
router.get("/", async (req, res) => {
  try {
    const editorials = await editorial.find().sort({ CreatedAt: -1 }).populate("Author", "Username");
    res.json({ success: true, editorials });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to fetch editorials" });
  }
});

// Get editorial by ID
router.get("/:id", async (req, res) => {
  try {
    const ed = await editorial.findById(req.params.id).populate("Author", "Username");
    if (!ed) {
      return res.status(404).json({ success: false, message: "Editorial not found" });
    }
    res.json({ success: true, editorial: ed });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to fetch editorial" });
  }
});

// Create editorial (Admin only)
router.post("/", checkLogin, adminChecker, async (req, res) => {
  try {
    const newEditorial = new editorial({
      ProblemTitle: req.body.ProblemTitle,
      ContestName: req.body.ContestName,
      ProblemLink: req.body.ProblemLink,
      Content: req.body.Content,
      Difficulty: req.body.Difficulty,
      Author: req.user.id
    });
    await newEditorial.save();
    res.status(201).json({ success: true, message: "Editorial created successfully", editorial: newEditorial });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to create editorial" });
  }
});

// Update editorial (Admin only)
router.put("/:id", checkLogin, adminChecker, async (req, res) => {
  try {
    const ed = await editorial.findByIdAndUpdate(
      req.params.id,
      {
        ProblemTitle: req.body.ProblemTitle,
        ContestName: req.body.ContestName,
        ProblemLink: req.body.ProblemLink,
        Content: req.body.Content,
        Difficulty: req.body.Difficulty,
        UpdatedAt: Date.now()
      },
      { new: true }
    );
    if (!ed) {
      return res.status(404).json({ success: false, message: "Editorial not found" });
    }
    res.json({ success: true, message: "Editorial updated successfully", editorial: ed });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to update editorial" });
  }
});

// Delete editorial (Admin only)
router.delete("/:id", checkLogin, adminChecker, async (req, res) => {
  try {
    const ed = await editorial.findByIdAndDelete(req.params.id);
    if (!ed) {
      return res.status(404).json({ success: false, message: "Editorial not found" });
    }
    res.json({ success: true, message: "Editorial deleted successfully" });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to delete editorial" });
  }
});

module.exports = router;
