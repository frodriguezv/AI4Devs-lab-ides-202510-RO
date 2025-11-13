import React from 'react';
import { UseFormRegisterReturn, FieldErrors, useFieldArray } from 'react-hook-form';
import { Input } from '../common/Input';
import { DatePicker } from '../common/DatePicker';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { CreateCandidateInput, WorkExperienceInput } from '../../utils/validation';

interface ExperienceSectionProps {
  register: (name: any) => UseFormRegisterReturn;
  control: any;
  errors: FieldErrors<CreateCandidateInput>;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  register,
  control,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'workExperience',
  });

  const addExperience = () => {
    append({
      company: '',
      position: '',
      startDate: '',
      endDate: null,
      description: '',
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addExperience}
          aria-label="Add work experience entry"
        >
          + Add Experience
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No work experience entries added. Click "Add Experience" to add one.
        </p>
      )}

      {fields.map((field, index) => {
        const fieldErrors = errors.workExperience?.[index] as
          | FieldErrors<WorkExperienceInput>
          | undefined;

        return (
          <div
            key={field.id}
            className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">
                Experience Entry {index + 1}
              </h3>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => remove(index)}
                aria-label={`Remove experience entry ${index + 1}`}
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company"
                required
                registration={register(`workExperience.${index}.company`)}
                error={fieldErrors?.company?.message}
                aria-required="true"
              />
              <Input
                label="Position"
                required
                registration={register(`workExperience.${index}.position`)}
                error={fieldErrors?.position?.message}
                aria-required="true"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                required
                registration={register(`workExperience.${index}.startDate`)}
                error={fieldErrors?.startDate?.message}
                max={today}
                aria-required="true"
              />
              <DatePicker
                label="End Date"
                registration={register(`workExperience.${index}.endDate`)}
                error={fieldErrors?.endDate?.message}
                max={today}
                helpText="Leave empty if current position"
              />
            </div>

            <Textarea
              label="Description"
              registration={register(`workExperience.${index}.description`)}
              error={fieldErrors?.description?.message}
              rows={4}
              helpText="Optional: Key responsibilities, achievements, etc."
            />
          </div>
        );
      })}
    </div>
  );
};

