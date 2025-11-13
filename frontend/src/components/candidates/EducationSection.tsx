import React from 'react';
import { UseFormRegisterReturn, FieldErrors, useFieldArray } from 'react-hook-form';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { DatePicker } from '../common/DatePicker';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { CreateCandidateInput, EducationInput } from '../../utils/validation';

interface EducationSectionProps {
  register: (name: any) => UseFormRegisterReturn;
  control: any;
  errors: FieldErrors<CreateCandidateInput>;
}

const degreeOptions = [
  { value: 'High School', label: 'High School' },
  { value: 'Associate', label: 'Associate Degree' },
  { value: 'Bachelor', label: "Bachelor's Degree" },
  { value: 'Master', label: "Master's Degree" },
  { value: 'PhD', label: 'PhD' },
  { value: 'Certificate', label: 'Certificate' },
  { value: 'Diploma', label: 'Diploma' },
  { value: 'Other', label: 'Other' },
];

const fieldOfStudyOptions = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Business', label: 'Business' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Law', label: 'Law' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Science', label: 'Science' },
  { value: 'Other', label: 'Other' },
];

export const EducationSection: React.FC<EducationSectionProps> = ({
  register,
  control,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  const addEducation = () => {
    append({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: null,
      description: '',
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Education</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEducation}
          aria-label="Add education entry"
        >
          + Add Education
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No education entries added. Click "Add Education" to add one.
        </p>
      )}

      {fields.map((field, index) => {
        const fieldErrors = errors.education?.[index] as
          | FieldErrors<EducationInput>
          | undefined;

        return (
          <div
            key={field.id}
            className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">
                Education Entry {index + 1}
              </h3>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => remove(index)}
                aria-label={`Remove education entry ${index + 1}`}
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Institution"
                required
                registration={register(`education.${index}.institution`)}
                error={fieldErrors?.institution?.message}
                aria-required="true"
              />
              <Select
                label="Degree"
                required
                registration={register(`education.${index}.degree`)}
                error={fieldErrors?.degree?.message}
                options={degreeOptions}
                placeholder="Select degree"
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Field of Study"
                registration={register(`education.${index}.fieldOfStudy`)}
                error={fieldErrors?.fieldOfStudy?.message}
                options={fieldOfStudyOptions}
                placeholder="Select field of study"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                required
                registration={register(`education.${index}.startDate`)}
                error={fieldErrors?.startDate?.message}
                max={today}
                aria-required="true"
              />
              <DatePicker
                label="End Date"
                registration={register(`education.${index}.endDate`)}
                error={fieldErrors?.endDate?.message}
                max={today}
                helpText="Leave empty if currently studying"
              />
            </div>

            <Textarea
              label="Description"
              registration={register(`education.${index}.description`)}
              error={fieldErrors?.description?.message}
              rows={3}
              helpText="Optional: Relevant coursework, achievements, etc."
            />
          </div>
        );
      })}
    </div>
  );
};

