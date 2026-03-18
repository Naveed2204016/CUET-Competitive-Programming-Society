const mongoose= require('mongoose');
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const UserSchema = require('../models/userSchema');
const discussionSchema = require('../models/discussionSchema');
const bcrypt = require('bcrypt');

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Discussion = mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);
const router = express.Router();


router.get('/profiledetails', authMiddleware, async (req, res) => {
    try
    {
        const user = await User.findById(req.user.id).select('-password');
        if(user)
        {
            res.status(200).json({ success: true, user });
        }
        else
        {
            res.status(404).json({ success: false, message: "User not found" });
        }
    }catch(err)
    {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/mydiscussions', authMiddleware, async (req, res) => {
    try
    {
        const discussions = await Discussion.find({ DID: req.user.id }).populate("comments").populate("DID", "Username Role").sort({ date: -1 });
        res.status(200).json({ success: true, discussions });
    }catch(err)
    {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/profileupdate', authMiddleware, async (req, res) => {
    try
    {
        const user = await User.findById(req.user.id);
        if(!user)
        {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.Username = req.body.Username || user.Username;
        user.Email = req.body.Email || user.Email;
        user.CfHandle = req.body.CfHandle || user.CfHandle;
        user.ID = req.body.ID || user.ID;
        if(req.body.Password)
        {
            const salt = await bcrypt.genSalt(10);
            user.Password = await bcrypt.hash(req.body.Password, salt);
        }
        await user.save();
        res.status(200).json({ success: true, message: "Profile updated successfully" });
    }catch(err)
    {
        res.status(500).json({ success: false, message: err.message });

    }
});

router.put('/changepassword', authMiddleware, async (req, res) => {
    try
    {
        const user = await User.findById(req.user.id);
        if(!user)
        {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isMatch = await bcrypt.compare(req.body.CurrentPassword, user.Password);
        if(!isMatch)
        {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10);
        user.Password = await bcrypt.hash(req.body.NewPassword, salt);
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully" });
    }catch(err)
    {
        res.status(500).json({ success: false, message: err.message });

    }
});

module.exports = router;

