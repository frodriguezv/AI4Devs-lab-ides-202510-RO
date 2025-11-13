# ATS Candidate Management API - Backend Implementation

## Overview

This is a complete REST API backend service for managing candidates in an Applicant Tracking System (ATS). The implementation provides full CRUD operations for candidates, document upload functionality, comprehensive data validation, and robust error handling.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Data Validation](#data-validation)
- [File Upload](#file-upload)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Implementation Details](#implementation-details)

## Features

### Core Functionality
- ✅ Create, read, update, and delete candidates
- ✅ Support for education history (multiple entries per candidate)
- ✅ Support for work experience (multiple entries per candidate)
- ✅ Document upload (CV, cover letters, etc.)
- ✅ List candidates with pagination and filtering
- ✅ Soft delete functionality for data retention compliance

### Data Validation
- ✅ Comprehensive input validation using Zod schemas
- ✅ Email format validation (RFC 5322 compliant)
- ✅ Email uniqueness checking (case-insensitive)
- ✅ Phone number format validation
- ✅ Date range validation (endDate >= startDate)
- ✅ Field length constraints
- ✅ Required field validation

### File Upload
- ✅ Secure file upload with validation
- ✅ Support for PDF and DOCX formats
- ✅ File size limits (10MB default)
- ✅ MIME type and extension validation
- ✅ Unique filename generation to prevent collisions
- ✅ Organized file storage structure (year/month/candidateId)
- ✅ Path traversal attack prevention

### Security
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention
- ✅ CORS configuration
- ✅ Rate limiting on API endpoints
- ✅ Separate rate limiting for upload endpoints
- ✅ Helmet.js for security headers
- ✅ Input sanitization
- ✅ File type validation (MIME type + extension)

### Error Handling
- ✅ Global error handler middleware
- ✅ Consistent error response format
- ✅ Detailed validation error messages
- ✅ Database error handling
- ✅ File upload error handling
- ✅ Proper HTTP status codes

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **File Upload**: Multer
- **Security**: Helmet, CORS, express-rate-limit
- **Documentation**: Swagger/OpenAPI (swagger-jsdoc, swagger-ui-express)
- **Testing**: Jest, Supertest
- **Development**: ts-node-dev

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── app.ts              # Application configuration
│   │   └── database.ts         # Prisma client configuration
│   ├── controllers/
│   │   ├── candidateController.ts    # Candidate request handlers
│   │   └── documentController.ts     # Document upload handlers
│   ├── services/
│   │   ├── candidateService.ts      # Business logic for candidates
│   │   └── fileService.ts           # File handling utilities
│   ├── validators/
│   │   ├── candidateValidator.ts    # Zod schemas for candidates
│   │   └── documentValidator.ts     # Zod schemas for documents
│   ├── middleware/
│   │   ├── errorHandler.ts          # Global error handler
│   │   ├── validation.ts             # Validation middleware
│   │   └── fileUpload.ts             # Multer configuration
│   ├── routes/
│   │   ├── candidateRoutes.ts       # Candidate API routes
│   │   ├── documentRoutes.ts        # Document API routes
│   │   └── index.ts                  # Route aggregator
│   ├── tests/
│   │   ├── integration/
│   │   │   ├── candidates.test.ts    # Integration tests for candidates
│   │   │   └── documents.test.ts     # Integration tests for documents
│   │   └── unit/
│   │       ├── validators.test.ts    # Unit tests for validators
│   │       └── fileService.test.ts   # Unit tests for file service
│   └── index.ts                      # Application entry point
├── prisma/
│   └── schema.prisma                 # Prisma schema definition
├── uploads/                          # File upload directory (created at runtime)
├── .env.example                      # Environment variables template
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/ats_db
   PORT=3010
   NODE_ENV=development
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   CORS_ORIGIN=*
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   UPLOAD_RATE_LIMIT_WINDOW_MS=3600000
   UPLOAD_RATE_LIMIT_MAX=10
   ```

3. **Set Up Database**
   Ensure PostgreSQL is running and create the database:
   ```bash
   createdb ats_db
   ```
   
   Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

The API will be available at `http://localhost:3010` and API documentation at `http://localhost:3010/api-docs`.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | `3010` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `UPLOAD_DIR` | Directory for file uploads | `./uploads` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `10485760` (10MB) |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `UPLOAD_RATE_LIMIT_WINDOW_MS` | Upload rate limit window | `3600000` (1 hour) |
| `UPLOAD_RATE_LIMIT_MAX` | Max uploads per window | `10` |

## API Endpoints

### Candidates

#### POST /api/candidates
Create a new candidate.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "education": [
    {
      "institution": "University of Example",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2018-09-01",
      "endDate": "2022-05-31",
      "description": "Graduated with honors"
    }
  ],
  "workExperience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "startDate": "2022-06-01",
      "endDate": null,
      "description": "Full-stack development"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "applicationStatus": "new",
    "currentStage": "application",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "education": [...],
    "workExperience": [...],
    "documents": []
  },
  "message": "Candidate created successfully"
}
```

#### GET /api/candidates
List candidates with pagination and filters.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in name and email
- `status` (optional): Filter by application status
- `stage` (optional): Filter by current stage

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "candidates": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### GET /api/candidates/:id
Get candidate by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "John",
    ...
  }
}
```

