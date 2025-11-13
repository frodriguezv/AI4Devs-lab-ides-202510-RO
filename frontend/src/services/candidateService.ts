import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
}

export interface WorkExperience {
  id?: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  description?: string;
}

export interface CreateCandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  education?: Education[];
  workExperience?: WorkExperience[];
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  applicationStatus?: string;
  currentStage?: string;
  createdAt: string;
  updatedAt: string;
  education?: Education[];
  workExperience?: WorkExperience[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Create a new candidate
 */
export async function createCandidate(
  candidateData: CreateCandidateData
): Promise<ApiResponse<Candidate>> {
  const response = await api.post<ApiResponse<Candidate>>('/candidates', candidateData);
  return response.data;
}

/**
 * Upload a document for a candidate
 */
export async function uploadCandidateDocument(
  candidateId: number,
  file: File,
  documentType: string = 'CV'
): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  const response = await api.post<ApiResponse<any>>(
    `/candidates/${candidateId}/documents`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

/**
 * Get candidate by ID
 */
export async function getCandidate(candidateId: number): Promise<ApiResponse<Candidate>> {
  const response = await api.get<ApiResponse<Candidate>>(`/candidates/${candidateId}`);
  return response.data;
}

/**
 * List candidates with pagination
 */
export async function listCandidates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  stage?: string;
}): Promise<ApiResponse<{ candidates: Candidate[]; pagination: any }>> {
  const response = await api.get<ApiResponse<{ candidates: Candidate[]; pagination: any }>>(
    '/candidates',
    { params }
  );
  return response.data;
}

export default {
  createCandidate,
  uploadCandidateDocument,
  getCandidate,
  listCandidates,
};

