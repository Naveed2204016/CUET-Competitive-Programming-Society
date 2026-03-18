const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    name: 
    {
        type: String,
        required: true
    },
    date:
    {
        type: Date,
        required: true
    },
    contestlink:
    {
        type: String,
        required: true
    }
});

module.exports = contestSchema;