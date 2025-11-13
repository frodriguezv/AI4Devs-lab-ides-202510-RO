import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { createCandidateSchema, CreateCandidateInput } from '../../utils/validation';
import {
  createCandidate,
  uploadCandidateDocument,
  ApiError,
} from '../../services/candidateService';
import { BasicInfoSection } from './BasicInfoSection';
import { EducationSection } from './EducationSection';
import { ExperienceSection } from './ExperienceSection';
import { DocumentUpload } from './DocumentUpload';
import { Button } from '../common/Button';
import { ErrorMessage } from '../common/ErrorMessage';
import { SuccessMessage } from '../common/SuccessMessage';

interface SuccessModalProps {
  candidateName: string;
  candidateId: number;
  onAddAnother: () => void;
  onViewCandidate: () => void;
  onReturnToDashboard: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  candidateName,
  candidateId,
  onAddAnother,
  onViewCandidate,
  onReturnToDashboard,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Candidate Added Successfully!
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {candidateName} has been added to the system.
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={onAddAnother}
            >
              Add Another Candidate
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={onViewCandidate}
            >
              View Candidate Details
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={onReturnToDashboard}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddCandidateForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    candidateName: string;
    candidateId: number;
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
  } = useForm<CreateCandidateInput>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      education: [],
      workExperience: [],
      address: '',
    },
    mode: 'onBlur',
  });

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Scroll to first error on validation failure
  useEffect(() => {
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const element = document.querySelector(
        `[name="${firstError}"], [id*="${firstError}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [errors]);

  const onSubmit = async (data: CreateCandidateInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Extract CV file before sending to API
      const cvFile = data.cvFile;
      
      // Clean up data: remove cvFile and convert empty strings to null for optional fields
      const candidateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address && data.address.trim() !== '' ? data.address : undefined,
        education: data.education?.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy && edu.fieldOfStudy.trim() !== '' ? edu.fieldOfStudy : undefined,
          startDate: edu.startDate,
          endDate: edu.endDate && edu.endDate.trim() !== '' ? edu.endDate : null,
          description: edu.description && edu.description.trim() !== '' ? edu.description : undefined,
        })) || [],
        workExperience: data.workExperience?.map(exp => ({
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate && exp.endDate.trim() !== '' ? exp.endDate : null,
          description: exp.description && exp.description.trim() !== '' ? exp.description : undefined,
        })) || [],
      };

      // Create candidate
      const response = await createCandidate(candidateData);
      const candidateId = response.data.id;

      // Upload CV if provided
      if (cvFile) {
        try {
          await uploadCandidateDocument(candidateId, cvFile, 'CV');
        } catch (uploadError: any) {
          // Candidate was created but CV upload failed
          console.error('CV upload failed:', uploadError);
          // Still show success but with a warning
          setSubmitError(
            'Candidate created but CV upload failed. You can upload it later.'
          );
        }
      }

      setSuccessData({
        candidateName: `${data.firstName} ${data.lastName}`,
        candidateId,
      });
    } catch (error: any) {
      console.error('Error creating candidate:', error);
      
      // Handle axios errors
      if (error.isAxiosError || error.response) {
        const response = error.response;
        if (response?.data) {
          const apiError = response.data as ApiError;
          if (apiError.error?.details) {
            // Field-specific errors
            const fieldErrors = Object.entries(apiError.error.details)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');
            setSubmitError(`Validation errors:\n${fieldErrors}`);
          } else if (apiError.error?.message) {
            setSubmitError(apiError.error.message);
          } else {
            setSubmitError(`Server error: ${response.status} ${response.statusText || 'Internal Server Error'}`);
          }
        } else if (response?.status) {
          setSubmitError(`Server error: ${response.status} ${response.statusText || 'Internal Server Error'}`);
        } else if (error.request) {
          setSubmitError('Unable to connect to the server. Please check your connection and try again.');
        } else {
          setSubmitError(error.message || 'An unexpected network error occurred. Please try again.');
        }
      } else if (error.message) {
        setSubmitError(error.message);
      } else {
        setSubmitError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    reset();
    setSuccessData(null);
    setSubmitError(null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCandidate = () => {
    if (successData) {
      navigate(`/candidates/${successData.candidateId}`);
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/');
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Add New Candidate
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the candidate's information below
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Close"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {submitError && <ErrorMessage message={submitError} />}

            <BasicInfoSection register={register} errors={errors} />

            <div className="border-t border-gray-200 pt-8">
              <EducationSection
                register={register}
                control={control}
                errors={errors}
              />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <ExperienceSection
                register={register}
                control={control}
                errors={errors}
              />
            </div>

            <div className="border-t border-gray-200 pt-8">
              <DocumentUpload
                setValue={setValue}
                watch={watch}
                error={errors.cvFile}
              />
            </div>

            <div className="border-t border-gray-200 pt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Save Candidate
              </Button>
            </div>
          </form>
        </div>
      </div>

      {successData && (
        <SuccessModal
          candidateName={successData.candidateName}
          candidateId={successData.candidateId}
          onAddAnother={handleAddAnother}
          onViewCandidate={handleViewCandidate}
          onReturnToDashboard={handleReturnToDashboard}
        />
      )}
    </div>
  );
};

