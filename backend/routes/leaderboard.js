const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const UserSchema = require('../models/userSchema');

const User = mongoose.models.User || mongoose.model('User', UserSchema);

router.get('/', authMiddleware, async (req, res) => {
    try {
        const data = await User.find({}, 'Username ID Email CfHandle Role').lean();
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;