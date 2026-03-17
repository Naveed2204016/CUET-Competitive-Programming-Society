const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    Title:
    {
        type: String,
        required: true
    },
    Content:
    {
        type: String,
        required: true
    },
    date : {
        type: Date,
        default: Date.now
    },

    comments :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],

    DID : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = discussionSchema;