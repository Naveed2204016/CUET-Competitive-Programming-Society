const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = mongoose.model("User", User);

const router = express.Router();

router.post("/signup", async (req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.Password, 10);
        const newUser = new user({
            Username: req.body.Username,
            ID: req.body.ID,
            Email: req.body.Email,
            CfHandle: req.body.CfHandle,
            Password: hashedPassword,
            Role: req.body.Role || 'member'
        });
        await newUser.save();
        res.status(201).json({success: true, message: "User registered successfully" });
    }
    catch (err)
    {
        res.status(500).json({ success: false, error: err.message , message: "Signup failed" });
    }
});

router.post("/login", async (req,res) => {
    try{
        const existingUser = await user.findOne({ Username: req.body.Username });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const passwordMatch = await bcrypt.compare(req.body.Password, existingUser.Password);
        if(passwordMatch)
        {
            const token = jwt.sign({ Username: existingUser.Username, Role: existingUser.Role , ID : existingUser.ID , id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
            res.json({ success: true, token, role: existingUser.Role , Username: existingUser.Username, ID: existingUser.ID});

        }
        else
        {
            res.status(401).json({ success: false, message: "Incorrect password" });
        }
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).json({ success: false, error: err.message , message: "Login failed" });
    }
});

module.exports = {router, user};

