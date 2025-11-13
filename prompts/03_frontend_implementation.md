# Frontend Implementation Prompt: Add Candidate Interface

## Context
We have completed the database schema and backend API for the ATS system. Now we need to implement the frontend interface that recruiters will use to add candidates to the system.

## Objective
Develop a complete, user-friendly frontend interface for recruiters to add candidates, including form validation, file uploads, and proper error handling with excellent UX.

## Requirements

### 1. Dashboard Integration

#### Main Dashboard Page
- Create or integrate with recruiter dashboard
- Add prominent "Add New Candidate" button or link
- Button should be clearly visible and accessible
- Consider placement in header, sidebar, or as a floating action button

#### Navigation
- Smooth navigation from dashboard to add candidate form
- Breadcrumb navigation for context
- Cancel/back functionality to return to dashboard

### 2. Add Candidate Form

#### Form Structure

Create a multi-section form with these components:

**Section 1: Basic Information**
- First Name (required)
- Last Name (required)
- Email (required, validated)
- Phone (required, formatted)
- Address (optional)

**Section 2: Education (Dynamic)**
- Allow adding multiple education entries
- Fields per entry:
  - Institution (required)
  - Degree (required, dropdown or autocomplete)
  - Field of Study (required, dropdown or autocomplete)
  - Start Date (required, date picker)
  - End Date (optional, date picker, with "Current" checkbox)
  - Description (optional, textarea)
- "Add Education" and "Remove" buttons for dynamic entries

**Section 3: Work Experience (Dynamic)**
- Allow adding multiple work experience entries
- Fields per entry:
  - Company (required)
  - Position (required)
  - Start Date (required, date picker)
  - End Date (optional, date picker, with "Current Position" checkbox)
  - Description (optional, textarea)
- "Add Experience" and "Remove" buttons for dynamic entries

**Section 4: Document Upload**
- CV upload (required)
- Drag-and-drop file upload area
- Browse files button as alternative
- File preview/name display after selection
- File size and format display
- Remove/replace file functionality
- Visual indicators: allowed formats (PDF, DOCX), max size (10MB)

**Form Actions**
- "Save Candidate" (primary action button)
- "Cancel" (secondary action button)
- "Save as Draft" (optional, for future enhancement)

### 3. Form Validation

#### Client-Side Validation

Implement real-time validation for:

**Email Validation**
- Valid email format check
- Real-time feedback as user types
- Show error message if invalid

**Phone Validation**
- Valid phone format
- Consider international format support
- Format as user types (optional)

**Required Fields**
- Mark required fields with asterisk (*)
- Show error when required field is empty on blur
- Prevent submission if required fields are missing

**Date Logic Validation**
- End date must be after start date
- Show error if logic is violated
- Date picker should prevent impossible selections

**File Upload Validation**
- Check file type before upload
- Check file size before upload
- Show clear error messages for invalid files

**Dynamic Validation**
- Show validation errors in real-time
- Clear errors when user corrects input
- Display error messages near relevant fields
- Use appropriate colors (red for errors, green for success)

#### Server-Side Validation Integration
- Display backend validation errors
- Map API error responses to form fields
- Show general errors at form level
- Maintain form state when validation fails

### 4. User Experience Features

#### Loading States
- Show loading spinner during form submission
- Disable form inputs while submitting
- Disable submit button to prevent double submission
- Show upload progress for file uploads

#### Success Confirmation
- Display success message after candidate is added
- Show confirmation modal or notification
- Include candidate name in success message
- Provide options:
  - "Add Another Candidate"
  - "View Candidate Details"
  - "Return to Dashboard"
- Auto-redirect to dashboard after few seconds (optional)

#### Error Handling
- Display clear, user-friendly error messages
- Different error types:
  - Validation errors (field-specific)
  - Network errors
  - Server errors
  - File upload errors
- Provide actionable guidance for fixing errors
- Allow retry on network failures

