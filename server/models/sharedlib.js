const mongoose = require("mongoose");

const SharedLibSchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  courses: [
    {
      courseName: { type: String, required: true },
      files: [
        {
          fileName: { type: String, required: true },
          fileUrl: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("SharedLib", SharedLibSchema);
