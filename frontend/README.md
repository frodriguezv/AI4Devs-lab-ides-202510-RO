# Frontend Implementation - Add Candidate Interface

## Overview

This frontend application provides a complete, user-friendly interface for recruiters to add candidates to the ATS (Applicant Tracking System). The implementation includes form validation, file uploads, error handling, and excellent UX features.

## Features

### ✅ Implemented Features

1. **Dashboard Integration**
   - Main dashboard page with prominent "Add New Candidate" button
   - Clean, modern UI with TailwindCSS
   - Quick stats and feature highlights

2. **Add Candidate Form**
   - Multi-section form with clear organization
   - Basic Information section (First Name, Last Name, Email, Phone, Address)
   - Dynamic Education section (add/remove multiple entries)
   - Dynamic Work Experience section (add/remove multiple entries)
   - Document Upload section with drag-and-drop

3. **Form Validation**
   - Real-time client-side validation using Zod
   - Email format validation
   - Phone number format validation
   - Date logic validation (end date must be after start date)
   - File upload validation (type and size)
   - Required field validation
   - Server-side error handling and display

4. **User Experience Features**
   - Loading states during form submission
   - Success confirmation modal with multiple action options
   - Clear error messages with actionable guidance
   - Unsaved changes warning
   - Auto-scroll to first error on validation failure
   - Keyboard navigation support
   - Auto-focus on first field

5. **File Upload**
   - Drag-and-drop functionality
   - File preview with name, size, and type
   - Remove/replace file functionality
   - Visual indicators for allowed formats and max size
   - Client-side validation before upload

6. **Responsive Design**
   - Mobile-friendly layout
   - Touch-friendly controls
   - Responsive grid layouts
   - Optimized for tablets and smartphones

7. **Accessibility**
   - Semantic HTML
   - ARIA labels for form controls
   - Keyboard navigation support
   - Screen reader compatibility
   - Sufficient color contrast
   - Focus indicators
   - Error messages associated with form fields

## Technical Stack