#### Form Usability
- Logical tab order for keyboard navigation
- Auto-focus on first field when form loads
- Smooth scrolling to first error on validation failure
- Unsaved changes warning before leaving page
- Field-level help text or tooltips where needed

### 5. Autocomplete Features (Nice to Have)

#### Education Autocomplete
- Suggest institutions from existing database entries
- Suggest common degrees
- Suggest fields of study

#### Work Experience Autocomplete
- Suggest company names from existing entries
- Suggest job positions

#### Implementation Notes
- Use debouncing for API calls (300-500ms)
- Show loading indicator while fetching suggestions
- Allow free text entry if suggestion not found
- Limit number of suggestions displayed (5-10)

### 6. Responsive Design

#### Mobile Compatibility
- Responsive layout for tablets and smartphones
- Touch-friendly form controls
- Appropriate input types for mobile (tel, email, date)
- Optimized file upload for mobile

#### Browser Compatibility
- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Test on different screen sizes
- Ensure accessibility standards (WCAG 2.1 Level AA)

### 7. Accessibility Requirements

- Proper semantic HTML
- ARIA labels for form controls
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus indicators for keyboard users
- Error messages associated with form fields

### 8. Technical Stack Preferences

Please implement using this framework

**Option A - React**
- React 18+ with hooks
- React Hook Form or Formik for form management
- Yup or Zod for validation
- Axios for API calls
- React Router for navigation
- React Dropzone for file uploads
- TailwindCSS or Material-UI for styling


### 9. Deliverables

Please provide:

1. **Complete Form Component(s)**
   - Main form container
   - Form sections/sub-components
   - Dynamic field components
   - File upload component

2. **Form Validation Logic**
   - Validation schemas/rules
   - Custom validators
   - Error message handling
   - Real-time validation

3. **API Integration**
   - Service/API layer for backend calls
   - Request/response handling
   - Error handling
   - Loading state management

4. **State Management**
   - Form state management
   - Application state (if needed)
   - Error state
   - Loading state

5. **Styling and Layout**
   - Responsive CSS/component styles
   - Form layout
   - Loading indicators
   - Error displays
   - Success notifications

6. **Dashboard Integration**
   - Dashboard page with "Add Candidate" button
   - Navigation setup
   - Route configuration

7. **User Documentation**
   - Component usage guide
   - Setup instructions
   - Available props/configuration
   - Examples

8. **Tests**
   - Component tests
   - Form validation tests
   - User interaction tests
   - Accessibility tests

