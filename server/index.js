const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // Replace with your frontend's URL
  credentials: true, // Allow credentials (cookies) to be sent
}));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);
// Import and initialize socket
const initializeSocket = require("./socket");
const io = initializeSocket(server);



// Routes
const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/emailRoutes");
const qnaRoutes = require("./routes/qnaRoutes");
const sharedlibRoutes = require("./routes/sharedlibroutes");
app.use("/api/auth", authRoutes);
app.use("/api/mail",emailRoutes);
app.use("/api/qna", qnaRoutes);
app.use("/api/sharedlib", sharedlibRoutes);


// Start Server
mongoose
  .connect("mongodb+srv://krutarthkadia:Kkhkkh%401707@cluster.1xhvs.mongodb.net/aDApt_final")
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((error) => console.error("MongoDB connection error:", error));

  module.exports = { app, server, io };