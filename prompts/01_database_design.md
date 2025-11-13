# Database Design Prompt: Candidate Management System

## Context
We are building an Applicant Tracking System (ATS) from scratch. This is the first technical task: designing and implementing the database schema for managing candidates.

## Objective
Design and implement a complete PostgreSQL database schema to support the "Add Candidate to System" user story.

## Requirements

### 1. Data Model Design
Create a comprehensive database schema that includes:

#### Candidates Table
- Basic information: first name, last name, email, phone, address
- Timestamps: created_at, updated_at
- Status tracking: application status, current stage
- Unique constraints on email

#### Education Table
- Relationship with candidates (one-to-many)
- Fields: institution, degree, field of study, start date, end date, description
- Support for multiple education entries per candidate

#### Work Experience Table
- Relationship with candidates (one-to-many)
- Fields: company, position, start date, end date, description, responsibilities
- Support for multiple work experiences per candidate

#### Documents Table
- Relationship with candidates (one-to-many)
- Fields: document type (CV, cover letter, etc.), file name, file path/URL, mime type, file size
- Metadata: upload date, uploaded by (recruiter reference)

#### Users/Recruiters Table (if needed)
- Basic recruiter information for audit trail
- Fields: name, email, role

### 2. Database Features Required

#### Indexes
- Define appropriate indexes for:
  - Email lookups (unique index)
  - Name searches
  - Date range queries
  - Foreign key relationships

#### Constraints
- Primary keys for all tables
- Foreign key constraints with appropriate CASCADE rules
- NOT NULL constraints for mandatory fields
- CHECK constraints for data validation (e.g., end_date > start_date)
- Email format validation (if supported by PostgreSQL)

#### Data Validation
- Email format validation
- Phone number format considerations
- Date logical validation
- File type validation for documents

### 3. Security Considerations
- No sensitive data should be stored in plain text
- Consider data encryption requirements
- Audit trail fields (created_by, updated_by, created_at, updated_at)
- Soft delete support (deleted_at timestamp) for data retention compliance

### 4. Deliverables

Please provide:

1. **Complete SQL Schema File**
   - CREATE TABLE statements for all tables
   - All constraints, indexes, and relationships
   - Comments explaining design decisions

2. **Migration Scripts**
   - Up migration: create all tables and relationships
   - Down migration: rollback script to drop all tables
   - Use transaction blocks for atomicity

3. **Seed Data (Optional but Recommended)**
   - Sample data for testing
   - At least 3-5 candidate examples with related education and experience
   - Sample recruiter/user data

4. **Database Diagram or Documentation**
   - Entity-Relationship Diagram (ERD) in text/ASCII format or description
   - Explanation of relationships and cardinalities
   - Data type justifications

5. **Setup Instructions**
   - PostgreSQL version requirements
   - Commands to create database
   - Commands to run migrations
   - Verification queries to check setup

## Technical Specifications

- **Database**: PostgreSQL (specify minimum version, recommend 12+)
- **Naming Convention**: snake_case for tables and columns
- **Primary Keys**: Use SERIAL or UUID (specify preference)
- **Timestamps**: Use TIMESTAMP WITH TIME ZONE
- **Text Fields**: Use appropriate types (VARCHAR with limits vs TEXT)

## Validation Checklist

Before submitting, ensure:
- [ ] All tables have primary keys
- [ ] Foreign key relationships are properly defined
- [ ] Indexes are created for frequently queried columns
- [ ] All mandatory fields have NOT NULL constraints
- [ ] Email fields have unique constraints
- [ ] Timestamps are included for audit trail
- [ ] Migration scripts run without errors
- [ ] Down migration successfully reverts all changes
- [ ] Sample data inserts successfully

## Expected File Structure

```
database/
├── migrations/
│   ├── 001_create_candidates_schema.up.sql
│   └── 001_create_candidates_schema.down.sql
├── seeds/
│   └── sample_data.sql
└── docs/
    └── schema_documentation.md
```

## Additional Considerations

1. **Scalability**: Design should support future growth (thousands of candidates)
2. **Performance**: Consider query patterns for recruiter dashboard views
3. **Extensibility**: Schema should allow easy addition of new fields/tables
4. **Compliance**: Consider GDPR/data privacy requirements for candidate data

## Success Criteria

The database design is complete when:
- All tables are created successfully in PostgreSQL
- Sample data can be inserted without errors
- Basic queries (SELECT, INSERT, UPDATE) work as expected
- Foreign key relationships enforce data integrity
- Schema supports all acceptance criteria from the user story
- Provide the database design implementation readme file with every single thing you implemented