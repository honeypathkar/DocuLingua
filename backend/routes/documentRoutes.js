const express = require("express");
const router = express.Router();
const {
    uploadDocument
} = require("../controllers/documentController");

// POST /api/documents/upload - Upload a document
router.post("/upload", uploadDocument);

module.exports = router;