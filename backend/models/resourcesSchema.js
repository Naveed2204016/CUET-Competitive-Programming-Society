const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    name : { type: String, required: true },
    classes : [{ name: String, url: String }],
    blogs : [{ name: String, url: String }],
    contests : [{ name: String, url: String }],
    editorials : [String]
});

module.exports=resourceSchema;