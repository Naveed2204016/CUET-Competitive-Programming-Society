const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const discussionSchema = require('../models/discussionSchema');
const Discussion = mongoose.model('Discussion', discussionSchema);
const commentSchema = require('../models/commentSchema');
const Comment = mongoose.model('Comment', commentSchema);



router.get('/', authMiddleware, async (req, res)=>{
    try{
        const discussions = await Discussion.find()
            .populate('comments')
            .populate('DID', 'Username Role')
            .sort({ date: -1 });
        res.status(200).json({ success: true, discussions });
    }catch(err){
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', authMiddleware, async (req, res)=>{
    try{
        const newDiscussion = new Discussion(
            {
                Title: req.body.Title,
                Content: req.body.Content,
                date: req.body.Date || Date.now(),
                DID: req.user.id
            }
        );
        await newDiscussion.save();
        res.status(201).json({ success: true, message: "Discussion created successfully" });
    }catch(err){
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', authMiddleware, async (req, res)=>{
    try
    {
        const discussion = await Discussion.findById(req.params.id);
        if(!discussion)
        {
            return res.status(404).json({ success: false, message: "Discussion not found" });
        }
        if(discussion.DID.toString() !== req.user.id)
        {
            return res.status(403).json({ success: false, message: "Unauthorized to update this discussion" });
        }
        discussion.Title = req.body.Title || discussion.Title;
        discussion.Content = req.body.Content || discussion.Content;
        await discussion.save();
        res.status(200).json({ success: true, message: "Discussion updated successfully" });
    }catch(err)
    {
        res.status(500).json({ success: false, message : err.message});
    }
});

router.delete('/:id', authMiddleware, async (req, res)=>{
    try
    {
        const discussion = await Discussion.findById(req.params.id);
        if(!discussion)        {
            return res.status(404).json({ success: false, message: "Discussion not found" });
        }
        if(discussion.DID.toString() !== req.user.id)
        {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this discussion" });
        }
        await Discussion.deleteOne({ _id: req.params.id });
        res.status(200).json({ success: true, message: "Discussion deleted successfully" });
    }catch(err)
    {
        res.status(500).json({ success: false, message : err.message});
    }
});

router.post('/:id/comments', authMiddleware, async (req, res)=>{
    try
    {
        const discussion = await Discussion.findById(req.params.id);
        if(!discussion)
        {
            return res.status(404).json({ success: false, message: "Discussion not found" });
        }
        const newComment = new Comment(
            {
                username: req.user.Username,
                content: req.body.content
            }
        );
        await newComment.save();
        discussion.comments.push(newComment._id);
        await discussion.save();
        res.status(201).json({ success: true, message: "Comment added successfully" });

    }catch(err)
    {
        res.status(500).json({ success: false, message : err.message});
    }
});

router.delete('/:discussionId/comments/:commentId', authMiddleware, async (req, res)=>{
    try
    {
        const discussion = await Discussion.findById(req.params.discussionId);
        if(!discussion)
        {
            return res.status(404).json({ success: false, message: "Discussion not found" });
        }
        const comment = await Comment.findById(req.params.commentId);
        if(!comment)
        {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }
        if(comment.username !== req.user.Username)
        {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
        }
        await Comment.deleteOne({ _id: req.params.commentId });
        discussion.comments = discussion.comments.filter(c => c.toString() !== req.params.commentId);
        await discussion.save();
        res.status(200).json({ success: true, message: "Comment deleted successfully" });
    }catch(err)
    {
        res.status(500).json({ success: false, message : err.message});

    }
    
});



module.exports = router;