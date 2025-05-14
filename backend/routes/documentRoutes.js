const express = require('express');
const multer = require('multer');
const path = require('path');

//creating a router
const router = express.Router();

//Multer storage

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/'));
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
        const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif/;
        const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (isValid) {
            cb(null, true);
        } else {
            cb(new Error('Only document and image files are allowed!'));
        }
    }
});

//upload route

router.post('../../upload/', upload.array('documents', 10), (req, res) => {
    try{
        const filePaths = req.files.map(file => path.join('../../uploads/', file.filename));
        res.status(200).json({
            message: 'Files uploaded successfully',
            files: req.files.map((file, index) => ({
                ...file,
                path: filePaths[index],
            })),
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

//exporting the router

module.exports = router;