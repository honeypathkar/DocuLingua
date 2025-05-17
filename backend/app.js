const express = require("express");
const connectDB = require("./db/mongodbConnect");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const cors = require("cors");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (optional)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
});

// Routes
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/auth/v1/users", userRoutes);
app.use("/auth/v1/documents", documentRoutes);

// Connect to DB and start server
connectDB();
app.listen(PORT, () =>
    console.log(`Backend running at http://localhost:${PORT}`)
);
