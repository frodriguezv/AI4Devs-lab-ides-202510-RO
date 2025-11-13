import { z } from 'zod';

// Document type validation
export const documentTypeSchema = z.enum(['CV', 'resume', 'cover_letter', 'portfolio', 'certificate', 'other'], {
  errorMap: () => ({ message: 'Invalid document type. Must be one of: CV, resume, cover_letter, portfolio, certificate, other' }),
});

// Document upload validation (for form data)
export const documentUploadSchema = z.object({
  documentType: documentTypeSchema,
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

