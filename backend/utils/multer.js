const multer = require("multer");

const storage = multer.memoryStorage(); // Use memory storage instead of disk

const upload = multer({ storage });

module.exports = upload;
