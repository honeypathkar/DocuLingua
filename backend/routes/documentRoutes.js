// documentRoutes.js
const express = require("express");
const {
  uploadDocument,
  deleteDocument,
  documentById,
  getAllDocuments,
  getUserDocuments,
  updateDocument,
  deleteAllDocuments,
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

//Delete all documents for the current user
router.delete("/all", verifyToken, deleteAllDocuments);

//Delete by id
router.delete("/:docId", verifyToken, deleteDocument);

//Get by id of documents
router.get("/:id", verifyToken, documentById);

//Update document by id
router.patch("/:id", verifyToken, updateDocument);

module.exports = router;
