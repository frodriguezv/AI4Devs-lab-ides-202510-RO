import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Recruiter Dashboard
            </h1>
            <Button
              variant="primary"
              onClick={() => navigate('/candidates/add')}
              className="flex items-center space-x-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add New Candidate</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Welcome to the ATS System
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Get started by adding a new candidate to the system.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/candidates/add')}
                className="inline-flex items-center space-x-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add New Candidate</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats or Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600">+</div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Add Candidates
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Quickly add new candidates with their information
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600">📄</div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Upload Documents
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload CVs and other documents for each candidate
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600">📊</div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Track Progress
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Monitor candidate progress through the hiring process
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