- **React 18+** with TypeScript
- **React Hook Form** for form management
- **Zod** for validation
- **Axios** for API calls
- **React Router** for navigation
- **React Dropzone** for file uploads
- **TailwindCSS** for styling

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── candidates/
│   │   │   ├── AddCandidateForm.tsx      # Main form component
│   │   │   ├── BasicInfoSection.tsx      # Basic information section
│   │   │   ├── EducationSection.tsx      # Education entries section
│   │   │   ├── ExperienceSection.tsx     # Work experience section
│   │   │   └── DocumentUpload.tsx        # File upload component
│   │   ├── common/
│   │   │   ├── Input.tsx                 # Reusable input component
│   │   │   ├── Textarea.tsx              # Reusable textarea component
│   │   │   ├── Select.tsx                # Reusable select component
│   │   │   ├── DatePicker.tsx            # Reusable date picker component
│   │   │   ├── Button.tsx                # Reusable button component
│   │   │   ├── ErrorMessage.tsx          # Error message component
│   │   │   └── SuccessMessage.tsx        # Success message component
│   │   └── dashboard/
│   │       └── Dashboard.tsx             # Main dashboard component
│   ├── services/
│   │   └── candidateService.ts           # API service layer
│   ├── utils/
│   │   └── validation.ts                 # Validation schemas
│   ├── tests/
│   │   ├── components/
│   │   │   └── AddCandidateForm.test.tsx # Form component tests
│   │   └── utils/
│   │       └── validation.test.ts        # Validation tests
│   ├── App.tsx                           # Main app component with routing
│   └── index.tsx                         # Entry point
├── tailwind.config.js                    # TailwindCSS configuration
├── postcss.config.js                     # PostCSS configuration
└── package.json                          # Dependencies
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Backend API running (default: http://localhost:3010)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:3010/api
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Usage

### Adding a Candidate

1. Navigate to the dashboard (home page)
2. Click "Add New Candidate" button
3. Fill in the form sections:
   - **Basic Information**: Required fields (First Name, Last Name, Email, Phone) and optional Address
   - **Education**: Click "Add Education" to add education entries. Each entry requires Institution and Degree. Field of Study, dates, and description are optional.
   - **Work Experience**: Click "Add Experience" to add work experience entries. Each entry requires Company and Position. Dates and description are optional.
   - **Upload CV**: Drag and drop a PDF or DOCX file (max 10MB) or click to browse
4. Click "Save Candidate" to submit
5. After successful submission, choose an action:
   - Add Another Candidate
   - View Candidate Details (placeholder page)
   - Return to Dashboard

### Form Validation

The form validates:
- **Required fields**: First Name, Last Name, Email, Phone, CV
- **Email format**: Must be a valid email address
- **Phone format**: Must contain only digits, spaces, dashes, plus signs, and parentheses
- **Date logic**: End dates must be after start dates
- **File type**: Only PDF and DOCX files accepted
- **File size**: Maximum 10MB

### Dynamic Sections

- **Education**: Add multiple education entries. Each entry can be removed individually.
- **Work Experience**: Add multiple work experience entries. Each entry can be removed individually.

## API Integration

### Endpoints Used

1. **POST /api/candidates**
   - Creates a new candidate
   - Request body: Candidate data (firstName, lastName, email, phone, address, education, workExperience)
   - Response: Created candidate object with ID

2. **POST /api/candidates/:id/documents**
   - Uploads a document (CV) for a candidate
   - Request: FormData with `document` file and `documentType` field
   - Response: Document information

### Error Handling

The application handles:
- **Validation errors**: Field-specific errors from the backend are displayed next to relevant fields
- **Network errors**: Generic error message with retry option
- **Server errors**: Error message from server response
- **File upload errors**: Specific error messages for file-related issues

## Component Documentation

### AddCandidateForm

Main form component that orchestrates all sections and handles submission.

**Props**: None (uses React Router for navigation)

**Features**:
- Form state management with React Hook Form
- Validation with Zod
- Success modal with action options
- Error handling and display
- Unsaved changes warning
- Auto-scroll to errors

### BasicInfoSection

Renders basic candidate information fields.

**Props**:
- `register`: React Hook Form register function
- `errors`: Form errors object

### EducationSection

Renders dynamic education entries with add/remove functionality.

**Props**:
- `register`: React Hook Form register function
- `control`: React Hook Form control object
- `errors`: Form errors object

**Features**:
- Add/remove education entries
- Dropdown for degree selection
- Dropdown for field of study
- Date validation

### ExperienceSection

Renders dynamic work experience entries with add/remove functionality.

**Props**:
- `register`: React Hook Form register function
- `control`: React Hook Form control object
- `errors`: Form errors object

**Features**:
- Add/remove experience entries
- Date validation
- Optional end date for current positions

### DocumentUpload

Handles CV file upload with drag-and-drop.

**Props**:
- `setValue`: React Hook Form setValue function
- `watch`: React Hook Form watch function
- `error`: File validation error

**Features**:
- Drag-and-drop file upload
- File preview with name, size, and type
- Remove file functionality
- Client-side validation

### Common Components

All common components (Input, Select, DatePicker, Textarea, Button) follow consistent patterns:
- Support for required field indicators
- Error message display
- Help text support
- Accessibility attributes
- Consistent styling

## Testing

### Running Tests

```bash
npm test
```

### Test Coverage

- Form component rendering
- Form validation
- User interactions
- Dynamic section add/remove
- Field validation rules

### Test Files

- `src/tests/components/AddCandidateForm.test.tsx`: Form component tests
- `src/tests/utils/validation.test.ts`: Validation schema tests

## Styling

The application uses **TailwindCSS** for styling with a custom color scheme:
- Primary color: Blue (primary-500, primary-600, etc.)
- Error color: Red
- Success color: Green
- Gray scale for text and backgrounds

### Responsive Breakpoints

- Mobile: Default (< 640px)
- Tablet: `md:` (≥ 768px)
- Desktop: `lg:` (≥ 1024px)

## Accessibility Features

1. **Semantic HTML**: Proper use of form elements, labels, and headings
2. **ARIA Labels**: All interactive elements have appropriate ARIA labels
3. **Keyboard Navigation**: Full keyboard support for all form interactions
4. **Focus Management**: Clear focus indicators and logical tab order
5. **Error Association**: Error messages are associated with form fields
6. **Screen Reader Support**: All content is accessible to screen readers
7. **Color Contrast**: Meets WCAG 2.1 Level AA standards

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Components are optimized to prevent unnecessary re-renders
- Form validation is debounced where appropriate
- File validation happens client-side before upload
- Lazy loading can be added for future enhancements

## Security Considerations

- All user inputs are validated client-side and server-side
- File types are validated before upload
- File sizes are checked before upload
- API calls use HTTPS (in production)
- No sensitive data stored in localStorage

## Future Enhancements

Potential improvements:
1. Autocomplete for institutions, companies, and positions
2. Save as draft functionality
3. Form auto-save
4. Rich text editor for descriptions
5. Image preview for documents
6. Bulk candidate upload
7. Candidate search and filtering on dashboard
8. Export functionality

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Ensure backend is running on port 3010
   - Check `REACT_APP_API_URL` environment variable
   - Verify CORS settings on backend

2. **File Upload Fails**
   - Check file size (must be < 10MB)
   - Verify file type (PDF or DOCX only)
   - Check backend file upload configuration

3. **Validation Errors Not Showing**
   - Check browser console for errors
   - Verify Zod schema matches backend validation
   - Ensure form is in correct mode (onBlur)

4. **Styling Issues**
   - Clear browser cache
   - Verify TailwindCSS is properly configured
   - Check PostCSS configuration

## Development

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Consistent naming conventions
- Component composition over inheritance

### Adding New Features

1. Create component in appropriate directory
2. Add validation schema if needed
3. Update routing if adding new pages
4. Add tests for new functionality
5. Update this README

## License

See LICENSE.md in the project root.

## Support

For issues or questions, please refer to the main project README or create an issue in the repository.