#### PATCH /api/candidates/:id
Update candidate information.

**Request Body:** (all fields optional)
```json
{
  "firstName": "Updated Name",
  "phone": "+9876543210"
}
```

#### DELETE /api/candidates/:id
Soft delete a candidate.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

### Documents

#### POST /api/candidates/:id/documents
Upload a document for a candidate.

**Request:** Multipart form data
- `document` (file): PDF or DOCX file (max 10MB)
- `documentType` (string): One of: CV, resume, cover_letter, portfolio, certificate, other

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "documentType": "CV",
    "fileName": "resume_1234567890_abc123.pdf",
    "fileSize": "245678",
    "mimeType": "application/pdf",
    "uploadDate": "2024-01-01T00:00:00.000Z"
  },
  "message": "Document uploaded successfully"
}
```

#### GET /api/candidates/:id/documents
Get all documents for a candidate.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "documentType": "CV",
      "fileName": "resume_1234567890_abc123.pdf",
      "fileSize": "245678",
      "mimeType": "application/pdf",
      "uploadDate": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Data Validation

### Candidate Validation Rules

- **firstName**: Required, 2-100 characters
- **lastName**: Required, 2-100 characters
- **email**: Required, valid email format, unique in system, case-insensitive
- **phone**: Required, valid phone format (allows digits, spaces, dashes, plus, parentheses)
- **address**: Optional, max 500 characters

### Education Validation Rules

- **institution**: Required, max 255 characters
- **degree**: Required, max 255 characters
- **fieldOfStudy**: Optional, max 255 characters
- **startDate**: Required, format: YYYY-MM-DD
- **endDate**: Optional, format: YYYY-MM-DD, must be >= startDate
- **description**: Optional, max 2000 characters

### Work Experience Validation Rules

- **company**: Required, max 255 characters
- **position**: Required, max 255 characters
- **startDate**: Required, format: YYYY-MM-DD
- **endDate**: Optional, format: YYYY-MM-DD, must be >= startDate
- **description**: Optional, max 2000 characters

## File Upload

### Supported Formats
- PDF (application/pdf)
- DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

### File Validation
- File size: Maximum 10MB (configurable)
- File type: Validated by both MIME type and file extension
- File name: Sanitized to prevent path traversal attacks
- Unique filenames: Generated to prevent collisions

### Storage Structure
Files are stored in the following structure:
```
uploads/
  └── {year}/
      └── {month}/
          └── {candidateId}/
              └── {unique_filename}.{ext}
```

Example: `uploads/2024/01/123/resume_1704067200000_abc123.pdf`

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `EMAIL_EXISTS` | 409 | Email already exists in system |
| `CANDIDATE_NOT_FOUND` | 404 | Candidate not found |
| `INVALID_ID` | 400 | Invalid candidate ID format |
| `NO_FILE` | 400 | No file uploaded |
| `INVALID_FILE_TYPE` | 400 | File type not allowed |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `TOO_MANY_FILES` | 400 | Multiple files uploaded (only one allowed) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UPLOAD_RATE_LIMIT_EXCEEDED` | 429 | Too many upload requests |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Security Features

