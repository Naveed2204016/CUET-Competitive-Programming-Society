const mongoose = require("mongoose");


const announcementSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    Content: { type: String, required: true },
    Date: { type: Date, default: Date.now },
    AID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports= announcementSchema;