## Expected File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── candidates/
│   │   │   ├── AddCandidateForm.jsx
│   │   │   ├── BasicInfoSection.jsx
│   │   │   ├── EducationSection.jsx
│   │   │   ├── ExperienceSection.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   └── FormActions.jsx
│   │   ├── common/
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   ├── Button.jsx
│   │   │   └── ErrorMessage.jsx
│   │   └── dashboard/
│   │       └── Dashboard.jsx
│   ├── services/
│   │   └── candidateService.js
│   ├── utils/
│   │   └── validation.js
│   ├── hooks/
│   │   └── useFormValidation.js
│   ├── styles/
│   │   └── candidates.css
│   └── App.jsx
├── tests/
│   └── components/
│       └── AddCandidateForm.test.jsx
├── package.json
└── README.md
```

## Form Field Specifications

### Input Field Standards
- Label placement: above input
- Required indicator: red asterisk after label
- Help text: below input in smaller gray text
- Error message: below input in red, with icon
- Success indicator: green checkmark (optional)

### Date Picker
- Format: YYYY-MM-DD or locale-appropriate
- Min/max date restrictions where applicable
- "Current" checkbox disables end date
- Clear visual indication of selected dates

### File Upload Area
- Minimum 200px height for drag-drop area
- Dashed border indicating drop zone
- Icon indicating file type accepted
- Clear instructions: "Drag & drop CV here or click to browse"
- File preview showing name, size, type

## Example Form Layout

```
┌────────────────────────────────────────────┐
│  Add New Candidate                    [X]  │
├────────────────────────────────────────────┤
│                                            │
│  Basic Information                         │
│  ┌──────────────┐  ┌──────────────┐      │
│  │ First Name * │  │ Last Name  * │      │
│  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────┐    │
│  │ Email *                          │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────┐  ┌──────────────┐      │
│  │ Phone *      │  │ Address       │      │
│  └──────────────┘  └──────────────┘      │
│                                            │
│  Education                   [Add Entry]   │
│  ┌─────────────────────────────────────┐  │
│  │ Institution *          [Remove]     │  │
│  │ Degree *                           │  │
│  │ Field of Study *                   │  │
│  │ Start Date * | End Date            │  │
│  │ Description                        │  │
│  └─────────────────────────────────────┘  │
│                                            │
│  Work Experience             [Add Entry]   │
│  ┌─────────────────────────────────────┐  │
│  │ Company *              [Remove]     │  │
│  │ Position *                         │  │
│  │ Start Date * | End Date            │  │
│  │ Description                        │  │
│  └─────────────────────────────────────┘  │
│                                            │
│  Upload CV *                               │
│  ┌─────────────────────────────────────┐  │
│  │    📄 Drag & drop CV here          │  │
│  │       or click to browse            │  │
│  │                                     │  │
│  │   Accepted: PDF, DOCX (max 10MB)   │  │
│  └─────────────────────────────────────┘  │
│                                            │
│     [Cancel]  [Save Candidate]             │
└────────────────────────────────────────────┘
```

## API Integration Specifications

### POST /api/candidates

```javascript
// Request payload structure
const candidateData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  address: "123 Main St",
  education: [
    {
      institution: "University Name",
      degree: "Bachelor",
      fieldOfStudy: "Computer Science",
      startDate: "2015-09-01",
      endDate: "2019-06-01",
      description: "Relevant coursework..."
    }
  ],
  workExperience: [
    {
      company: "Tech Corp",
      position: "Software Developer",
      startDate: "2019-07-01",
      endDate: null, // current position
      description: "Responsibilities..."
    }
  ]
};

// After successful candidate creation, upload CV
const formData = new FormData();
formData.append('document', cvFile);
formData.append('documentType', 'cv');
// POST /api/candidates/{candidateId}/documents
```

## Performance Considerations

- Lazy load components where appropriate
- Debounce autocomplete API calls
- Optimize re-renders (React.memo, useMemo)
- Show skeleton loaders during data fetching
- Implement code splitting for routing

## Security Considerations

- Sanitize all user inputs before display
- Use HTTPS for API calls
- Don't store sensitive data in localStorage
- Implement CSRF protection
- Validate file types on client and rely on backend for security

## Testing Checklist

Before submitting, ensure:
- [ ] All form fields render correctly
- [ ] Required field validation works
- [ ] Email format validation works
- [ ] Date logic validation works
- [ ] File upload accepts valid files
- [ ] File upload rejects invalid files
- [ ] Dynamic add/remove for education works
- [ ] Dynamic add/remove for experience works
- [ ] Form submission with valid data succeeds
- [ ] Error messages display correctly
- [ ] Success confirmation appears
- [ ] Cancel button works
- [ ] Navigation works correctly
- [ ] Responsive on mobile devices
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Cross-browser compatible

## Success Criteria

The frontend is complete when:
- Recruiter can access add candidate form from dashboard
- All form fields are functional and properly validated
- Dynamic sections (education, experience) work correctly
- File upload works with proper validation
- Form submission creates candidate successfully
- Success and error states are properly displayed
- Interface is intuitive and user-friendly
- Responsive design works on all devices
- Accessibility standards are met
- All tests pass successfully
- Provide the frontend implementation readme file with every single thing you implemented