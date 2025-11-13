import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/app';
import { prisma } from '../config/database';

export interface FileMetadata {
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
}

/**
 * Sanitizes a filename to prevent path traversal attacks
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, 255); // Limit length
}

/**
 * Generates a unique filename to prevent collisions
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const sanitized = sanitizeFileName(baseName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${sanitized}_${timestamp}_${random}${ext}`;
}

/**
 * Validates file type based on MIME type and extension
 */
export function validateFileType(file: { originalname: string; mimetype: string }): { valid: boolean; error?: string } {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // Check MIME type
  if (!config.upload.allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`,
    };
  }

  // Check extension
  if (!config.upload.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed extensions: ${config.upload.allowedExtensions.join(', ')}`,
    };
  }

  // Additional validation: check file signature for PDF
  // Note: This is a basic check. For production, consider using a library like file-type
  if (ext === '.pdf' && !mimeType.includes('pdf')) {
    return {
      valid: false,
      error: 'File extension does not match MIME type',
    };
  }

  return { valid: true };
}

/**
 * Validates file size
 */
export function validateFileSize(size: number): { valid: boolean; error?: string } {
  if (size > config.upload.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${config.upload.maxFileSize / 1024 / 1024}MB`,
    };
  }
  if (size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }
  return { valid: true };
}

/**
 * Creates upload directory structure: uploads/{year}/{month}/{candidateId}/
 */
export async function createUploadDirectory(candidateId: number): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uploadPath = path.join(config.upload.uploadDir, String(year), month, String(candidateId));

  try {
    await fs.mkdir(uploadPath, { recursive: true });
    return uploadPath;
  } catch (error) {
    throw new Error(`Failed to create upload directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Saves uploaded file to disk
 */
export async function saveFile(file: { originalname: string; mimetype: string; buffer: Buffer; size: number }, candidateId: number): Promise<FileMetadata> {
  // Validate file
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    throw new Error(typeValidation.error);
  }

  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    throw new Error(sizeValidation.error);
  }

  // Create directory structure
  const uploadDir = await createUploadDirectory(candidateId);

  // Generate unique filename
  const fileName = generateUniqueFileName(file.originalname);
  const filePath = path.join(uploadDir, fileName);

  // Save file
  try {
    await fs.writeFile(filePath, file.buffer);
  } catch (error) {
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    originalName: file.originalname,
    fileName,
    filePath,
    mimeType: file.mimetype,
    size: file.size,
  };
}

/**
 * Deletes a file from disk
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore if file doesn't exist
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Gets file metadata from database
 */
export async function getDocumentById(documentId: number) {
  return await prisma.document.findFirst({
    where: {
      id: documentId,
      deleted_at: null,
    },
    include: {
      candidate: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Ensures upload directory exists at application startup
 */
export async function initializeUploadDirectory(): Promise<void> {
  try {
    await fs.mkdir(config.upload.uploadDir, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to initialize upload directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

