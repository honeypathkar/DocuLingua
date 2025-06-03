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

  if (fileType === "image") {
    const {
      data: { text },
    } = await Tesseract.recognize(buffer, "eng");
    return text;
  } else if (fileType === "pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }
}

async function extractTextFromSupabase(publicURL, fileName) {
  const bucketName = "doculingua";
  let objectKey = publicURL;

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
  if (error || !data)
    throw new Error(error?.message || "Failed to download file from Supabase");

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return await extractTextFromBuffer(buffer, fileName);
}

module.exports = {
  extractTextFromSupabase,
};
