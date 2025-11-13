import React from 'react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center p-4 mb-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-md ${className}`}
      role="alert"
    >
      <svg
        className="w-5 h-5 mr-2 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};

