// documentRoutes.js
const express = require("express");
const {
  uploadDocument,
  deleteDocument,
  documentById,
  getAllDocuments,
  getUserDocuments,
} = require("../controllers/documentController");
const upload = require("../utils/multer");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

//Upload document
router.post("/upload", verifyToken, upload.single("file"), uploadDocument);

//Get by user id
router.get("/user", verifyToken, getUserDocuments);

//Get all from database
router.get("/all", verifyToken, getAllDocuments);

//Delete by id
router.delete("/:docId", verifyToken, deleteDocument);

//Get by id of documents
router.get("/:id", verifyToken, documentById);

module.exports = router;
