const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    username : 
    {
        type : String,
        required : true
    },

    content :
    {
        type : String,
        required : true
    }
});

module.exports = commentSchema;