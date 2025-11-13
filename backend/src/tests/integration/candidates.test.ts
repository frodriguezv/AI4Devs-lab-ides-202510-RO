import request from 'supertest';
import app from '../../index';
import { prisma } from '../../config/database';

describe('Candidates API Integration Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.document.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({});
  });

  afterAll(async () => {
    await prisma.document.deleteMany({});
    await prisma.workExperience.deleteMany({});
    await prisma.education.deleteMany({});
    await prisma.candidate.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/candidates', () => {
    it('should create a candidate with valid data', async () => {
      const candidateData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        education: [
          {
            institution: 'University of Example',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2018-09-01',
            endDate: '2022-05-31',
            description: 'Graduated with honors',
          },
        ],
        workExperience: [
          {
            company: 'Tech Corp',
            position: 'Software Engineer',
            startDate: '2022-06-01',
            endDate: null,
            description: 'Full-stack development',
          },
        ],
      };

      const response = await request(app)
        .post('/api/candidates')
        .send(candidateData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.firstName).toBe(candidateData.firstName);
      expect(response.body.data.lastName).toBe(candidateData.lastName);
      expect(response.body.data.email).toBe(candidateData.email.toLowerCase());
      expect(response.body.data.education).toHaveLength(1);
      expect(response.body.data.workExperience).toHaveLength(1);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .send({
          firstName: 'John',
          // Missing lastName, email, phone
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          phone: '+1234567890',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid date range in education', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john2@example.com',
          phone: '+1234567890',
          education: [
            {
              institution: 'University',
              degree: 'Bachelor',
              startDate: '2022-01-01',
              endDate: '2021-01-01', // End before start
            },
          ],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      const candidateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'duplicate@example.com',
        phone: '+1234567890',
      };

      // Create first candidate
      await request(app).post('/api/candidates').send(candidateData).expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/candidates')
        .send(candidateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should validate name length constraints', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .send({
          firstName: 'A', // Too short
          lastName: 'Doe',
          email: 'test@example.com',
          phone: '+1234567890',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/candidates/:id', () => {
    it('should get a candidate by ID', async () => {
      // Create a candidate first
      const createResponse = await request(app)
        .post('/api/candidates')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@example.com',
          phone: '+1234567890',
        })
        .expect(201);

      const candidateId = createResponse.body.data.id;

      // Get the candidate
      const response = await request(app)
        .get(`/api/candidates/${candidateId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(candidateId);
      expect(response.body.data.firstName).toBe('Test');
    });

    it('should return 404 for non-existent candidate', async () => {
      const response = await request(app)
        .get('/api/candidates/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CANDIDATE_NOT_FOUND');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/candidates/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/candidates', () => {
    it('should list candidates with pagination', async () => {
      const response = await request(app)
        .get('/api/candidates')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('candidates');
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should filter candidates by search term', async () => {
      const response = await request(app)
        .get('/api/candidates')
        .query({ search: 'Test' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('PATCH /api/candidates/:id', () => {
    it('should update a candidate', async () => {
      // Create a candidate
      const createResponse = await request(app)
        .post('/api/candidates')
        .send({
          firstName: 'Update',
          lastName: 'Test',
          email: 'updatetest@example.com',
          phone: '+1234567890',
        })
        .expect(201);

      const candidateId = createResponse.body.data.id;

      // Update the candidate
      const response = await request(app)
        .patch(`/api/candidates/${candidateId}`)
        .send({
          firstName: 'Updated',
          phone: '+9876543210',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.phone).toBe('+9876543210');
    });

    it('should return 404 for non-existent candidate', async () => {
      const response = await request(app)
        .patch('/api/candidates/99999')
        .send({ firstName: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/candidates/:id', () => {
    it('should soft delete a candidate', async () => {
      // Create a candidate
      const createResponse = await request(app)
        .post('/api/candidates')
        .send({
          firstName: 'Delete',
          lastName: 'Test',
          email: 'deletetest@example.com',
          phone: '+1234567890',
        })
        .expect(201);

      const candidateId = createResponse.body.data.id;

      // Delete the candidate
      const response = await request(app)
        .delete(`/api/candidates/${candidateId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify it's soft deleted (should return 404)
      await request(app)
        .get(`/api/candidates/${candidateId}`)
        .expect(404);
    });
  });
});

