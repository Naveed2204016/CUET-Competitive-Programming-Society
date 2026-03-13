const mongoose = require("mongoose");

const editorialSchema = new mongoose.Schema({
  ProblemTitle: {
    type: String,
    required: true
  },
  ContestName: {
    type: String,
    required: true
  },
  ProblemLink: {
    type: String,
    required: true
  },
  Content: {
    type: String,
    required: true
  },
  Difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  Author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  CreatedAt: {
    type: Date,
    default: Date.now
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = editorialSchema;
