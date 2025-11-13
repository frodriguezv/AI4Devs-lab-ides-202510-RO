import React from 'react';
import { UseFormRegisterReturn, FieldErrors } from 'react-hook-form';
import { Input } from '../common/Input';
import { CreateCandidateInput } from '../../utils/validation';

interface BasicInfoSectionProps {
  register: (name: keyof CreateCandidateInput) => UseFormRegisterReturn;
  errors: FieldErrors<CreateCandidateInput>;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  register,
  errors,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            required
            registration={register('firstName')}
            error={errors.firstName?.message}
            autoFocus
            aria-required="true"
          />
          <Input
            label="Last Name"
            required
            registration={register('lastName')}
            error={errors.lastName?.message}
            aria-required="true"
          />
        </div>
        <div className="mt-4">
          <Input
            label="Email"
            type="email"
            required
            registration={register('email')}
            error={errors.email?.message}
            helpText="We'll use this email to contact the candidate"
            aria-required="true"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Phone"
            type="tel"
            required
            registration={register('phone')}
            error={errors.phone?.message}
            helpText="Include country code if international"
            aria-required="true"
          />
          <Input
            label="Address"
            registration={register('address')}
            error={errors.address?.message}
            helpText="Optional"
          />
        </div>
      </div>
    </div>
  );
};

