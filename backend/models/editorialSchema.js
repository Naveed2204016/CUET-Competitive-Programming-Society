const mongoose = require('mongoose');


const editorialSchema = new mongoose.Schema({
  contestName: { type: String, required: true },
  editorialContent: { type: String, required: true },
});

module.exports= editorialSchema;