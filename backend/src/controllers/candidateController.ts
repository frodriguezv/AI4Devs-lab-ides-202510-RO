import { Request, Response, NextFunction } from 'express';
import {
  createCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  listCandidates,
} from '../services/candidateService';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /api/candidates
 * Create a new candidate
 */
export async function createCandidateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const candidate = await createCandidate(req.body);
    res.status(201).json({
      success: true,
      data: formatCandidateResponse(candidate),
      message: 'Candidate created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/candidates/:id
 * Get candidate by ID
 */
export async function getCandidateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError('Invalid candidate ID', 400, 'INVALID_ID');
    }

    const candidate = await getCandidateById(id);
    res.json({
      success: true,
      data: formatCandidateResponse(candidate),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/candidates/:id
 * Update candidate
 */
export async function updateCandidateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError('Invalid candidate ID', 400, 'INVALID_ID');
    }

    const candidate = await updateCandidate(id, req.body);
    res.json({
      success: true,
      data: formatCandidateResponse(candidate),
      message: 'Candidate updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/candidates/:id
 * Soft delete candidate
 */
export async function deleteCandidateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError('Invalid candidate ID', 400, 'INVALID_ID');
    }

    await deleteCandidate(id);
    res.json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/candidates
 * List candidates with pagination and filters
 */
export async function listCandidatesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const stage = req.query.stage as string | undefined;

    const result = await listCandidates({ page, limit, search, status, stage });
    res.json({
      success: true,
      data: {
        candidates: result.candidates.map(formatCandidateResponse),
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Format candidate response to match API specification
 */
function formatCandidateResponse(candidate: any) {
  return {
    id: candidate.id,
    firstName: candidate.first_name,
    lastName: candidate.last_name,
    email: candidate.email,
    phone: candidate.phone,
    address: candidate.address,
    applicationStatus: candidate.application_status,
    currentStage: candidate.current_stage,
    createdAt: candidate.created_at,
    updatedAt: candidate.updated_at,
    education: candidate.education?.map((edu: any) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.field_of_study,
      startDate: edu.start_date,
      endDate: edu.end_date,
      description: edu.description,
    })) || [],
    workExperience: candidate.work_experience?.map((exp: any) => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      startDate: exp.start_date,
      endDate: exp.end_date,
      description: exp.description,
      responsibilities: exp.responsibilities,
    })) || [],
    documents: candidate.documents?.map((doc: any) => ({
      id: doc.id,
      documentType: doc.document_type,
      fileName: doc.file_name,
      fileSize: doc.file_size.toString(),
      mimeType: doc.mime_type,
      uploadDate: doc.upload_date,
    })) || [],
  };
}

