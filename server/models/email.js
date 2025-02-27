const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    required: true,
  },
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  emails: [emailSchema], 
});

module.exports = mongoose.model("CategoryforEmail", categorySchema);
