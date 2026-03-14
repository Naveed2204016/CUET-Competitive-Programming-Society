const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const mongoose = require("mongoose");

// Import routes with error handling
let authRoutes, announcementRoutes, resourcesRoutes, leaderboardRoutes, editorialsRoutes, contestsRoutes;

try {
    const authModule = require("./routes/auth");
    authRoutes = authModule.router || authModule;
    announcementRoutes = require("./routes/announcment");
    resourcesRoutes = require("./routes/resources");
    leaderboardRoutes = require("./routes/leaderboard");
    editorialsRoutes = require("./routes/editorials");
    contestsRoutes = require("./routes/contests");
    console.log("✓ All routes imported successfully");
} catch (err) {
    console.error("✗ Error importing routes:", err.message);
    console.error(err.stack);
    process.exit(1);
}

const app = express();

// Replace with your MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/cuet-cp-society';

mongoose.connect(MONGODB_URI)
    .then(() => console.log("✓ MongoDB Connection successful"))
    .catch((err) => console.error("✗ MongoDB Connection failed:", err.message));

app.use(cors());
app.use(express.json());

// Mount routes with logging
console.log("📌 Mounting routes...");
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/editorials", editorialsRoutes);
app.use("/api/contests", contestsRoutes);
console.log("✓ Routes mounted successfully");

app.get("/", (req, res) => {
    res.send("CUET CP Society Backend Running...");
});

const errorHandler = (err, req, res, next) => {
    console.error("Global error handler:", err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: err.message });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
    console.error("Server error:", err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
});