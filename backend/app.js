const express = require("express");
const connectDB = require("./db/mongodbConnect");
require("dotenv").config(); // Load .env variables
const userRoutes = require("./routes/userRoutes"); // Import user routes
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8001; // Use environment variable for port or default

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins (for development - refine in production)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies
  })
); // Enable CORS for all origins (for development - refine in production)
app.use(express.json()); // To parse JSON request bodies

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Mount User Routes
app.use("/api/users", userRoutes);

// Connect to MongoDB
connectDB();

app.listen(PORT, () =>
  console.log(`The Backend is running on http://localhost:${PORT}`)
);
