const express = require("express");
const connectDB = require("./db/mongodbConnect");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const cors = require("cors");
const cron = require("node-cron");
const uploadFile = require("./utils/dailyService").uploadFile;
const cronRouter = require("./routes/cron");

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

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth/v1/users", userRoutes);
app.use("/auth/v1/documents", documentRoutes);
app.use("/api/cron", cronRouter);

// Connect to DB and start server
connectDB();
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
