const multer = require('multer');

// Use memory storage for handling files as BLOBs
const storage = multer.memoryStorage();

// Configure multer with file filter and size limits
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("File Received in Middleware:", file);

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/octet-stream'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

module.exports = upload;
