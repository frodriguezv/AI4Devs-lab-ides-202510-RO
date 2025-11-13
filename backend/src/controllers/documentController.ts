import { Request, Response, NextFunction } from 'express';
import { saveFile, getDocumentById } from '../services/fileService';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { documentUploadSchema } from '../validators/documentValidator';

/**
 * POST /api/candidates/:id/documents
 * Upload a document for a candidate
 */
export async function uploadDocumentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) {
      throw new AppError('Invalid candidate ID', 400, 'INVALID_ID');
    }

    // Check if candidate exists
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, deleted_at: null },
    });

    if (!candidate) {
      throw new AppError('Candidate not found', 404, 'CANDIDATE_NOT_FOUND');
    }

    // Validate file is present
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    // Validate document type from form data
    const documentType = req.body.documentType || 'other';
    const validation = documentUploadSchema.safeParse({ documentType });
    if (!validation.success) {
      throw new AppError(validation.error.errors[0].message, 400, 'INVALID_DOCUMENT_TYPE');
    }

    // Save file to disk
    const fileMetadata = await saveFile(req.file, candidateId);

    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        candidate_id: candidateId,
        document_type: validation.data.documentType,
        file_name: fileMetadata.fileName,
        file_path: fileMetadata.filePath,
        mime_type: fileMetadata.mimeType,
        file_size: BigInt(fileMetadata.size),
        uploaded_by: null, // TODO: Get from auth context
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: document.id,
        documentType: document.document_type,
        fileName: document.file_name,
        fileSize: document.file_size.toString(),
        mimeType: document.mime_type,
        uploadDate: document.upload_date,
      },
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/candidates/:id/documents
 * Get all documents for a candidate
 */
export async function getCandidateDocumentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const candidateId = parseInt(req.params.id, 10);
    if (isNaN(candidateId)) {
      throw new AppError('Invalid candidate ID', 400, 'INVALID_ID');
    }

    // Check if candidate exists
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, deleted_at: null },
    });

    if (!candidate) {
      throw new AppError('Candidate not found', 404, 'CANDIDATE_NOT_FOUND');
    }

    const documents = await prisma.document.findMany({
      where: {
        candidate_id: candidateId,
        deleted_at: null,
      },
      orderBy: {
        upload_date: 'desc',
      },
    });

      res.json({
        success: true,
        data: documents.map((doc: any) => ({
        id: doc.id,
        documentType: doc.document_type,
        fileName: doc.file_name,
        fileSize: doc.file_size.toString(),
        mimeType: doc.mime_type,
        uploadDate: doc.upload_date,
      })),
    });
  } catch (error) {
    next(error);
  }
}

