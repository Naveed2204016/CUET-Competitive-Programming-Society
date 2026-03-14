const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  StartTime: { type: Date, required: true },
  EndTime: { type: Date, required: true },
  Platform: { type: String, required: true }, // e.g., "Codeforces", "VJudge", "CodeChef"
  Link: { type: String, required: true },
  Level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  Type: { type: String, enum: ['Intra-CUET', 'External', 'Team Formation'], default: 'Intra-CUET' },
  Participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  CreatedDate: { type: Date, default: Date.now },
  Status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' }
});

module.exports = contestSchema;
