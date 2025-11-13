import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreateCandidateInput, UpdateCandidateInput } from '../validators/candidateValidator';

type EducationInput = CreateCandidateInput['education'][0];
type WorkExperienceInput = CreateCandidateInput['workExperience'][0];

/**
 * Check if email already exists in the system
 */
export async function emailExists(email: string, excludeId?: number): Promise<boolean> {
  const candidate = await prisma.candidate.findFirst({
    where: {
      email: email.toLowerCase(),
      deleted_at: null,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  return !!candidate;
}

/**
 * Create a new candidate with related education and work experience
 * Uses a transaction to ensure atomicity
 */
export async function createCandidate(data: CreateCandidateInput) {
  return await prisma.$transaction(async (tx) => {
    // Check if email already exists
    if (await emailExists(data.email)) {
      throw new Error('EMAIL_EXISTS');
    }

    // Create candidate
    const candidate = await tx.candidate.create({
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        address: data.address || null,
        application_status: 'new',
        current_stage: 'application',
      },
    });

    // Create education entries
    if (data.education && data.education.length > 0) {
      await tx.education.createMany({
        data: data.education.map((edu: EducationInput) => ({
          candidate_id: candidate.id,
          institution: edu.institution,
          degree: edu.degree,
          field_of_study: edu.fieldOfStudy || null,
          start_date: new Date(edu.startDate),
          end_date: edu.endDate ? new Date(edu.endDate) : null,
          description: edu.description || null,
        })),
      });
    }

    // Create work experience entries
    if (data.workExperience && data.workExperience.length > 0) {
      await tx.workExperience.createMany({
        data: data.workExperience.map((exp: WorkExperienceInput) => ({
          candidate_id: candidate.id,
          company: exp.company,
          position: exp.position,
          start_date: new Date(exp.startDate),
          end_date: exp.endDate ? new Date(exp.endDate) : null,
          description: exp.description || null,
          responsibilities: null,
        })),
      });
    }

    // Fetch complete candidate with relations
    return await getCandidateById(candidate.id);
  });
}

/**
 * Get candidate by ID with all related data
 */
export async function getCandidateById(id: number) {
  const candidate = await prisma.candidate.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      education: {
        where: {
          deleted_at: null,
        },
        orderBy: {
          start_date: 'desc',
        },
      },
      work_experience: {
        where: {
          deleted_at: null,
        },
        orderBy: {
          start_date: 'desc',
        },
      },
      documents: {
        where: {
          deleted_at: null,
        },
        orderBy: {
          upload_date: 'desc',
        },
      },
    },
  });

  if (!candidate) {
    throw new Error('CANDIDATE_NOT_FOUND');
  }

  return candidate;
}

/**
 * Update candidate information
 */
export async function updateCandidate(id: number, data: UpdateCandidateInput) {
  return await prisma.$transaction(async (tx) => {
    // Check if candidate exists
    const existing = await tx.candidate.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new Error('CANDIDATE_NOT_FOUND');
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email.toLowerCase() !== existing.email) {
      if (await emailExists(data.email, id)) {
        throw new Error('EMAIL_EXISTS');
      }
    }

    // Update candidate
    const updateData: any = {};
    if (data.firstName) updateData.first_name = data.firstName;
    if (data.lastName) updateData.last_name = data.lastName;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;

    const candidate = await tx.candidate.update({
      where: { id },
      data: updateData,
    });

    // Update education if provided
    if (data.education !== undefined) {
      // Soft delete existing education
      await tx.education.updateMany({
        where: { candidate_id: id, deleted_at: null },
        data: { deleted_at: new Date() },
      });

      // Create new education entries
      if (data.education.length > 0) {
        await tx.education.createMany({
          data: data.education.map((edu: EducationInput) => ({
            candidate_id: id,
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.fieldOfStudy || null,
            start_date: new Date(edu.startDate),
            end_date: edu.endDate ? new Date(edu.endDate) : null,
            description: edu.description || null,
          })),
        });
      }
    }

    // Update work experience if provided
    if (data.workExperience !== undefined) {
      // Soft delete existing work experience
      await tx.workExperience.updateMany({
        where: { candidate_id: id, deleted_at: null },
        data: { deleted_at: new Date() },
      });

      // Create new work experience entries
      if (data.workExperience.length > 0) {
        await tx.workExperience.createMany({
          data: data.workExperience.map((exp: WorkExperienceInput) => ({
            candidate_id: id,
            company: exp.company,
            position: exp.position,
            start_date: new Date(exp.startDate),
            end_date: exp.endDate ? new Date(exp.endDate) : null,
            description: exp.description || null,
            responsibilities: null,
          })),
        });
      }
    }

    return await getCandidateById(id);
  });
}

/**
 * Soft delete a candidate
 */
export async function deleteCandidate(id: number) {
  const candidate = await prisma.candidate.findFirst({
    where: { id, deleted_at: null },
  });

  if (!candidate) {
    throw new Error('CANDIDATE_NOT_FOUND');
  }

  await prisma.candidate.update({
    where: { id },
    data: { deleted_at: new Date() },
  });

  return { success: true };
}

/**
 * List candidates with pagination and filters
 */
export async function listCandidates(options: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  stage?: string;
}) {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 10, 100); // Max 100 per page
  const skip = (page - 1) * limit;

  const where: any = {
    deleted_at: null,
  };

  // Search filter
  if (options.search) {
    where.OR = [
      { first_name: { contains: options.search, mode: 'insensitive' } },
      { last_name: { contains: options.search, mode: 'insensitive' } },
      { email: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  // Status filter
  if (options.status) {
    where.application_status = options.status;
  }

  // Stage filter
  if (options.stage) {
    where.current_stage = options.stage;
  }

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        education: {
          where: { deleted_at: null },
          take: 1,
          orderBy: { start_date: 'desc' },
        },
        work_experience: {
          where: { deleted_at: null },
          take: 1,
          orderBy: { start_date: 'desc' },
        },
        _count: {
          select: {
            documents: {
              where: { deleted_at: null },
            },
          },
        },
      },
    }),
    prisma.candidate.count({ where }),
  ]);

  return {
    candidates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

