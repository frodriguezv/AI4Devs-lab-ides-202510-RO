import { z } from 'zod';

// Education entry validation schema
export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required').max(255, 'Institution name too long'),
  degree: z.string().min(1, 'Degree is required').max(255, 'Degree name too long'),
  fieldOfStudy: z.string().max(255, 'Field of study too long').optional().or(z.literal('')),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z.string().max(2000, 'Description too long').optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.endDate && data.endDate !== '') {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be greater than or equal to start date',
    path: ['endDate'],
  }
);

// Work experience entry validation schema
export const workExperienceSchema = z.object({
  company: z.string().min(1, 'Company is required').max(255, 'Company name too long'),
  position: z.string().min(1, 'Position is required').max(255, 'Position name too long'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z.string().max(2000, 'Description too long').optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.endDate && data.endDate !== '') {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  {
    message: 'End date must be greater than or equal to start date',
    path: ['endDate'],
  }
);

// Main candidate creation validation schema
export const createCandidateSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must not exceed 100 characters')
    .trim(),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must not exceed 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .max(255, 'Email must not exceed 255 characters'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .max(50, 'Phone number too long')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .trim(),
  address: z.string().max(500, 'Address must not exceed 500 characters').optional().nullable().or(z.literal('')),
  education: z.array(educationSchema).optional().default([]),
  workExperience: z.array(workExperienceSchema).optional().default([]),
  cvFile: z
    .instanceof(File, { message: 'CV file is required' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
      'File must be PDF or DOCX'
    ),
});

// Type exports for TypeScript
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;

