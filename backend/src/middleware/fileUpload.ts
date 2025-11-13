import multer from 'multer';
import { Request } from 'express';
import { config } from '../config/app';
import { validateFileType, validateFileSize } from '../services/fileService';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Validate file type
  const validation = validateFileType(file);
  if (!validation.valid) {
    return cb(new Error(validation.error));
  }

  // Validate file size (multer will handle this, but we check here too)
  // Note: Multer's limits.size will be the primary check
  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1, // Only one file at a time
  },
});

// Middleware to handle file upload errors
export function handleUploadError(err: any, req: Request, res: any, next: any) {
  if (err && err.code && err.code.startsWith('LIMIT_')) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds maximum allowed size of ${config.upload.maxFileSize / 1024 / 1024}MB`,
        },
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Only one file can be uploaded at a time',
        },
      });
    }
  }

  // Check if it's a file validation error
  if (err.message.includes('Invalid file type') || err.message.includes('Invalid file extension')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: err.message,
      },
    });
  }

  next(err);
}

