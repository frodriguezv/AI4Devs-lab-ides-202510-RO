# Backend Implementation Prompt: Add Candidate API

## Context
We have completed the database schema design for the ATS system. Now we need to implement the backend API that will handle candidate creation, data validation, and file uploads.

## Objective
Develop a complete REST API backend service to support the "Add Candidate to System" functionality with full data validation, error handling, and security measures.

## Requirements

### 1. API Endpoints

#### POST /api/candidates
Create a new candidate with all related information.

**Request Body Structure:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "date",
      "endDate": "date",
      "description": "string"
    }
  ],
  "workExperience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "date",
      "endDate": "date",
      "description": "string"
    }
  ]
}
```

**Response:**
- Success (201 Created): Return created candidate with ID
- Error (400 Bad Request): Validation errors
- Error (409 Conflict): Duplicate email
- Error (500 Internal Server Error): Server errors

#### POST /api/candidates/{id}/documents
Upload CV or other documents for a candidate.

**Request:**
- Multipart form data
- File field: "document"
- Additional fields: documentType (e.g., "cv", "cover_letter")
- Max file size: 10MB
- Allowed formats: PDF, DOCX

**Response:**
- Success (201 Created): Document metadata
- Error (400 Bad Request): Invalid file type or size
- Error (404 Not Found): Candidate not found
- Error (500 Internal Server Error): Upload failure

#### GET /api/candidates/{id}
Retrieve candidate details (for verification purposes).

#### Additional Endpoints (Optional but Recommended)
- PATCH /api/candidates/{id} - Update candidate information
- DELETE /api/candidates/{id} - Soft delete candidate
- GET /api/candidates - List candidates with pagination and filters

### 2. Data Validation

Implement comprehensive validation:

#### Email Validation
- Must be valid email format (RFC 5322)
- Must be unique in the system
- Case-insensitive comparison

#### Required Fields Validation
- firstName: required, min 2 characters, max 100 characters
- lastName: required, min 2 characters, max 100 characters
- email: required, valid format
- phone: required, valid phone format (consider international formats)

#### Optional Fields Validation
- address: max 500 characters
- education fields: validate date logic (endDate >= startDate)
- workExperience fields: validate date logic

#### File Validation
- File type: only PDF and DOCX allowed (check MIME type and extension)
- File size: maximum 10MB
- File name sanitization (prevent path traversal attacks)
- Virus scanning (if feasible)

### 3. Business Logic

#### Transaction Management
- Use database transactions for candidate creation
- If any related data (education, experience) fails, rollback entire operation
- Ensure atomicity of operations

#### File Storage
- Implement secure file storage (local filesystem or cloud storage like S3)
- Generate unique file names to prevent collisions
- Store file metadata in database
- Consider file organization structure (e.g., /uploads/{year}/{month}/{candidateId}/)

#### Error Handling
- Catch and handle all database errors
- Provide meaningful error messages without exposing sensitive information
- Log errors with appropriate detail level
- Return consistent error response format

#### Security Measures
- Input sanitization to prevent SQL injection
- XSS prevention in stored data
- CORS configuration for frontend access
- Rate limiting on upload endpoints
- Authentication/Authorization (if users are in scope)
- Validate file content, not just extension

### 4. Technical Stack Preferences

Please implement using one of these stacks (choose based on team preference):

**Option A - Node.js**
- Express.js or Fastify framework
- pg or Sequelize for PostgreSQL
- multer for file uploads
- joi or zod for validation
- dotenv for configuration

**Option B - Python**
- Flask or FastAPI framework
- psycopg2 or SQLAlchemy for PostgreSQL
- python-multipart for file uploads
- pydantic for validation
- python-dotenv for configuration

**Option C - Java**
- Spring Boot framework
- JPA/Hibernate for database
- Spring Web for REST API
- MultipartFile for uploads
- Bean Validation for validation

### 5. Configuration

Implement configuration management:
- Database connection parameters
- File upload directory/bucket
- Maximum file size
- Allowed file types
- CORS allowed origins
- Port and host configuration

### 6. Testing Requirements

Provide tests for:

#### Unit Tests
- Validation logic
- Business logic functions
- Utility functions (file name generation, etc.)

#### Integration Tests
- POST /api/candidates endpoint with valid data
- POST /api/candidates with invalid data (each validation rule)
- POST /api/candidates with duplicate email
- File upload with valid files
- File upload with invalid files (wrong type, too large)
- Database transaction rollback scenarios

#### Test Coverage
- Aim for 80%+ code coverage
- Include edge cases and error scenarios

### 7. Deliverables

Please provide:

1. **Complete Backend API Implementation**
   - All endpoint handlers
   - Business logic layer
   - Data access layer
   - Validation schemas

2. **File Upload Functionality**
   - Secure file handling
   - Storage implementation
   - Metadata management

3. **Database Integration**
   - Connection pooling
   - Query functions
   - Transaction management
   - Migration integration (use the schema from Task 1)

4. **Error Handling Middleware**
   - Global error handler
   - Validation error formatter
   - Logging system

5. **API Documentation**
   - OpenAPI/Swagger specification
   - Request/response examples
   - Error codes documentation
   - Setup and run instructions

6. **Configuration Files**
   - Environment variables template (.env.example)
   - Application configuration
   - Database configuration

7. **Test Suite**
   - Unit tests
   - Integration tests
   - Test data fixtures
   - Test running instructions

## Expected File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── candidateController.js
│   ├── services/
│   │   ├── candidateService.js
│   │   └── fileService.js
│   ├── models/
│   │   └── candidate.js
│   ├── validators/
│   │   └── candidateValidator.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── config/
│   │   └── database.js
│   └── app.js
├── tests/
│   ├── unit/
│   └── integration/
├── uploads/
├── .env.example
├── package.json (or requirements.txt, pom.xml)
└── README.md
```

## API Response Format Standards

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    ...
  },
  "message": "Candidate added successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ]
  }
}
```

## Performance Considerations

- Use connection pooling for database
- Implement request validation early to avoid unnecessary processing
- Stream large files instead of loading into memory
- Consider async operations for file uploads
- Add request timeouts

## Security Checklist

Before submitting, ensure:
- [ ] SQL injection prevention (parameterized queries)
- [ ] Input sanitization implemented
- [ ] File upload security (type, size validation)
- [ ] Error messages don't expose sensitive information
- [ ] CORS properly configured
- [ ] Rate limiting on sensitive endpoints
- [ ] Logging doesn't include sensitive data
- [ ] Environment variables for secrets
- [ ] File path traversal prevention

## Success Criteria

The backend is complete when:
- All endpoints respond correctly to valid requests
- All validation rules are enforced
- Invalid requests return appropriate error messages
- Files can be uploaded and stored securely
- Database transactions maintain data integrity
- All tests pass successfully
- API documentation is complete and accurate
- Code follows best practices and is well-commented
- Provide the backend implementation readme file with every single thing you implemented