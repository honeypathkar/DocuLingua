const fs = require("fs"); // fs is not used, consider removing if not needed elsewhere
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../utils/supabase"); // Assuming this path is correct

const DocumentModel = require("../models/DocumentModel"); // Assuming this path is correct
const UserModel = require("../models/UserModel"); // Assuming this path is correct
const { extractTextFromSupabase } = require("../middleware/extractionService");
const { translateTextRapidAPI } = require("../middleware/translationService");

const uploadDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { documentName, targetLanguage } = req.body;

    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });
    if (!documentName)
      return res.status(400).json({ message: "Document name is required" });
    if (!req.file)
      return res.status(400).json({ message: "File is required for upload" });

    // Check for duplicate document name for the same user
    const existingDoc = await DocumentModel.findOne({
      userId,
      documentName: { $regex: new RegExp(`^${documentName}$`, "i") }, // Case-insensitive match
    });

    if (existingDoc) {
      return res.status(409).json({
        message: `Document with name "${documentName}" already exists.`,
      });
    }

    const originalFileName = req.file.originalname;
    const fileExt = path.extname(originalFileName);
    const uniqueStorageFilename = `${uuidv4()}${fileExt}`;

    // Upload file to Supabase
    const { error: uploadError } = await supabase.storage
      .from("doculingua")
      .upload(uniqueStorageFilename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get temporary public URL
    const { data: fileData } = supabase.storage
      .from("doculingua")
      .getPublicUrl(uniqueStorageFilename);
    const publicURL = fileData.publicUrl;

    const mimeType = req.file.mimetype;
    let fileType = "other";
    if (mimeType.startsWith("image/")) fileType = "image";
    else if (mimeType === "application/pdf") fileType = "pdf";

    // Create initial document entry
    const document = await DocumentModel.create({
      userId,
      documentName,
      originalText: "",
      translatedText: "",
      originalFileName,
      fileType,
    });

    // Extract text
    let extractedText = "";
    try {
      extractedText = await extractTextFromSupabase(
        publicURL,
        uniqueStorageFilename
      );
    } catch (err) {
      console.error("Text extraction failed:", err);
      extractedText = "Error extracting text";
    }

    // Clean extracted text
    const cleanedText = extractedText.replace(/[\r\n]+/g, " ");

    // Translate
    let translated = "";
    try {
      translated = await translateTextRapidAPI(
        cleanedText,
        "auto",
        targetLanguage
      );
    } catch (err) {
      console.error("Translation failed:", err);
      translated = "Translation failed";
    }

    // Update document with clean data
    document.originalText = cleanedText;
    document.translatedText = Array.isArray(translated)
      ? translated.join(" ")
      : translated.toString();
    await document.save();

    // Add reference to user
    await UserModel.findByIdAndUpdate(userId, {
      $push: { documents: document._id },
    });

    // Remove uploaded file from Supabase
    const { error: deleteError } = await supabase.storage
      .from("doculingua")
      .remove([uniqueStorageFilename]);
    if (deleteError) {
      console.error("Error deleting file from Supabase:", deleteError);
    }

    res.status(201).json(document);
  } catch (error) {
    console.error("Upload Document Error:", error);
    res.status(500).json({
      message: error.message || "Failed to upload document",
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    // Step 1: Find the document by ID to ensure it exists and belongs to the user (optional check)
    const document = await DocumentModel.findOne({
      _id: docId,
      userId: userId,
    });

    if (!document) {
      // If checking for userId, this message covers both "not found" and "unauthorized"
      return res
        .status(404)
        .json({ message: "Document not found or access denied" });
    }

    // Step 2: Delete from Supabase Storage is REMOVED
    // Since supabasePublicId is no longer stored, we cannot delete the corresponding file from Supabase.
    // The file uploaded during uploadDocument is now treated as temporary and deleted at the end of that function.
    // If there's a need to delete files from Supabase associated with a document at this stage,
    // a different mechanism or storing the uniqueStorageFilename would be required.

    // Step 3: Delete the document from MongoDB
    await DocumentModel.findByIdAndDelete(docId);

    // Step 4: Remove reference from user's documents
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { documents: docId },
    });

    res.status(200).json({ message: "Document metadata deleted successfully" });
  } catch (error) {
    console.error("Delete Document Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to delete document metadata" });
  }
};

const documentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Assuming verifyToken middleware adds userId to req

    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Ensure the document belongs to the requesting user
    if (document.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this document" });
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error fetching document:", error);
    // Check for CastError if ID format is invalid
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Document ID format" });
    }
    return res
      .status(500)
      .json({ message: "Server error while fetching document" });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    // This route fetches ALL documents from ALL users.
    // Consider if this is intended, or if it should be admin-only or removed.
    const documents = await DocumentModel.find();
    return res
      .status(200)
      .json({ message: "All documents retrieved", data: documents });
  } catch (error) {
    console.error("Error fetching all documents:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching all documents" });
  }
};

