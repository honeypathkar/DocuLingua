const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const path = require('path');
const supabase = require('../utils/supabase');

// Helper to detect file type from name
function getFileTypeFromName(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    if ([".jpg", ".jpeg", ".png"].includes(ext)) return "image";
    if (ext === ".pdf") return "pdf";
    return null;
}

// Main extraction function for buffer
async function extractTextFromBuffer(buffer, fileName) {
    const fileType = getFileTypeFromName(fileName);
    if (!fileType) throw new Error("Unsupported file type");

    if (fileType === "image") {
        const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
        return text;
    } else if (fileType === "pdf") {
        const data = await pdfParse(buffer);
        return data.text;
    }
}

// Express route handler
exports.extractText = async (req, res) => {
    try {
        const { supabasePath, fileName } = req.body;
        const bucketName = 'doculingua'; // <-- Set your actual bucket name here

        if (!supabasePath || !fileName) return res.status(400).json({ error: 'supabasePath and fileName are required' });

        // If a full URL is provided, extract the object key
        let objectKey = supabasePath;
        if (objectKey.startsWith('http')) {
            // Example: https://.../object/public/doculingua/filename.pdf
            const match = objectKey.match(/object\/(?:public\/)?([^/]+)\/(.+)$/);
            if (match) {
                // match[1] = bucket name, match[2] = object key
                objectKey = match[2];
            } else {
                return res.status(400).json({ error: 'Invalid Supabase file URL or path.' });
            }
        }


        // Download file from Supabase
        const { data, error } = await supabase.storage.from(bucketName).download(objectKey);
        if (error || !data) {
            console.error('Supabase download error:', error);
            return res.status(500).json({ error: error?.message || 'Failed to download file from Supabase.' });
        }
        let arrayBuffer;
        try {
            arrayBuffer = await data.arrayBuffer();
        } catch (bufferErr) {
            console.error('Buffer conversion error:', bufferErr);
            return res.status(500).json({ error: 'Failed to convert file to buffer.' });
        }
        const buffer = Buffer.from(arrayBuffer);

        const text = await extractTextFromBuffer(buffer, fileName);
        res.json({ text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
