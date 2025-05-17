// documentRoutes.js
const express = require("express");
const { uploadLocalFile, uploadFileFromUrl } = require("../controllers/documentController");

const router = express.Router();

// Endpoint to trigger upload of a local file (path provided in JSON body)
// POST /auth/v1/documents/upload-local
// Body: { "filePath": "/path/to/your/file.jpg", "targetFolder": "my_tests", "publicIdPrefix": "test_image" }
router.post("/upload-local", uploadLocalFile);

// Endpoint to trigger upload of a file from a URL (URL provided in JSON body)
// POST /auth/v1/documents/upload-from-url
// Body: { "fileUrl": "http://example.com/some/image.png", "targetFolder": "remote_files" }
router.post("/upload-from-url", uploadFileFromUrl);


// If you still want a "real" frontend upload endpoint later, you'd add it here
// (potentially using multer as discussed before):
// const { upload, uploadMultipartFile } = require("../controllers/documentController"); // Assuming you have these
// router.post("/upload", upload.single('file'), uploadMultipartFile);

module.exports = router;