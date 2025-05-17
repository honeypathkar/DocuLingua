// documentRoutes.js
const express = require("express");
const { uploadDocument } = require("../controllers/documentController");
const upload = require("../utils/multer");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/upload", verifyToken, upload.single("file"), uploadDocument);

module.exports = router;
