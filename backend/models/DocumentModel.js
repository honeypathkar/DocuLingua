const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
      index: true, // Add index for faster queries based on user
    },
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    originalText: {
      type: String,
      default: "", // Default to empty string if not provided
    },
    translatedText: {
      type: String,
      default: "", // Default to empty string if not provided
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["image", "pdf", "other"], // Specify allowed file types
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const DocumentModel = mongoose.model("Document", documentSchema);

module.exports = DocumentModel;
