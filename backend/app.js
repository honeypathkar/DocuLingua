const express = require("express");
const connectDB = require("./db/mongodbConnect");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const fileUpload = require("express-fileupload"); // <-- import this

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

// 🔥 Add this for file uploads!
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/", // or your own temp directory
  })
);

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/users", userRoutes);

connectDB();

app.listen(PORT, () =>
  console.log(`The Backend is running on http://localhost:${PORT}`)
);
