const express = require('express');
const multer = require('multer');
const path = require('path');

//creating a router
const router = express.Router();

//Multer storage

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, './uploads/'));
    },
    filename: (req, file, cb) => {
        const userProvideName = req.body.filename;
        const fileExtension = path.extname(file.originalname);
        const finalName = userProvideName
            ? `${userProvideName}${fileExtension}`
            : `${Date.now()}-${file.originalname}`;
        cb(null, finalName);
    },
});

//upload instance

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png/;
        const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (isValid) {
            cb(null, true);
        } else {
            cb(new Error('Only document and image files are allowed!'));
        }
    }
});

//controller function for uploading documents

const uploadDocument = (req, res) => {
    upload.single("documents")(req, res, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        try {
            const filePath = path.join("./uploads/", req.file.filename);
            res.status(200).json({
                message: "File uploaded successfully",
                file: {
                    ...req.file,
                    path: filePath,
                },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};

//exporting the router

module.exports = router;