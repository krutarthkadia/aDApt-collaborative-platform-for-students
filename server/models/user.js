const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  profileImg: { type: String, default: "https://res.cloudinary.com/dge7zdb1k/image/upload/v1737556114/img1_ct49gi.jpg"},
});

module.exports = mongoose.model("User", userSchema);
