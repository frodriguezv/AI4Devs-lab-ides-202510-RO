import { createCandidateSchema, educationSchema, workExperienceSchema } from '../../validators/candidateValidator';

describe('Candidate Validators', () => {
  describe('createCandidateSchema', () => {
    it('should validate a valid candidate', () => {
      const validCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St',
      };

      const result = createCandidateSchema.safeParse(validCandidate);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidCandidate = {
        firstName: 'John',
        // Missing lastName, email, phone
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890',
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
    });

    it('should reject firstName that is too short', () => {
      const invalidCandidate = {
        firstName: 'A',
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '+1234567890',
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
    });

    it('should reject firstName that is too long', () => {
      const invalidCandidate = {
        firstName: 'A'.repeat(101),
        lastName: 'Doe',
        email: 'test@example.com',
        phone: '+1234567890',
      };

      const result = createCandidateSchema.safeParse(invalidCandidate);
      expect(result.success).toBe(false);
    });

    it('should normalize email to lowercase', () => {
      const candidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'JOHN.DOE@EXAMPLE.COM',
        phone: '+1234567890',
      };

      const result = createCandidateSchema.safeParse(candidate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john.doe@example.com');
      }
    });
  });

  describe('educationSchema', () => {
    it('should validate valid education entry', () => {
      const validEducation = {
        institution: 'University',
        degree: 'Bachelor',
        fieldOfStudy: 'Computer Science',
        startDate: '2018-09-01',
        endDate: '2022-05-31',
        description: 'Graduated with honors',
      };

      const result = educationSchema.safeParse(validEducation);
      expect(result.success).toBe(true);
    });

    it('should reject endDate before startDate', () => {
      const invalidEducation = {
        institution: 'University',
        degree: 'Bachelor',
        startDate: '2022-01-01',
        endDate: '2021-01-01',
      };

      const result = educationSchema.safeParse(invalidEducation);
      expect(result.success).toBe(false);
    });

    it('should allow null endDate (ongoing education)', () => {
      const validEducation = {
        institution: 'University',
        degree: 'Bachelor',
        startDate: '2022-01-01',
        endDate: null,
      };

      const result = educationSchema.safeParse(validEducation);
      expect(result.success).toBe(true);
    });
  });

  describe('workExperienceSchema', () => {
    it('should validate valid work experience entry', () => {
      const validExperience = {
        company: 'Tech Corp',
        position: 'Software Engineer',
        startDate: '2022-06-01',
        endDate: null,
        description: 'Full-stack development',
      };

      const result = workExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });

    it('should reject endDate before startDate', () => {
      const invalidExperience = {
        company: 'Tech Corp',
        position: 'Software Engineer',
        startDate: '2022-06-01',
        endDate: '2021-01-01',
      };

      const result = workExperienceSchema.safeParse(invalidExperience);
      expect(result.success).toBe(false);
    });
  });
});

