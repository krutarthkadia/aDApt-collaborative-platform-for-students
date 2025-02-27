const express = require("express");
const SharedLib = require("../models/sharedlib");

const router = express.Router();

// Fetch all categories
router.get("/course_codes", async (req, res) => {
  try {
    const categories = await SharedLib.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// Fetch courses for a specific category
router.get("/course_codes/:categoryId/courses", async (req, res) => {
  try {
    const category = await SharedLib.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json(category.courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
});

// Fetch files for a specific course
router.get("/course_codes/:categoryId/courses/:courseId/files", async (req, res) => {
  try {
    const category = await SharedLib.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const course = category.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course.files);
  } catch (error) {
    res.status(500).json({ message: "Error fetching files" });
  }
});

// Add a new category
router.post("/course_codes/add", async (req, res) => {
  try {
    const newCategory = new SharedLib({ categoryName: req.body.category });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Error adding category" });
  }
});

// Remove a category
router.post("/course_codes/:categoryId/remove", async (req, res) => {
  try {
    await SharedLib.findByIdAndDelete(req.params.categoryId);
    res.json({ message: "Category removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing category" });
  }
});

// Add a new course
router.post("/course_codes/:categoryId/courses/add", async (req, res) => {
  try {
    const category = await SharedLib.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const newCourse = { courseName: req.body.courseName, files: [] };
    category.courses.push(newCourse);
    await category.save();

    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: "Error adding course" });
  }
});

// Remove a course
router.post("/course_codes/:categoryId/courses/:courseId/remove", async (req, res) => {
  try {
    const category = await SharedLib.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.courses = category.courses.filter((course) => course._id.toString() !== req.params.courseId);
    await category.save();

    res.json({ message: "Course removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing course" });
  }
});

// Add a new file
router.post("/course_codes/:categoryId/courses/:courseId/files/add", async (req, res) => {
  try {
    const { fileName, fileUrl } = req.body;
    const category = await SharedLib.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const course = category.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const newFile = { fileName, fileUrl };
    course.files.push(newFile);
    await category.save();

    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: "Error adding file" });
  }
});

// Remove a file
router.post("/course_codes/:categoryId/courses/:courseId/files/:fileId/remove", async (req, res) => {
  try {
    const category = await SharedLib.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const course = category.courses.id(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.files = course.files.filter((file) => file._id.toString() !== req.params.fileId);
    await category.save();

    res.json({ message: "File removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing file" });
  }
});

module.exports = router;
