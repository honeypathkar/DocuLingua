const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../utils/supabase");

const DocumentModel = require("../models/DocumentModel");
const UserModel = require("../models/UserModel");

const uploadDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { documentName, originalText, translatedText } = req.body;

    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });
    if (!documentName)
      return res.status(400).json({ message: "Document name is required" });
    if (!req.file)
      return res.status(400).json({ message: "File is required for upload" });

    const fileExt = path.extname(req.file.originalname);
    const filename = `${uuidv4()}${fileExt}`;

    // Step 3: Upload to Supabase Storage (bucket name = 'doculingua')
    const { error: uploadError } = await supabase.storage
      .from("doculingua")
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Step 4: Generate Public URL
    const { data: fileData } = supabase.storage
      .from("doculingua")
      .getPublicUrl(filename);
    const publicURL = fileData.publicUrl;

    // Step 5: Determine file type
    const mimeType = req.file.mimetype;
    let fileType = "other";
    if (mimeType.startsWith("image/")) fileType = "image";
    else if (mimeType === "application/pdf") fileType = "pdf";

    // Step 6: Save document to DB
    const document = await DocumentModel.create({
      userId,
      documentName,
      originalText,
      translatedText,
      file: publicURL,
      fileType,
      supabasePublicId: filename, // can rename this later if needed
    });

    await UserModel.findByIdAndUpdate(userId, {
      $push: { documents: document._id },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Upload Document Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to upload document" });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    // Step 1: Find the document by ID
    const document = await DocumentModel.findById(docId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filename = document.supabasePublicId; // or `storageFileName` if you renamed it

    // Step 2: Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from("doculingua")
      .remove([filename]);

    if (deleteError) throw deleteError;

    // Step 3: Delete the document from MongoDB
    await DocumentModel.findByIdAndDelete(docId);

    // Step 4: Remove reference from user's documents
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { documents: docId },
    });

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete Document Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to delete document" });
  }
};

const documentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this document" });
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await DocumentModel.find();
    return res.status(200).json({ message: "All documents", data: documents });
  } catch (error) {
    console.error("Error fetching all documents:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET /user/documents - Get all documents created by logged-in user
const getUserDocuments = async (req, res) => {
  try {
    const userId = req.userId;

    const documents = await DocumentModel.find({ userId });
    return res
      .status(200)
      .json({ message: "Document by logged in user", data: documents });
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Document name is required" });
    }

    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this document" });
    }

    document.documentName = name;
    await document.save();

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadDocument,
  deleteDocument,
  documentById,
  getAllDocuments,
  getUserDocuments,
  updateDocument,
};
