const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const checkLogin = require("../middleware/authMiddleware");
const Announcement = require("../models/announcementSchema");
const announcement = mongoose.model("Announcement", Announcement);
const { memberChecker } = require("../middleware/roleMiddleware");
const { adminChecker } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", checkLogin, async (req, res) => {
    try {
        const announcements = await announcement.find().sort({ Date: -1 });
        res.json({ success: true, announcements });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to fetch announcements" });
    }
});

router.post("/", checkLogin, adminChecker , async (req, res) => {
    try
    {
        const newAnnouncement = new announcement({
            Title: req.body.Title,
            Content: req.body.Content,
            Date: req.body.Date || Date.now(),
            AID: req.user.id
        });
        await newAnnouncement.save();
        res.status(201).json({ success: true, message: "Announcement created successfully" });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to create announcement" });

    }
});

router.get("/post", checkLogin, adminChecker , (req, res) => {
    try
    {
    res.json({ success: true, message: "You have access to post announcements" });
    }
    catch (err) {
    res.status(500).json({ success: false, error: err.message, message: "Failed to check post access" });
    }

});

router.delete("/:title", checkLogin, adminChecker, async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title);
        const deleted = await announcement.findOneAndDelete({ Title: title });
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        res.json({ success: true, message: "Announcement deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to delete announcement" });
    }
});

router.put("/:title", checkLogin, adminChecker, async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title);
        const updated = await announcement.findOneAndUpdate(
            { Title: title },
            { Title: req.body.Title, Content: req.body.Content },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }
        res.json({ success: true, message: "Announcement updated successfully", announcement: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to update announcement" });
    }
});

module.exports = router;