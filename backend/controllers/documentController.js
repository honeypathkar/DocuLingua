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
      .upload(filename, fs.readFileSync(req.file.path), {
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
      cloudinaryPublicId: filename, // can rename this later if needed
    });

    await UserModel.findByIdAndUpdate(userId, {
      $push: { documents: document._id },
    });

    // Optional: clean up local file
    fs.unlinkSync(req.file.path);

    res.status(201).json(document);
  } catch (error) {
    console.error("Upload Document Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to upload document" });
  }
};

module.exports = { uploadDocument };
