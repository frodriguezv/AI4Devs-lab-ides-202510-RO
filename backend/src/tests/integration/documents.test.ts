import request from 'supertest';
import app from '../../index';
import { prisma } from '../../config/database';
import fs from 'fs/promises';
import path from 'path';

describe('Documents API Integration Tests', () => {
  let candidateId: number;

  beforeAll(async () => {
    // Clean up test data
    await prisma.document.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({});

    // Create a test candidate
    const candidate = await prisma.candidate.create({
      data: {
        first_name: 'Document',
        last_name: 'Test',
        email: 'documenttest@example.com',
        phone: '+1234567890',
      },
    });
    candidateId = candidate.id;
  });

  afterAll(async () => {
    await prisma.document.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/candidates/:id/documents', () => {
    it('should upload a PDF document', async () => {
      // Create a mock PDF file buffer
      const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');

      const response = await request(app)
        .post(`/api/candidates/${candidateId}/documents`)
        .field('documentType', 'CV')
        .attach('document', pdfBuffer, 'test.pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.documentType).toBe('CV');
      expect(response.body.data.fileName).toContain('test');
    });

    it('should return 400 for invalid file type', async () => {
      const invalidBuffer = Buffer.from('This is not a valid PDF');

      const response = await request(app)
        .post(`/api/candidates/${candidateId}/documents`)
        .field('documentType', 'CV')
        .attach('document', invalidBuffer, 'test.txt')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_FILE_TYPE');
    });

    it('should return 400 for file too large', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post(`/api/candidates/${candidateId}/documents`)
        .field('documentType', 'CV')
        .attach('document', largeBuffer, 'large.pdf')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(['FILE_TOO_LARGE', 'INVALID_FILE_TYPE']).toContain(response.body.error.code);
    });

    it('should return 400 for invalid document type', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');

      const response = await request(app)
        .post(`/api/candidates/${candidateId}/documents`)
        .field('documentType', 'invalid_type')
        .attach('document', pdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent candidate', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');

      const response = await request(app)
        .post('/api/candidates/99999/documents')
        .field('documentType', 'CV')
        .attach('document', pdfBuffer, 'test.pdf')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CANDIDATE_NOT_FOUND');
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app)
        .post(`/api/candidates/${candidateId}/documents`)
        .field('documentType', 'CV')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_FILE');
    });
  });

  describe('GET /api/candidates/:id/documents', () => {
    it('should get all documents for a candidate', async () => {
      const response = await request(app)
        .get(`/api/candidates/${candidateId}/documents`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent candidate', async () => {
      const response = await request(app)
        .get('/api/candidates/99999/documents')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

