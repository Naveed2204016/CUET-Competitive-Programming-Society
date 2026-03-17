const express = require("express");
const mongoose = require("mongoose");
const checkLogin = require("../middleware/authMiddleware");
const { memberChecker } = require("../middleware/roleMiddleware");
const { adminChecker } = require("../middleware/roleMiddleware");
const contestSchema = require("../models/contestSchema");
const Contest = mongoose.model("Contest", contestSchema);

const router = express.Router();

router.get("/", checkLogin, async (req, res) => {
    try{
        const contests = await Contest.find().sort({ date: -1 });
        res.json({ success: true, contests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/", checkLogin, adminChecker, async (req, res) => {
    try{
        const contest = new Contest({
            name: req.body.name,
            date: req.body.date,
            contestlink: req.body.contestlink
        });
        await contest.save();
        res.status(201).json({ success: true, message: "Contest added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete("/:id", checkLogin, adminChecker, async (req, res) => {
    try {
        const deletedContest = await Contest.findById(req.params.id);
        if (!deletedContest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }
        await Contest.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: "Contest deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/:id", checkLogin, adminChecker, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) {
            return res.status(404).json({ success: false, message: "Contest not found" });
        }
        contest.name = req.body.name || contest.name;
        contest.date = req.body.date || contest.date;
        contest.contestlink = req.body.contestlink || contest.contestlink;
        await contest.save();
        res.json({ success: true, message: "Contest updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/admin', checkLogin, adminChecker, (req, res) => {
    try
    {
    res.json({ success: true, message: "You have access to manage contests" });
    }
    catch (err)
    {
    res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
