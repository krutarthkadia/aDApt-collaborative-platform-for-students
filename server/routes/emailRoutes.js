const express = require("express");
const mongoose = require("mongoose");
const CategoryforEmail = require("../models/email");

const router = express.Router();

// 1. Fetch all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await CategoryforEmail.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories.", error });
  }
});

// 2. Fetch emails for a specific category
router.get("/categories/:categoryId/emails", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await CategoryforEmail.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "CategoryforEmail not found." });
    }

    res.status(200).json(category.emails);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch emails.", error });
  }
});

// 3. Add a new category
router.post("/categories/add", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "CategoryforEmail name is required." });
  }

  try {
    const category = new CategoryforEmail({ name, emails: [] });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to add category.", error });
  }
});

// 4. Remove a category
router.delete("/categories/:categoryId/remove", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await CategoryforEmail.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "CategoryforEmail not found." });
    }

    await category.deleteOne();
    res.status(200).json({ message: "CategoryforEmail removed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove category.", error });
  }
});

// 5. Add an email to a specific category
router.post("/categories/:categoryId/emails/add", async (req, res) => {
  const { categoryId } = req.params;
  const { name, mail } = req.body;

  if (!name || !mail) {
    return res.status(400).json({ message: "Name and email address are required." });
  }

  try {
    const category = await CategoryforEmail.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "CategoryforEmail not found." });
    }

    const email = { name, mail };
    category.emails.push(email);
    await category.save();
    res.status(201).json(email);
  } catch (error) {
    res.status(500).json({ message: "Failed to add email.", error });
  }
});

// 6. Remove an email
router.delete("/categories/:categoryId/emails/:emailId/remove", async (req, res) => {
  const { categoryId, emailId } = req.params;

  try {
    const category = await CategoryforEmail.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "CategoryforEmail not found." });
    }

    const emailIndex = category.emails.findIndex(
      (email) => email._id.toString() === emailId
    );
    if (emailIndex === -1) {
      return res.status(404).json({ message: "Email not found." });
    }

    category.emails.splice(emailIndex, 1);
    await category.save();
    res.status(200).json({ message: "Email removed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove email.", error });
  }
});

module.exports = router;
