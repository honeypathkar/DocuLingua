const { createWorker } = require("tesseract.js");
const pdfParse = require("pdf-parse");
const path = require("path");
const supabase = require("../utils/supabase");

// Helper to determine file type remains the same
function getFileTypeFromName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if ([".jpg", ".jpeg", ".png"].includes(ext)) return "image";
  if (ext === ".pdf") return "pdf";
  return null;
}

// *** UPDATED FUNCTION using Tesseract.js with Vercel optimizations ***
async function extractTextFromBuffer(buffer, fileName) {
  const fileType = getFileTypeFromName(fileName);
  if (!fileType) throw new Error("Unsupported file type");

  // Ensure buffer is not null or empty
  if (!buffer || buffer.length === 0) {
    throw new Error(`Received an empty buffer for file: ${fileName}`);
  }

  if (fileType === "image") {
    // 1. Create a worker.
    // The key change is adding the options object with cachePath.
    const worker = await createWorker("eng", 1, {
      cachePath: "/tmp/", // Use the only writable directory in Vercel
      logger: (m) => console.log(m), // Optional: Add a logger to see progress
    });

    try {
      console.log(`Processing image with Tesseract.js: ${fileName}`);
      // 2. Recognize text from the buffer
      const {
        data: { text },
      } = await worker.recognize(buffer);

      if (!text || text.trim() === "") {
        console.warn(`No text could be extracted from the image: ${fileName}`);
        return "";
      }
      return text;
    } catch (error) {
      console.error(`Error with Tesseract.js for ${fileName}:`, error);
      throw new Error(`Failed to extract text from image: ${error.message}`);
    } finally {
      // 3. Terminate the worker to free up resources
      await worker.terminate();
      console.log(`Tesseract.js worker terminated for ${fileName}.`);
    }
  } else if (fileType === "pdf") {
    try {
      console.log(`Processing PDF with pdf-parse: ${fileName}`);
      const data = await pdfParse(buffer);
      if (!data || !data.text) {
        console.warn(`No text could be extracted from the PDF: ${fileName}`);
        return "";
      }
      return data.text;
    } catch (error) {
      console.error(`Error extracting text from PDF ${fileName}:`, error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
}

// Your Supabase function remains the same, as it will call the updated helper
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

    // This now calls your new and improved function
    return await extractTextFromBuffer(buffer, fileName);
  } catch (error) {
    console.error("Error in extractTextFromSupabase:", error);
    throw error;
  }
}

module.exports = {
  extractTextFromSupabase,
};
