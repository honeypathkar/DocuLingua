const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");
const path = require("path");
const supabase = require("../utils/supabase");

// Helper
function getFileTypeFromName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if ([".jpg", ".jpeg", ".png"].includes(ext)) return "image";
  if (ext === ".pdf") return "pdf";
  return null;
}

async function extractTextFromBuffer(buffer, fileName) {
  const fileType = getFileTypeFromName(fileName);
  if (!fileType) throw new Error("Unsupported file type");

  try {
    if (fileType === "image") {
      const {
        data: { text },
      } = await Tesseract.recognize(buffer, "eng");
      if (!text) {
        throw new Error("No text could be extracted from the image");
      }
      return text;
    } else if (fileType === "pdf") {
      const data = await pdfParse(buffer);
      if (!data || !data.text) {
        throw new Error("No text could be extracted from the PDF");
      }
      return data.text;
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileType}:`, error);
    throw new Error(
      `Failed to extract text from ${fileType}: ${error.message}`
    );
  }
}

async function extractTextFromSupabase(publicURL, fileName) {
  const bucketName = "doculingua";
  let objectKey = publicURL;

  try {
    if (objectKey.startsWith("http")) {
      const match = objectKey.match(/object\/(?:public\/)?([^/]+)\/(.+)$/);
      if (match) {
        objectKey = match[2];
      } else {
        throw new Error("Invalid Supabase file URL or path.");
      }
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(objectKey);

    if (error) {
      throw new Error(
        `Failed to download file from Supabase: ${error.message}`
      );
    }

    if (!data) {
      throw new Error("No data received from Supabase");
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await extractTextFromBuffer(buffer, fileName);
  } catch (error) {
    console.error("Error in extractTextFromSupabase:", error);
    throw error; // Re-throw to be handled by the caller
  }
}

module.exports = {
  extractTextFromSupabase,
};
