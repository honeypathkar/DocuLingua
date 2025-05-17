// documentRoutes.js
const express = require("express");
const {
  uploadDocument,
  deleteDocument,
} = require("../controllers/documentController");
const upload = require("../utils/multer");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/upload", verifyToken, upload.single("file"), uploadDocument);
router.delete("/:docId", verifyToken, deleteDocument);

module.exports = router;
