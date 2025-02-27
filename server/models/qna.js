const mongoose = require("mongoose");

const QnASchema = new mongoose.Schema({
  category: { type: String, required: true },
  questions: [
    {
      text: { type: String, required: true },
      file: { type: String },
      answers: [
        {
          text: { type: String, required: true },
          file: { type: String },
          senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const QnA = mongoose.model("QnA", QnASchema);
module.exports = QnA;

