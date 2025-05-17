const DocumentModel = require("../models/DocumentModel");
const UserModel = require("../models/UserModel");

const uploadDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const { documentName, originalText, translatedText } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!documentName) {
      return res.status(400).json({ message: "Document name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required for upload" });
    }

    // Step 1: Determine file type from mimetype
    const mimeType = req.file.mimetype;
    let fileType = "other";
    if (mimeType.startsWith("image/")) fileType = "image";
    else if (mimeType === "application/pdf") fileType = "pdf";

    // Step 2: Save document to DB using local file path
    const document = await DocumentModel.create({
      userId,
      documentName,
      originalText,
      translatedText,
      file: req.file.path.replace(/\\/g, "/"),
      fileType,
    });

    // Step 3: Update user's document list
    await UserModel.findByIdAndUpdate(
      userId,
      { $push: { documents: document._id } },
      { new: true }
    );

    res.status(201).json(document);
  } catch (error) {
    console.error("Upload Document Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to upload document" });
  }
};

module.exports = { uploadDocument };
