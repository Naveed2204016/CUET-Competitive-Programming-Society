const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { adminChecker } = require("../middleware/roleMiddleware");
const editorialSchema = require('../models/editorialSchema');
const mongoose = require('mongoose');
const Editorial = mongoose.model('Editorial', editorialSchema);
const router = express.Router();


router.get('/', authMiddleware, async (req, res) => {
    try
    {
      const editorials = await Editorial.find({});
      res.json({ success: true, editorials });
    }catch(err)
    {
      res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});




router.get('/post', authMiddleware, adminChecker, (req, res) => {
    try
    {
      res.status(200).json({ success: true, message: "You have access to post editorials" });
    }catch(err)
    {
      res.status(500).json({ success: false, message: err.message  });
    }
});


router.post('/', authMiddleware, adminChecker, async (req, res) => {
    try
    {
        const editorial = new Editorial 
        (
          {
            contestName: req.body.contestName,
            editorialContent: req.body.editorialContent
          }
        );

        await editorial.save();
        res.status(201).json({ success: true, message: "Editorial created successfully" });
      }catch(err)
      {
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
      }
});

router.delete('/:id', authMiddleware, adminChecker, async (req, res) => {
    try
    {
      await Editorial.deleteOne({ _id: req.params.id });
      res.json({ success: true, message: "Editorial deleted successfully" });
    }
    catch(err)
    {
      res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});


router.put('/:id', authMiddleware, adminChecker, async (req, res) => {
    try
    {
       await Editorial.updateOne({ _id: req.params.id },
        {
          contestName : req.body.contestName,
          editorialContent : req.body.editorialContent
        }
       );
      res.json({ success: true, message: "Editorial updated successfully" });
    }catch(err)
    {
      res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
  });

module.exports = router;