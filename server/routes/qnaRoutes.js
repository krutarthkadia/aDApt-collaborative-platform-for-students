const express = require("express");
const QnA = require("../models/qna");
const multer = require("multer");
let io; // Declare io globally in this file

const router = express.Router();

// Multer setup for file uploads (storing files on disk)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Generate a unique filename
  }
});
const upload = multer({ storage: storage });

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await QnA.find().distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Add a category
router.post("/categories/add", async (req, res) => {
  try {
    const { category } = req.body;
    const existing = await QnA.findOne({ category });
    if (existing) return res.status(400).json({ error: "Category exists" });

    const newCategory = new QnA({ category, questions: [] });
    await newCategory.save();
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: "Failed to add category" });
  }
});

// Remove a category
router.delete("/categories/:category/remove", async (req, res) => {
  try {
    const { category } = req.params;
    await QnA.deleteOne({ category });
    res.json({ message: "Category removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove category" });
  }
});

// Get questions for a category
router.get("/categories/:category/questions", async (req, res) => {
  try {
    const { category } = req.params;
    const categoryData = await QnA.findOne({ category });
    res.json(categoryData ? categoryData.questions : []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Add a question
router.post("/categories/:category/questions", upload.single("file"), async (req, res) => {
  try {
    const { category } = req.params;
    const { text } = req.body;
    const file = req.file ? req.file.buffer.toString("base64") : null;

    let categoryData = await QnA.findOne({ category });
    if (!categoryData) {
      categoryData = new QnA({ category, questions: [] });
    }

    const newQuestion = { text, file, answers: [], createdAt: new Date() };
    categoryData.questions.push(newQuestion);
    await categoryData.save();
    res.json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: "Failed to add question" });
  }
});

// Get answers for a question
router.post("/categories/:category/answers/get", async (req, res) => {
  try {
    const { category } = req.params;
    const { questionId } = req.body;

    const categoryData = await QnA.findOne({ category });
    const question = categoryData.questions.id(questionId);
    res.json(question ? question.answers : []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch answers" });
  }
});

// Add an answer and emit real-time update
router.post("/categories/:category/answers", upload.single("file"), async (req, res) => {
  try {
    const { category } = req.params;
    const { questionId, text, senderId } = req.body;
    const file = req.file ? req.file.buffer.toString("base64") : null;

    const categoryData = await QnA.findOne({ category });
    if (!categoryData) return res.status(404).json({ error: "Category not found" });

    const question = categoryData.questions.id(questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const newAnswer = { text, file, senderId, createdAt: new Date() };
    question.answers.push(newAnswer);
    await categoryData.save();

    // Emit real-time update to all connected clients
    io.emit("newAnswer", { questionId, newAnswer });

    res.json(newAnswer);
  } catch (error) {
    res.status(500).json({ error: "Failed to add answer" });
  }
});

module.exports = router;

