// documentController.js
const cloudinary = require("cloudinary").v2;
const fs = require("fs"); // To read the local file
const path = require("path"); // For path manipulation

// Controller function to upload a file from a local path on the server
const uploadLocalFileToCloudinary = async (req, res) => {
    try {
        // Expecting a JSON body with the path to the local file
        // e.g., { "filePath": "/path/to/your/local/file.pdf" }
        // OR { "filePath": "test-files/sample.pdf" } (relative to project root)
        const { filePath, targetFolder, publicIdPrefix } = req.body;

        if (!filePath) {
            return res.status(400).json({ message: "filePath is required in the request body." });
        }

        // Construct an absolute path if a relative one is given
        const absoluteFilePath = path.resolve(filePath); // Resolves relative to CWD

        // Check if the file exists locally
        if (!fs.existsSync(absoluteFilePath)) {
            console.error(`File not found at: ${absoluteFilePath}`);
            return res.status(404).json({ message: `File not found at path: ${absoluteFilePath}` });
        }

        console.log(`Attempting to upload local file: ${absoluteFilePath} to Cloudinary.`);

        // Cloudinary uploader.upload method can take a file path directly
        const result = await cloudinary.uploader.upload(absoluteFilePath, {
            folder: targetFolder || "documents_from_local", // Optional: specify a folder in Cloudinary
            resource_type: "auto", // Let Cloudinary auto-detect
            // Optional: create a more specific public_id
            public_id: publicIdPrefix ? `${publicIdPrefix}_${path.basename(absoluteFilePath, path.extname(absoluteFilePath))}` : undefined,
            original_filename: path.basename(absoluteFilePath), // Good to provide original filename
        });

        console.log("Local file uploaded to Cloudinary successfully:", result.secure_url);
        res.status(200).json({
            message: "Local file uploaded successfully to Cloudinary",
            file: {
                originalname: path.basename(absoluteFilePath),
                cloudinary_url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type,
                format: result.format,
                bytes: result.bytes,
            },
        });
    } catch (error) {
        console.error("Server error during local file upload to Cloudinary:", error);
        if (error.http_code) { // Cloudinary specific error
            return res.status(error.http_code).json({
                message: "Cloudinary upload failed",
                error: error.message || error.error?.message || "Unknown Cloudinary error",
            });
        }
        if (error.code === 'ENOENT') { // File not found error from fs operations
            return res.status(404).json({ message: "Source file not found for upload.", error: error.message });
        }
        res.status(500).json({ message: "Server error during upload", error: error.message });
    }
};

// Scenario 2: Uploading a file from a URL to Cloudinary
const uploadFileFromUrlToCloudinary = async (req, res) => {
    try {
        const { fileUrl, targetFolder, publicIdPrefix } = req.body;

        if (!fileUrl) {
            return res.status(400).json({ message: "fileUrl is required in the request body." });
        }

        // Basic URL validation (can be more robust)
        try {
            new URL(fileUrl);
        } catch (_) {
            return res.status(400).json({ message: "Invalid fileUrl provided." });
        }

        console.log(`Attempting to upload file from URL: ${fileUrl} to Cloudinary.`);

        const result = await cloudinary.uploader.upload(fileUrl, {
            folder: targetFolder || "documents_from_url",
            resource_type: "auto",
            public_id: publicIdPrefix ? `${publicIdPrefix}_${path.basename(new URL(fileUrl).pathname)}` : undefined,
        });

        console.log("File from URL uploaded to Cloudinary successfully:", result.secure_url);
        res.status(200).json({
            message: "File from URL uploaded successfully to Cloudinary",
            file: {
                originalname: path.basename(new URL(fileUrl).pathname), // Derive a name from URL
                cloudinary_url: result.secure_url,
                public_id: result.public_id,
                resource_type: result.resource_type,
                format: result.format,
                bytes: result.bytes,
            },
        });

    } catch (error) {
        console.error("Server error during URL file upload to Cloudinary:", error);
        if (error.http_code) {
            return res.status(error.http_code).json({
                message: "Cloudinary upload failed",
                error: error.message || error.error?.message || "Unknown Cloudinary error",
            });
        }
        res.status(500).json({ message: "Server error during upload", error: error.message });
    }
};


module.exports = {
    uploadLocalFile: uploadLocalFileToCloudinary,
    uploadFileFromUrl: uploadFileFromUrlToCloudinary,
    // If you still need the multipart/form-data endpoint for actual front-end uploads later:
    // upload: multerInstance, // from the multer setup
    // uploadMultipartFile: actualMultipartController, // from the multer setup
};