// Get all documents created by the logged-in user
const getUserDocuments = async (req, res) => {
  try {
    const userId = req.userId; // Assuming verifyToken middleware adds userId to req

    if (!userId) {
      // This case should ideally be caught by verifyToken middleware
      return res.status(401).json({ message: "User not authenticated" });
    }

    const documents = await DocumentModel.find({ userId });
    return res.status(200).json({
      message: "User documents retrieved successfully",
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return res
      .status(500)
      .json({ message: "Server error while fetching user documents" });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    // Only allowing 'documentName' and 'translatedText' to be updated for now.
    // Add other fields if they should be updatable.
    const { documentName, translatedText } = req.body;
    const userId = req.userId; // Assuming verifyToken middleware adds userId to req

    if (!id) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    // Basic validation for inputs
    if (!documentName && !translatedText) {
      return res.status(400).json({
        message:
          "No updateable fields provided (e.g., documentName, translatedText).",
      });
    }

    const updateFields = {};
    if (documentName) updateFields.documentName = documentName;
    if (translatedText) updateFields.translatedText = translatedText;
    // Add other fields to updateFields if necessary:
    // if (req.body.originalText) updateFields.originalText = req.body.originalText;

    // Find the document first to ensure it exists and belongs to the user
    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized: You can only update your own documents",
      });
    }

    // Apply updates
    if (documentName) document.documentName = documentName;
    if (translatedText !== undefined) document.translatedText = translatedText; // Allow setting empty string
    // if (originalText !== undefined) document.originalText = originalText;

    await document.save();

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error updating document:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid Document ID format" });
    }
    return res
      .status(500)
      .json({ message: "Server error while updating document" });
  }
};

const deleteAllDocuments = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get all documents of the user
    const userDocuments = await DocumentModel.find({ userId });

    if (!userDocuments.length) {
      return res.status(200).json({
        message: "No documents found to delete",
      });
    }

    // Remove documents from MongoDB
    const deleteResult = await DocumentModel.deleteMany({ userId });

    if (!deleteResult.deletedCount) {
      return res.status(500).json({
        message: "Failed to delete documents from database",
      });
    }

    // Remove references from the user document
    const userUpdateResult = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { documents: [] } },
      { new: true }
    );

    if (!userUpdateResult) {
      return res.status(500).json({
        message: "Failed to update user document references",
      });
    }

    return res.status(200).json({
      message: "All documents deleted successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Delete All Documents Error:", error);
    return res.status(500).json({
      message: "Failed to delete documents",
      error: error.message,
    });
  }
};

const translateText = async (req, res) => {
  try {
    const userId = req.userId;
    const { documentName, targetLanguage, text } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (!documentName) {
      return res.status(400).json({ message: "Document name is required" });
    }
    if (!targetLanguage) {
      return res.status(400).json({ message: "Target language is required" });
    }
    if (!text) {
      return res.status(400).json({ message: "Text to translate is required" });
    }

    // Check for duplicate document name for the same user
    const existingDoc = await DocumentModel.findOne({
      userId,
      documentName: { $regex: new RegExp(`^${documentName}$`, "i") }, // Case-insensitive match
    });

    if (existingDoc) {
      return res.status(409).json({
        message: `Document with name "${documentName}" already exists.`,
      });
    }

    // Clean text
    const cleanedText = text.replace(/[\r\n]+/g, " ");

    // Translate
    let translated = "";
    try {
      translated = await translateTextRapidAPI(
        cleanedText,
        "auto",
        targetLanguage
      );
    } catch (err) {
      console.error("Translation failed:", err);
      translated = "Translation failed";
    }

    // Create document entry
    const document = await DocumentModel.create({
      userId,
      documentName,
      originalFileName: documentName,
      originalText: cleanedText,
      translatedText: Array.isArray(translated)
        ? translated.join(" ")
        : translated.toString(),
      fileType: "image",
    });

    // Add reference to user
    await UserModel.findByIdAndUpdate(userId, {
      $push: { documents: document._id },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Translate Text Error:", error);
    res.status(500).json({
      message: error.message || "Failed to translate text",
    });
  }
};

module.exports = {
  uploadDocument,
  deleteDocument,
  documentById,
  getAllDocuments,
  getUserDocuments,
  updateDocument,
  deleteAllDocuments,
  translateText,
};
