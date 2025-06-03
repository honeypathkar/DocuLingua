const fs = require("fs"); // fs is not used, consider removing if not needed elsewhere
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../utils/supabase"); // Assuming this path is correct

const DocumentModel = require("../models/DocumentModel"); // Assuming this path is correct
const UserModel = require("../models/UserModel"); // Assuming this path is correct
const {
  extractTextFromSupabase,
} = require("../controllers/extractionController"); // Assuming this path is correct

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

    // Use the original filename from the upload for storage in DB
    const originalFileName = req.file.originalname;
    // Generate a unique filename for Supabase storage to avoid conflicts
    const fileExt = path.extname(req.file.originalname);
    const uniqueStorageFilename = `${uuidv4()}${fileExt}`;

    // Upload to Supabase with the unique filename
    const { error: uploadError } = await supabase.storage
      .from("doculingua") // Make sure this bucket name is correct
      .upload(uniqueStorageFilename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true, // Consider if upsert is truly needed or if false is better for new unique names
      });

    if (uploadError) throw uploadError;

    // Get public URL for text extraction (this URL is temporary and not stored in DB)
    const { data: fileData } = supabase.storage
      .from("doculingua")
      .getPublicUrl(uniqueStorageFilename);
    const publicURL = fileData.publicUrl;

    const mimeType = req.file.mimetype;
    let fileType = "other";
    if (mimeType.startsWith("image/")) fileType = "image";
    else if (mimeType === "application/pdf") fileType = "pdf";

    // Save to DB:
    // - Storing originalFileName instead of publicURL or supabasePublicId
    // - originalText and translatedText can be passed in body or will default
    const document = await DocumentModel.create({
      userId,
      documentName,
      originalText: originalText || "", // Use provided or default to empty
      translatedText: translatedText || "", // Use provided or default to empty
      originalFileName, // Store the original name of the file
      fileType,
      // supabasePublicId is no longer stored
      // file (publicURL) is no longer stored
    });

    // Call the external extract module using the temporary publicURL
    let extractedText = "";
    try {
      // Pass uniqueStorageFilename as the second argument if extractTextFromSupabase needs it
      // for determining file type, or if it's used for logging/internal reference.
      extractedText = await extractTextFromSupabase(
        publicURL,
        uniqueStorageFilename
      );
    } catch (err) {
      console.error("Text extraction failed:", err);
      // You might want to set a specific status on the document or handle this more gracefully
      extractedText = "Error extracting text";
    }

    // Update document with extracted text
    document.originalText = extractedText;
    await document.save();

    // Add document reference to user
    await UserModel.findByIdAndUpdate(userId, {
      $push: { documents: document._id },
    });

    // Delete the temporary file from Supabase storage after processing
    // as it's no longer directly linked from the database record for future access.
    const { error: deleteError } = await supabase.storage
      .from("doculingua")
      .remove([uniqueStorageFilename]);

    if (deleteError) {
      // Log error but don't let it fail the whole request, as document is already created
      console.error(
        "Error deleting temporary file from Supabase after processing:",
        deleteError
      );
    }

    res.status(201).json(document);
  } catch (error) {
    console.error("Upload Document Error:", error);
    // If an error occurred and a file was uploaded to Supabase,
    // it might be orphaned if not cleaned up here.
    // However, the uniqueStorageFilename might not be defined at this point if error was early.
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
    return res
      .status(200)
      .json({
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
      return res
        .status(400)
        .json({
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
      return res
        .status(403)
        .json({
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

module.exports = {
  uploadDocument,
  deleteDocument,
  documentById,
  getAllDocuments,
  getUserDocuments,
  updateDocument,
};
