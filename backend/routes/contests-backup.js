const express = require("express");
const mongoose = require("mongoose");
const checkLogin = require("../middleware/authMiddleware");
const { adminChecker } = require("../middleware/roleMiddleware");
const contestSchema = require("../models/contestSchema");

const router = express.Router();

// Register model safely
let Contest;
try {
  Contest = mongoose.model("Contest");
} catch (e) {
  Contest = mongoose.model("Contest", contestSchema);
}

// Get all contests
router.get("/", async (req, res) => {
  try {
    const contests = await Contest.find().sort({ StartTime: -1 })
      .populate("CreatedBy", "Username")
      .populate("Participants", "Username CfHandle");
    res.json({ success: true, contests });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to fetch contests" });
  }
});

// Create new contest (Admin only) - MUST come before /:id routes
router.post("/", checkLogin, adminChecker, async (req, res) => {
  try {
    console.log("📝 POST /api/contests - Create contest request");
    console.log("User:", req.user);
    console.log("Body:", req.body);

    const { Title, Description, StartTime, EndTime, Platform, Link, Level, Type } = req.body;

    // Validate required fields
    if (!Title || !Description || !StartTime || !EndTime || !Platform || !Link) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: Title, Description, StartTime, EndTime, Platform, Link"
      });
    }

    const newContest = new Contest({
      Title,
      Description,
      StartTime: new Date(StartTime),
      EndTime: new Date(EndTime),
      Platform,
      Link,
      Level: Level || 'Intermediate',
      Type: Type || 'Intra-CUET',
      CreatedBy: req.user.id,
      Status: 'Upcoming'
    });

    await newContest.save();
    console.log("✅ Contest created:", newContest._id);
    res.status(201).json({ success: true, message: "Contest created successfully", contest: newContest });
  }
  catch (err) {
    console.error("❌ Error creating contest:", err);
    res.status(500).json({ success: false, error: err.message, message: "Failed to create contest" });
  }
});

// Get contests by status
router.get("/status/:status", async (req, res) => {
  try {
    const status = req.params.status;
    const contests = await Contest.find({ Status: status }).sort({ StartTime: -1 })
      .populate("CreatedBy", "Username")
      .populate("Participants", "Username CfHandle");
    res.json({ success: true, contests });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to fetch contests" });
  }
});

// Get single contest by ID
router.get("/:id", async (req, res) => {
  try {
    const contestData = await Contest.findById(req.params.id)
      .populate("CreatedBy", "Username")
      .populate("Participants", "Username CfHandle");
    if (!contestData) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    res.json({ success: true, contest: contestData });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to fetch contest" });
  }
});

// Register user for contest
router.post("/:id/register", checkLogin, async (req, res) => {
  try {
    const contestData = await Contest.findById(req.params.id);
    if (!contestData) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    if (contestData.Participants.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: "Already registered for this contest" });
    }

    contestData.Participants.push(req.user.id);
    await contestData.save();
    res.json({ success: true, message: "Registered for contest successfully" });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to register for contest" });
  }
});

// Unregister user from contest
router.post("/:id/unregister", checkLogin, async (req, res) => {
  try {
    const contestData = await Contest.findById(req.params.id);
    if (!contestData) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    contestData.Participants = contestData.Participants.filter(
      id => id.toString() !== req.user.id.toString()
    );
    await contestData.save();
    res.json({ success: true, message: "Unregistered from contest successfully" });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to unregister from contest" });
  }
});

// Update contest (Admin only)
router.put("/:id", checkLogin, adminChecker, async (req, res) => {
  try {
    const contestData = await Contest.findByIdAndUpdate(
      req.params.id,
      {
        Title: req.body.Title,
        Description: req.body.Description,
        StartTime: req.body.StartTime,
        EndTime: req.body.EndTime,
        Platform: req.body.Platform,
        Link: req.body.Link,
        Level: req.body.Level,
        Type: req.body.Type,
        Status: req.body.Status
      },
      { new: true }
    );
    if (!contestData) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    res.json({ success: true, message: "Contest updated successfully", contest: contestData });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to update contest" });
  }
});

// Delete contest (Admin only)
router.delete("/:id", checkLogin, adminChecker, async (req, res) => {
  try {
    const contestData = await Contest.findByIdAndDelete(req.params.id);
    if (!contestData) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    res.json({ success: true, message: "Contest deleted successfully" });
  }
  catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to delete contest" });
  }
});

module.exports = router;
