import { createCandidateSchema, educationSchema, workExperienceSchema } from '../../utils/validation';

describe('Validation Schemas', () => {
  describe('createCandidateSchema', () => {
    it('validates a valid candidate', () => {
      const validCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        education: [],
        workExperience: [],
        cvFile: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
      };

      const result = createCandidateSchema.safeParse(validCandidate);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const invalidCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890',
        cvFile: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('rejects short first name', () => {
      const invalidCandidate = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        cvFile: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('firstName');
      }
    });

    it('rejects invalid phone format', () => {
      const invalidCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: 'abc123',
        cvFile: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone');
      }
    });

    it('rejects file that is too large', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      });

      const invalidCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        cvFile: largeFile,
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('cvFile');
      }
    });

    it('rejects invalid file type', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const invalidCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        cvFile: invalidFile,
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('cvFile');
      }
    });
  });

  describe('educationSchema', () => {
    it('validates valid education entry', () => {
      const validEducation = {
        institution: 'University',
        degree: 'Bachelor',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-09-01',
        endDate: '2019-06-01',
        description: 'Relevant coursework',
      };

      const result = educationSchema.safeParse(validEducation);
      expect(result.success).toBe(true);
    });

    it('rejects end date before start date', () => {
      const invalidEducation = {
        institution: 'University',
        degree: 'Bachelor',
        startDate: '2019-06-01',
        endDate: '2015-09-01',
      };

      const result = educationSchema.safeParse(invalidEducation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('endDate');
      }
    });
  });

  describe('workExperienceSchema', () => {
    it('validates valid work experience entry', () => {
      const validExperience = {
        company: 'Tech Corp',
        position: 'Software Developer',
        startDate: '2019-07-01',
        endDate: '2021-07-01',
        description: 'Responsibilities',
      };

      const result = workExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });

    it('rejects end date before start date', () => {
      const invalidExperience = {
        company: 'Tech Corp',
        position: 'Software Developer',
        startDate: '2021-07-01',
        endDate: '2019-07-01',
      };

      const result = workExperienceSchema.safeParse(invalidExperience);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('endDate');
      }
    });
  });
});

