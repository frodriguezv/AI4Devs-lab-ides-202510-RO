# Database Schema Documentation: Candidate Management System

## Overview

This document describes the database schema for the Applicant Tracking System (ATS). The schema is designed to support comprehensive candidate management, including personal information, education history, work experience, and document storage.

## Database Version

- **PostgreSQL**: 12+ (recommended: 14+)
- **Character Encoding**: UTF-8
- **Timezone**: UTC (stored as TIMESTAMP WITH TIME ZONE)

## Entity-Relationship Diagram (ERD)

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ role            │
│ created_at      │
│ updated_at      │
│ deleted_at      │
└────────┬────────┘
         │
         │ 1
         │
         │ *
┌────────▼────────┐
│   candidates    │
├─────────────────┤
│ id (PK)         │
│ first_name      │
│ last_name       │
│ email (UNIQUE)  │
│ phone           │
│ address         │
│ application_    │
│   status        │
│ current_stage   │
│ created_at      │
│ updated_at      │
│ deleted_at      │
│ created_by (FK) │──┐
│ updated_by (FK) │──┘
└─────┬───────────┘
      │
      │ 1
      │
      ├──────────────┬──────────────┬──────────────┐
      │ *            │ *            │ *            │ *
      │              │              │              │
┌─────▼──────┐ ┌────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
│ education  │ │work_exp.  │ │ documents  │
├────────────┤ ├───────────┤ ├────────────┤
│ id (PK)    │ │ id (PK)   │ │ id (PK)    │
│ candidate_ │ │ candidate_│ │ candidate_ │
│   id (FK)  │ │   id (FK) │ │   id (FK)  │
│ institution│ │ company   │ │ document_  │
│ degree     │ │ position  │ │   type     │
│ field_of_  │ │ start_    │ │ file_name  │
│   study    │ │   date    │ │ file_path  │
│ start_date │ │ end_date  │ │ file_url   │
│ end_date   │ │ descrip.  │ │ mime_type  │
│ description│ │ responsi- │ │ file_size  │
│ created_at │ │   bilities│ │ upload_    │
│ updated_at │ │ created_  │ │   date     │
│ deleted_at │ │   at      │ │ uploaded_  │
│            │ │ updated_  │ │   by (FK)  │
│            │ │   at      │ │ created_   │
│            │ │ deleted_  │ │   at       │
│            │ │   at      │ │ updated_   │
│            │ │           │ │   at       │
│            │ │           │ │ deleted_   │
│            │ │           │ │   at       │
└────────────┘ └───────────┘ └────────────┘
```

## Table Descriptions

### 1. users

Stores recruiter and system user information for audit trail purposes.

**Columns:**
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `name` (VARCHAR(255) NOT NULL): Full name of the user
- `email` (VARCHAR(255) NOT NULL UNIQUE): Email address (unique)
- `role` (VARCHAR(50) NOT NULL DEFAULT 'recruiter'): User role (recruiter, admin, manager, etc.)
- `created_at` (TIMESTAMP WITH TIME ZONE): Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE): Last update timestamp
- `deleted_at` (TIMESTAMP WITH TIME ZONE NULL): Soft delete timestamp

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Partial index on `email` where `deleted_at IS NULL`
- Partial index on `role` where `deleted_at IS NULL`

**Relationships:**
- One-to-many with `candidates` (via `created_by`, `updated_by`)
- One-to-many with `documents` (via `uploaded_by`)

### 2. candidates

Main table storing candidate information and application tracking.

**Columns:**
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `first_name` (VARCHAR(255) NOT NULL): Candidate's first name
- `last_name` (VARCHAR(255) NOT NULL): Candidate's last name
- `email` (VARCHAR(255) NOT NULL UNIQUE): Email address (unique, validated)
- `phone` (VARCHAR(50)): Phone number (optional)
- `address` (TEXT): Physical address (optional)
- `application_status` (VARCHAR(50) NOT NULL DEFAULT 'new'): Overall application status
  - Valid values: 'new', 'reviewing', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn'
- `current_stage` (VARCHAR(50) NOT NULL DEFAULT 'application'): Current stage in hiring process
  - Valid values: 'application', 'screening', 'interview', 'offer', 'onboarding', 'archived'
- `created_at` (TIMESTAMP WITH TIME ZONE): Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE): Last update timestamp
- `deleted_at` (TIMESTAMP WITH TIME ZONE NULL): Soft delete timestamp
- `created_by` (INTEGER FK): Reference to `users.id` (who created the record)
- `updated_by` (INTEGER FK): Reference to `users.id` (who last updated the record)

**Constraints:**
- Email format validation using regex pattern
- Application status check constraint
- Current stage check constraint

**Indexes:**
- Primary key on `id`
- Unique index on `email`
- Partial index on `email` where `deleted_at IS NULL`
- Composite index on `(last_name, first_name)` for name searches
- Partial index on `application_status` where `deleted_at IS NULL`
- Partial index on `current_stage` where `deleted_at IS NULL`
- Partial index on `created_at` for date range queries
- Partial index on `created_by` for filtering by recruiter

**Relationships:**
- Many-to-one with `users` (via `created_by`, `updated_by`)
- One-to-many with `education`
- One-to-many with `work_experience`
- One-to-many with `documents`

### 3. education

Stores education history for candidates. Supports multiple education entries per candidate.

**Columns:**
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `candidate_id` (INTEGER NOT NULL FK): Reference to `candidates.id` (CASCADE DELETE)
- `institution` (VARCHAR(255) NOT NULL): Name of educational institution
- `degree` (VARCHAR(255) NOT NULL): Degree obtained (e.g., "Bachelor of Science")
- `field_of_study` (VARCHAR(255)): Major, specialization, or field of study
- `start_date` (DATE NOT NULL): Education start date
- `end_date` (DATE): Education end date (NULL indicates ongoing)
- `description` (TEXT): Additional details about the education
- `created_at` (TIMESTAMP WITH TIME ZONE): Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE): Last update timestamp
- `deleted_at` (TIMESTAMP WITH TIME ZONE NULL): Soft delete timestamp

**Constraints:**
- Check constraint: `end_date IS NULL OR end_date >= start_date`

**Indexes:**
- Primary key on `id`
- Foreign key index on `candidate_id` (partial, excludes deleted)
- Index on `institution` for searches
- Composite index on `(start_date, end_date)` for date range queries

**Relationships:**
- Many-to-one with `candidates` (CASCADE DELETE)

### 4. work_experience

Stores work experience history for candidates. Supports multiple work experiences per candidate.

**Columns:**
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `candidate_id` (INTEGER NOT NULL FK): Reference to `candidates.id` (CASCADE DELETE)
- `company` (VARCHAR(255) NOT NULL): Company name
- `position` (VARCHAR(255) NOT NULL): Job title/position
- `start_date` (DATE NOT NULL): Employment start date
- `end_date` (DATE): Employment end date (NULL indicates current position)
- `description` (TEXT): Job description
- `responsibilities` (TEXT): Detailed list of responsibilities and achievements
- `created_at` (TIMESTAMP WITH TIME ZONE): Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE): Last update timestamp
- `deleted_at` (TIMESTAMP WITH TIME ZONE NULL): Soft delete timestamp

**Constraints:**
- Check constraint: `end_date IS NULL OR end_date >= start_date`

**Indexes:**
- Primary key on `id`
- Foreign key index on `candidate_id` (partial, excludes deleted)
- Index on `company` for searches
- Composite index on `(start_date, end_date)` for date range queries

**Relationships:**
- Many-to-one with `candidates` (CASCADE DELETE)

### 5. documents

Stores documents associated with candidates (CVs, cover letters, portfolios, certificates, etc.).

**Columns:**
- `id` (SERIAL PRIMARY KEY): Unique identifier
- `candidate_id` (INTEGER NOT NULL FK): Reference to `candidates.id` (CASCADE DELETE)
- `document_type` (VARCHAR(50) NOT NULL): Type of document
  - Valid values: 'CV', 'resume', 'cover_letter', 'portfolio', 'certificate', 'other'
- `file_name` (VARCHAR(255) NOT NULL): Original file name
- `file_path` (TEXT NOT NULL): Server-side file path or storage location
- `file_url` (TEXT): Public URL for accessing the document (optional)
- `mime_type` (VARCHAR(100) NOT NULL): MIME type of the file (validated)
- `file_size` (BIGINT NOT NULL): File size in bytes (must be > 0)
- `upload_date` (TIMESTAMP WITH TIME ZONE): When the document was uploaded
- `uploaded_by` (INTEGER FK): Reference to `users.id` (who uploaded the document)
- `created_at` (TIMESTAMP WITH TIME ZONE): Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE): Last update timestamp
- `deleted_at` (TIMESTAMP WITH TIME ZONE NULL): Soft delete timestamp

**Constraints:**
- Document type check constraint
- File size check constraint (must be > 0)
- MIME type format validation using regex

**Indexes:**
- Primary key on `id`
- Foreign key index on `candidate_id` (partial, excludes deleted)
- Partial index on `document_type` where `deleted_at IS NULL`
- Partial index on `upload_date` for date range queries
- Partial index on `uploaded_by` for filtering by user

**Relationships:**
- Many-to-one with `candidates` (CASCADE DELETE)
- Many-to-one with `users` (via `uploaded_by`)

## Design Decisions

### 1. Primary Keys
- **Choice**: SERIAL (auto-incrementing integers)
- **Rationale**: Simple, efficient, and sufficient for this use case. UUIDs could be used for distributed systems, but SERIAL is more performant for single-database deployments.

### 2. Soft Deletes
- **Implementation**: `deleted_at` timestamp column on all tables
- **Rationale**: 
  - GDPR compliance: allows data retention while marking records as deleted
  - Audit trail: preserves historical data
  - Recovery: enables undelete functionality
  - All indexes are partial (WHERE deleted_at IS NULL) for performance

### 3. Timestamps
- **Type**: TIMESTAMP WITH TIME ZONE
- **Rationale**: Ensures consistent timezone handling across different server locations and client timezones. All times stored in UTC.

### 4. Email Validation
- **Implementation**: CHECK constraint with regex pattern
- **Pattern**: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- **Rationale**: Basic format validation at database level. Additional validation should be performed at application level.

### 5. Text Fields
- **VARCHAR vs TEXT**: 
  - VARCHAR(255) for names, emails, and other bounded fields
  - TEXT for addresses, descriptions, and other potentially long content
- **Rationale**: VARCHAR with limits for fields with known maximum lengths, TEXT for unbounded content.

### 6. Foreign Key Cascade Rules
- **CASCADE DELETE**: Used for `education`, `work_experience`, and `documents` when candidate is deleted
- **SET NULL**: Used for `created_by`, `updated_by`, `uploaded_by` when user is deleted
- **Rationale**: 
  - Candidate-related data should be removed when candidate is deleted
  - User references should be preserved but set to NULL to maintain audit trail integrity

### 7. Partial Indexes
- **Implementation**: All indexes include `WHERE deleted_at IS NULL`
- **Rationale**: 
  - Smaller index size (excludes deleted records)
  - Faster queries (only active records indexed)
  - Better performance for common queries that filter out deleted records

### 8. Automatic Timestamp Updates
- **Implementation**: Trigger function `update_updated_at_column()` on all tables
- **Rationale**: Ensures `updated_at` is always current without application-level logic.

### 9. Status and Stage Enums
- **Implementation**: VARCHAR with CHECK constraints
- **Rationale**: More flexible than PostgreSQL ENUMs, easier to modify without migrations, and allows for future extensibility.

## Data Validation

### Email Format
- Regex pattern: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- Enforced at database level via CHECK constraint

### Phone Numbers
- Stored as VARCHAR(50) to accommodate international formats
- Format validation should be handled at application level

### Date Validation
- `end_date >= start_date` for both education and work_experience
- Enforced via CHECK constraints

### File Validation
- `file_size > 0` enforced via CHECK constraint
- MIME type format validated via regex: `^[a-z]+/[a-z0-9.+-]+$`
- Document type restricted to predefined values

## Security Considerations

### 1. Data Encryption
- **At Rest**: Should be configured at PostgreSQL level (TDE) or filesystem level
- **In Transit**: Use SSL/TLS connections (configured in connection string)

### 2. Audit Trail
- All tables include `created_at`, `updated_at` timestamps
- User references (`created_by`, `updated_by`, `uploaded_by`) track who performed actions
- Soft deletes preserve historical data

### 3. Access Control
- Implement row-level security (RLS) policies in PostgreSQL if needed
- Application-level authorization should control access to candidate data

### 4. Sensitive Data
- No passwords or authentication tokens stored in this schema
- Consider encrypting sensitive fields (address, phone) if required by compliance

## Performance Considerations

### Index Strategy
- All foreign keys are indexed
- Frequently queried columns (email, name, status, dates) are indexed
- Partial indexes exclude deleted records for better performance

### Query Patterns
- Common queries:
  - Find candidate by email (indexed)
  - Search candidates by name (composite index)
  - Filter by status/stage (indexed)
  - Get candidate with all related data (foreign key indexes)
  - Date range queries (composite indexes on dates)

### Scalability
- Schema supports thousands of candidates
- Indexes optimized for common query patterns
- Consider partitioning for very large datasets (millions of records)

## Migration Strategy

### Up Migration
1. Creates all tables in dependency order
2. Creates indexes
3. Creates triggers for automatic timestamp updates
4. Uses transaction block for atomicity

### Down Migration
1. Drops triggers first
2. Drops tables in reverse dependency order
3. Uses transaction block for atomicity

## Future Extensibility

The schema is designed to be easily extensible:

1. **New Fields**: Add columns to existing tables without breaking changes
2. **New Tables**: Add related tables (e.g., interviews, notes, skills) with foreign keys to candidates
3. **New Status Values**: Modify CHECK constraints to add new status/stage values
4. **New Document Types**: Add to document_type CHECK constraint

## Compliance Notes

### GDPR Considerations
- Soft deletes allow data retention while marking as deleted
- Consider implementing data retention policies
- May need to add fields for consent tracking
- Consider encryption for personal data fields

### Data Retention
- `deleted_at` timestamps enable data retention policies
- Can implement automated cleanup jobs based on retention periods

## Verification Queries

After running migrations and seed data, use these queries to verify:

```sql
-- Count records
SELECT 'users' as table_name, COUNT(*) as count FROM users WHERE deleted_at IS NULL
UNION ALL
SELECT 'candidates', COUNT(*) FROM candidates WHERE deleted_at IS NULL
UNION ALL
SELECT 'education', COUNT(*) FROM education WHERE deleted_at IS NULL
UNION ALL
SELECT 'work_experience', COUNT(*) FROM work_experience WHERE deleted_at IS NULL
UNION ALL
SELECT 'documents', COUNT(*) FROM documents WHERE deleted_at IS NULL;

-- Verify relationships
SELECT 
    c.first_name || ' ' || c.last_name as candidate_name,
    COUNT(DISTINCT e.id) as education_count,
    COUNT(DISTINCT w.id) as work_experience_count,
    COUNT(DISTINCT d.id) as document_count
FROM candidates c
LEFT JOIN education e ON c.id = e.candidate_id AND e.deleted_at IS NULL
LEFT JOIN work_experience w ON c.id = w.candidate_id AND w.deleted_at IS NULL
LEFT JOIN documents d ON c.id = d.candidate_id AND d.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.first_name, c.last_name
ORDER BY c.id;
```

