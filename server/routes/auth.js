const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_CODE = process.env.ADMIN_CODE;

// Helper function to create JWT
const createToken = (user) => {
  return jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "1h" });
};

// User Signup
router.post("/signup", async (req, res) => {
  const { fullName:username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username,email, password: hashedPassword });
    await user.save();
    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({ profileImg: user.profileImg, _id:user._id });
  } catch (error) {
    res.status(400).json({ message: "Error creating user", error });
  }
});

// Admin Signup
router.post("/adminsignup", async (req, res) => {
  const { fullName:username,email, password, admincode } = req.body;
    // console.log(admincode);
  if (admincode !== ADMIN_CODE) {
    return res.status(400).json({ message: "Invalid admin code" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ username,email, password: hashedPassword, isAdmin: true });
    await admin.save();
    const token = createToken(admin);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({ _id:admin._id, profileImg: admin.profileImg, isAdmin: admin.isAdmin });
  } catch (error) {
    res.status(400).json({ message: "Error creating admin", error });
  }
});

// User and Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.json({ _id:user._id, profileImg: user.profileImg });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

// Admin Login
router.post("/adminlogin", async (req, res) => {
  const { email, password, admincode } = req.body;

  if (admincode !== ADMIN_CODE) {
    return res.status(400).json({ message: "Invalid admin code" });
  }

  try {
    const admin = await User.findOne({ email, isAdmin: true });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = createToken(admin);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.json({ _id:admin._id, profileImg: admin.profileImg, isAdmin: admin.isAdmin });
  } catch (error) {
    res.status(500).json({ message: "Admin login failed", error });
  }
});

// Check Auth
router.get("/check", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    res.json({ _id:user._id, profileImg: user.profileImg,isAdmin: user.isAdmin});
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
