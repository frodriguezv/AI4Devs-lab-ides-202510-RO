import { Router } from 'express';
import {
  uploadDocumentHandler,
  getCandidateDocumentsHandler,
} from '../controllers/documentController';
import { upload, handleUploadError } from '../middleware/fileUpload';
import { validate } from '../middleware/validation';
import { candidateIdSchema } from '../validators/candidateValidator';

const router = Router();

/**
 * @swagger
 * /api/candidates/{id}/documents:
 *   post:
 *     summary: Upload a document for a candidate
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *                 enum: [CV, resume, cover_letter, portfolio, certificate, other]
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       404:
 *         description: Candidate not found
 */
router.post(
  '/:id/documents',
  validate(candidateIdSchema, 'params'),
  upload.single('document'),
  handleUploadError,
  uploadDocumentHandler
);

/**
 * @swagger
 * /api/candidates/{id}/documents:
 *   get:
 *     summary: Get all documents for a candidate
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       404:
 *         description: Candidate not found
 */
router.get(
  '/:id/documents',
  validate(candidateIdSchema, 'params'),
  getCandidateDocumentsHandler
);

export default router;

