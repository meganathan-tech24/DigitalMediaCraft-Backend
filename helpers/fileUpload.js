const fs = require('fs');
const path = require('path');

const multer = require('multer');

class FileUploader {
  constructor(uploadDir = './public', allowedTypes = /jpeg|jpg|png|gif|pdf/, maxFileSize = 10 * 1024 * 1024, maxFileCount = 10) {
    this.uploadDir = uploadDir;
    this.allowedTypes = allowedTypes;
    this.maxFileSize = maxFileSize;
    this.maxFileCount = maxFileCount;

    // Ensure the public directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Initialize the multer instance
    this.upload = multer({
      storage: this.getStorage(),
      limits: { fileSize: this.maxFileSize, fileCount: this.maxFileCount },
      fileFilter: this.getFileFilter(),
    });
  }

  // File filter to allow only specific file types
  getFileFilter() {
    return (req, file, cb) => {
      const extname = this.allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimeType = this.allowedTypes.test(file.mimetype);

      if (extname && mimeType) {
        return cb(null, true);
      } else {
        return cb(new Error('Only images and PDFs are allowed'), false);
      }
    };
  }

  // Generate a unique file name
  generateUniqueFileName(file) {
    const fileExtension = path.extname(file.originalname);  // Get file extension
    const baseFileName = path.basename(file.originalname, fileExtension); // Get the file name without extension
    let fileName = baseFileName + fileExtension;  // Start with the original name
    let filePath = path.join(this.uploadDir, fileName);  // Full path of the file

    // Check if file already exists, if so, increment the number
    let counter = 1;
    while (fs.existsSync(filePath)) {
      fileName = `${baseFileName}(${counter})${fileExtension}`; // Append counter to file name
      filePath = path.join(this.uploadDir, fileName); // Check path again with updated name
      counter++;  // Increment the counter
    }

    return fileName;  // Return the unique file name
  }

  // Storage configuration for multer
  getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir); // Save files in the `public` directory
      },
      filename: (req, file, cb) => {
        cb(null, this.generateUniqueFileName(file)); // Save with a unique name
      },
    });
  }

  // Wrapper function to handle the upload
  handleUpload(uploadMiddleware) {
    return (req, res, next) => {
      uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // Handle multer-specific errors
          let errorMessage = 'An error occurred during file upload.';
          if (err.code === 'LIMIT_FILE_SIZE') {
            errorMessage = `File size exceeds the allowed limit of ${this.maxFileSize / 1024 / 1024}MB.`;
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            errorMessage = `Too many files uploaded. Max allowed is ${this.maxFileCount}.`;
          } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            errorMessage = 'Unexpected file uploaded.';
          }
          return res.status(400).json({ status: false, error: errorMessage });
        } else if (err) {
          // Handle other errors (e.g., file type validation)
          return res.status(400).json({ status: false, error: err.message });
        }
        return next(); // Continue to next middleware if no errors
      });
    };
  }

  // Method to handle multiple file uploads
  multiFileUpload() {
    return this.handleUpload(this.upload.array('files', this.maxFileCount)); // Multiple files under 'files' field
  }

  // Method to handle single file upload
  singleFileUpload() {
    return this.handleUpload(this.upload.single('file'));   // Single file upload under 'file' field
  }

  // Method to handle file uploads with multiple fields
  fieldsFileUpload() {
    return this.handleUpload(this.upload.fields([           // Multiple fields with specific max counts
      { name: 'images', maxCount: 5 },
      { name: 'documents', maxCount: 5 },
    ]));
  }
}

module.exports = FileUploader;
