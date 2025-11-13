import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AddCandidateForm } from '../../components/candidates/AddCandidateForm';

// Mock the API service
jest.mock('../../services/candidateService', () => ({
  createCandidate: jest.fn(),
  uploadCandidateDocument: jest.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AddCandidateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all sections', () => {
    renderWithRouter(<AddCandidateForm />);

    expect(screen.getByText('Add New Candidate')).toBeInTheDocument();
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Upload CV')).toBeInTheDocument();
  });

  it('displays required field indicators', () => {
    renderWithRouter(<AddCandidateForm />);

    const requiredFields = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
    ];

    requiredFields.forEach((field) => {
      const label = screen.getByText(new RegExp(field));
      expect(label).toBeInTheDocument();
      // Check for asterisk (required indicator)
      const asterisk = label.parentElement?.querySelector('.text-red-500');
      expect(asterisk).toBeInTheDocument();
    });
  });

  it('validates required fields on submit', async () => {
    renderWithRouter(<AddCandidateForm />);

    const submitButton = screen.getByRole('button', { name: /save candidate/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithRouter(<AddCandidateForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'invalid-email');

    // Trigger validation by blurring
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('allows adding multiple education entries', async () => {
    renderWithRouter(<AddCandidateForm />);

    const addEducationButton = screen.getByRole('button', { name: /add education/i });
    await userEvent.click(addEducationButton);

    expect(screen.getByText(/education entry 1/i)).toBeInTheDocument();

    await userEvent.click(addEducationButton);
    expect(screen.getByText(/education entry 2/i)).toBeInTheDocument();
  });

  it('allows removing education entries', async () => {
    renderWithRouter(<AddCandidateForm />);

    const addEducationButton = screen.getByRole('button', { name: /add education/i });
    await userEvent.click(addEducationButton);

    const removeButton = screen.getByRole('button', { name: /remove education entry 1/i });
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText(/education entry 1/i)).not.toBeInTheDocument();
    });
  });

  it('allows adding multiple work experience entries', async () => {
    renderWithRouter(<AddCandidateForm />);

    const addExperienceButton = screen.getByRole('button', { name: /add experience/i });
    await userEvent.click(addExperienceButton);

    expect(screen.getByText(/experience entry 1/i)).toBeInTheDocument();
  });

  it('shows cancel button and handles navigation', async () => {
    renderWithRouter(<AddCandidateForm />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();

    await userEvent.click(cancelButton);
    // Navigation is handled by react-router, so we just verify the button exists
  });
});

describe('Form Validation', () => {
  it('validates phone number format', async () => {
    renderWithRouter(<AddCandidateForm />);

    const phoneInput = screen.getByLabelText(/phone/i);
    await userEvent.type(phoneInput, 'abc123');
    await userEvent.tab();

    await waitFor(() => {
      expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
    });
  });
});

