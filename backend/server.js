const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const mongoose = require("mongoose");
const { router: authRoutes } = require("./routes/auth");
const announcementRoutes = require("./routes/announcment");
const resourcesRoutes = require("./routes/resources");
const leaderboardRoutes = require("./routes/leaderboard");

const app = express();

mongoose.connect('mongodb://localhost/cuet-cp-society')
.then(() => console.log("Connection successful"))
.catch((err) => console.error("Connection failed:", err));

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get("/", (req, res) => {
    res.send("CUET CP Society Backend Running...");
});

const errorHandler =(err,req,res,next)=>{
    if(res.headersSent){
        return next(err);
    }
    res.status(500).json({error: err.message});
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});