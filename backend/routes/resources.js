const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const checkLogin = require("../middleware/authMiddleware");
const { memberChecker } = require("../middleware/roleMiddleware");
const { adminChecker } = require("../middleware/roleMiddleware");
const resourcesSchema = require("../models/resourcesSchema");

const router = express.Router();

// Register model safely
let Resource;
try {
    Resource = mongoose.model("Resource");
} catch (e) {
    Resource = mongoose.model("Resource", resourcesSchema);
}

router.get("/", checkLogin, async (req, res) => {
    try {
        const resources = await Resource.find();
        res.status(200).json({ success: true, resources });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to fetch resources" });
    }
});

router.post("/", checkLogin, adminChecker, async (req, res) => {
    try {
        const newResource = new Resource(
            {
                name: req.body.name,
                classes: req.body.classes,
                blogs: req.body.blogs,
                contests: req.body.contests,
                editorials: req.body.editorials
            }
        )
        await newResource.save();
        res.status(201).json({ success: true, resource: newResource });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to create resource" });
    }
});

router.put("/:id", checkLogin, adminChecker, async (req, res) => {
    try {
        const updatedResource = await Resource.updateOne(
            { _id: req.params.id },
            {
                name: req.body.name,
                classes: req.body.classes,
                blogs: req.body.blogs,
                contests: req.body.contests,
                editorials: req.body.editorials
            }
        );
        res.status(200).json({ success: true, resource: updatedResource });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to update resource" });

    }
});

router.delete("/:id", checkLogin, adminChecker, async (req, res) => {
    try {
        const deleted = await Resource.deleteOne(
            { _id: req.params.id }
        );
        res.status(200).json({ success: true, message: "Resource deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to delete resource" });
    }
});

router.get("/admin", checkLogin, adminChecker, (req, res) => {
    try {
        res.json({ success: true, message: "You have admin access to manage resources" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to check admin access" });
    }
});

// Push a single item into a resource array field (admin only)
router.patch("/:id/add", checkLogin, adminChecker, async (req, res) => {
    try {
        const { field, item } = req.body;
        const allowed = ["classes", "blogs", "contests", "editorials"];
        if (!allowed.includes(field)) {
            return res.status(400).json({ success: false, message: "Invalid field" });
        }
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            { $push: { [field]: item } },
            { new: true }
        );
        if (!resource) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        res.status(200).json({ success: true, resource });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, message: "Failed to add item" });
    }
});


module.exports = router;