### Implemented Security Measures

1. **SQL Injection Prevention**
   - Uses Prisma ORM with parameterized queries
   - No raw SQL queries

2. **XSS Prevention**
   - Input sanitization
   - Output encoding (handled by Express)

3. **File Upload Security**
   - MIME type validation
   - File extension validation
   - File size limits
   - Filename sanitization
   - Path traversal prevention

4. **Rate Limiting**
   - General API: 100 requests per 15 minutes
   - Upload endpoints: 10 uploads per hour

5. **CORS Configuration**
   - Configurable allowed origins
   - Credentials support

6. **Security Headers**
   - Helmet.js for security headers
   - XSS protection
   - Content Security Policy

7. **Error Message Security**
   - No sensitive information in error messages
   - Detailed errors only in development mode

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- candidates.test.ts
```

### Test Structure

- **Unit Tests**: Test individual functions and validators
  - `validators.test.ts`: Validation schema tests
  - `fileService.test.ts`: File handling utility tests

- **Integration Tests**: Test API endpoints end-to-end
  - `candidates.test.ts`: Candidate CRUD operations
  - `documents.test.ts`: Document upload operations

### Test Coverage

The test suite covers:
- ✅ All validation rules
- ✅ All API endpoints
- ✅ Error handling scenarios
- ✅ File upload validation
- ✅ Database operations
- ✅ Edge cases

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

The documentation includes:
- All endpoints with request/response examples
- Schema definitions
- Error codes and responses
- Try-it-out functionality

## Implementation Details

### Database Transactions

All candidate creation and update operations use database transactions to ensure atomicity:
- If any related data (education, experience) fails, the entire operation is rolled back
- Ensures data consistency

### File Storage

- Files are stored in memory during upload (using Multer memory storage)
- Files are written to disk after validation
- Unique filenames prevent collisions
- Organized directory structure for easy management

### Error Handling Architecture

1. **Validation Errors**: Caught by Zod validation middleware
2. **Service Errors**: Custom error codes (EMAIL_EXISTS, CANDIDATE_NOT_FOUND)
3. **Database Errors**: Handled by Prisma error handler
4. **File Upload Errors**: Handled by Multer and custom error handler
5. **Global Error Handler**: Catches all errors and formats consistent responses

### Response Formatting

All responses follow a consistent format:
- Success responses: `{ success: true, data: {...}, message: "..." }`
- Error responses: `{ success: false, error: { code: "...", message: "...", details: [...] } }`

### Prisma Integration

- Uses Prisma Client for all database operations
- Connection pooling configured
- Graceful shutdown handling
- Soft deletes using `deleted_at` timestamp

### Middleware Stack

1. Helmet (security headers)
2. CORS
3. Body parsing (JSON, URL-encoded)
4. Rate limiting
5. Routes
6. 404 handler
7. Error handler

## Development

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start production server
- `npm test`: Run tests
- `npm run prisma:generate`: Generate Prisma Client
- `npm run start:prod`: Build and start production server

### Code Style

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Consistent error handling
- Comprehensive comments

## Production Considerations

1. **Environment Variables**: Ensure all production values are set
2. **Database**: Use connection pooling for production
3. **File Storage**: Consider cloud storage (S3) for production
4. **Logging**: Implement proper logging service (e.g., Winston)
5. **Monitoring**: Add health check endpoints
6. **Backup**: Regular database backups
7. **SSL/TLS**: Use HTTPS in production
8. **Rate Limiting**: Adjust limits based on expected load

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify database exists

2. **File Upload Fails**
   - Check upload directory permissions
   - Verify MAX_FILE_SIZE setting
   - Ensure file type is PDF or DOCX

3. **Validation Errors**
   - Check request body format
   - Verify all required fields are present
   - Check field length constraints

4. **Port Already in Use**
   - Change PORT in .env
   - Or kill the process using the port

## License

ISC

## Author

Backend implementation for ATS Candidate Management System

