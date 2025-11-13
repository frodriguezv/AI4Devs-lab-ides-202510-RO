# Database Implementation: Candidate Management System

## Overview

This document provides a comprehensive overview of the database implementation for the Applicant Tracking System (ATS). The implementation includes a complete PostgreSQL schema with migrations, seed data, and comprehensive documentation.

## Implementation Summary

### ✅ Completed Deliverables

1. **Complete SQL Schema** - All tables with constraints, indexes, and relationships
2. **Migration Scripts** - Up and down migrations with transaction support
3. **Seed Data** - Sample data for testing (5 candidates with related data)
4. **Schema Documentation** - ERD, design decisions, and technical specifications
5. **Prisma Schema** - Updated to match the database design
6. **Setup Instructions** - Complete guide for database setup

## File Structure

```
database/
├── migrations/
│   ├── 001_create_candidates_schema.up.sql    # Creates all tables and relationships
│   └── 001_create_candidates_schema.down.sql  # Rollback script
├── seeds/
│   └── sample_data.sql                         # Sample data for testing
├── docs/
│   └── schema_documentation.md                 # Complete schema documentation
└── README.md                                    # This file
```

## Database Schema

### Tables Implemented

1. **users** - Recruiter/user information for audit trail
2. **candidates** - Main candidate information and application tracking
3. **education** - Education history (one-to-many with candidates)
4. **work_experience** - Work experience history (one-to-many with candidates)
5. **documents** - Documents associated with candidates (one-to-many)

### Key Features

#### 1. Data Integrity
- ✅ Primary keys on all tables (SERIAL)
- ✅ Foreign key constraints with appropriate CASCADE rules
- ✅ NOT NULL constraints on mandatory fields
- ✅ CHECK constraints for data validation:
  - Email format validation
  - Date logical validation (end_date >= start_date)
  - Application status enum validation
  - Current stage enum validation
  - Document type validation
  - File size validation (> 0)
  - MIME type format validation

#### 2. Indexes
- ✅ Unique index on email fields
- ✅ Composite index on (last_name, first_name) for name searches
- ✅ Indexes on foreign keys
- ✅ Indexes on frequently queried columns (status, stage, dates)
- ✅ Partial indexes (WHERE deleted_at IS NULL) for performance

#### 3. Soft Deletes
- ✅ `deleted_at` timestamp on all tables
- ✅ All indexes are partial to exclude deleted records
- ✅ Supports GDPR compliance and data retention

#### 4. Audit Trail
- ✅ `created_at` and `updated_at` timestamps on all tables
- ✅ `created_by`, `updated_by`, `uploaded_by` user references
- ✅ Automatic `updated_at` trigger function

#### 5. Security
- ✅ Email format validation at database level
- ✅ Soft deletes for data retention
- ✅ User references for audit trail
- ✅ Foreign key constraints prevent orphaned records

## Technical Specifications

### Database Requirements
- **PostgreSQL**: Version 12+ (recommended: 14+)
- **Character Encoding**: UTF-8
- **Timezone**: UTC (TIMESTAMP WITH TIME ZONE)

### Naming Conventions
- **Tables**: snake_case (e.g., `work_experience`)
- **Columns**: snake_case (e.g., `first_name`, `created_at`)
- **Indexes**: `idx_<table>_<column(s)>`
- **Constraints**: `chk_<table>_<constraint_name>`

### Data Types
- **IDs**: SERIAL (auto-incrementing integers)
- **Timestamps**: TIMESTAMP WITH TIME ZONE
- **Dates**: DATE
- **Text**: VARCHAR(255) for bounded fields, TEXT for unbounded
- **File Size**: BIGINT (bytes)

## Setup Instructions

### Prerequisites

1. PostgreSQL 12+ installed and running
2. Database user with CREATE privileges
3. Access to the database specified in `DATABASE_URL`

### Step 1: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE LTIdb;

# Create user (if not exists)
CREATE USER LTIdbUser WITH PASSWORD 'D1ymf8wyQEGthFR1E9xhCq';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE LTIdb TO LTIdbUser;

# Exit psql
\q
```

### Step 2: Run Migrations

#### Option A: Using psql

```bash
# Run up migration
psql -U LTIdbUser -d LTIdb -f database/migrations/001_create_candidates_schema.up.sql

# Verify migration
psql -U LTIdbUser -d LTIdb -c "\dt"

# If needed, rollback
psql -U LTIdbUser -d LTIdb -f database/migrations/001_create_candidates_schema.down.sql
```

#### Option B: Using Docker Compose

```bash
# Start database container
docker-compose up -d db

# Run migration
docker-compose exec db psql -U LTIdbUser -d LTIdb -f /path/to/001_create_candidates_schema.up.sql
```

### Step 3: Load Seed Data (Optional)

```bash
# Load sample data
psql -U LTIdbUser -d LTIdb -f database/seeds/sample_data.sql

# Verify seed data
psql -U LTIdbUser -d LTIdb -c "SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL;"
```

### Step 4: Update Prisma Schema

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# (Optional) Push schema to database (if using Prisma migrations)
npx prisma db push
```

### Step 5: Verify Installation

Run these verification queries:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check record counts
SELECT 
    'users' as table_name, COUNT(*) as count FROM users WHERE deleted_at IS NULL
UNION ALL
SELECT 'candidates', COUNT(*) FROM candidates WHERE deleted_at IS NULL
UNION ALL
SELECT 'education', COUNT(*) FROM education WHERE deleted_at IS NULL
UNION ALL
SELECT 'work_experience', COUNT(*) FROM work_experience WHERE deleted_at IS NULL
UNION ALL
SELECT 'documents', COUNT(*) FROM documents WHERE deleted_at IS NULL;

-- Check relationships
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

## Migration Details

### Up Migration (`001_create_candidates_schema.up.sql`)

**What it does:**
1. Creates `users` table with indexes
2. Creates `candidates` table with constraints and indexes
3. Creates `education` table with foreign key to candidates
4. Creates `work_experience` table with foreign key to candidates
5. Creates `documents` table with foreign keys to candidates and users
6. Creates trigger function for automatic `updated_at` updates
7. Applies triggers to all tables

**Transaction Safety:**
- Wrapped in BEGIN/COMMIT block
- All changes are atomic
- Rollback on any error

### Down Migration (`001_create_candidates_schema.down.sql`)

**What it does:**
1. Drops all triggers
2. Drops trigger function
3. Drops tables in reverse dependency order
4. Uses CASCADE to handle dependencies

**Transaction Safety:**
- Wrapped in BEGIN/COMMIT block
- Complete rollback of schema

## Seed Data Details

### Sample Data Included

1. **4 Users/Recruiters**
   - John Smith (recruiter)
   - Sarah Johnson (senior_recruiter)
   - Michael Chen (recruiter)
   - Emily Davis (admin)

2. **5 Candidates**
   - Alice Williams (reviewing, screening)
   - Bob Martinez (interviewing, interview)
   - Carol Anderson (new, application)
   - David Taylor (offer, offer)
   - Eva Brown (hired, onboarding)

3. **Education Records**
   - 2 records for Alice Williams
   - 1 record for Bob Martinez
   - 2 records for Carol Anderson
   - 1 record for David Taylor
   - 2 records for Eva Brown

4. **Work Experience Records**
   - 2 records for Alice Williams (1 current)
   - 2 records for Bob Martinez (1 current)
   - 2 records for Carol Anderson (1 current)
   - 2 records for David Taylor (1 current)
   - 2 records for Eva Brown (1 current)

5. **Documents**
   - 2 documents for Alice Williams
   - 2 documents for Bob Martinez
   - 1 document for Carol Anderson
   - 3 documents for David Taylor
   - 2 documents for Eva Brown

## Design Decisions

### 1. Primary Keys: SERIAL vs UUID
**Decision**: SERIAL (auto-incrementing integers)
**Rationale**: 
- Simpler and more performant for single-database deployments
- Smaller index size
- Easier to work with in queries
- UUIDs could be added later if distributed system requirements arise

### 2. Soft Deletes
**Decision**: `deleted_at` timestamp on all tables
**Rationale**:
- GDPR compliance (data retention)
- Audit trail preservation
- Recovery capability
- Partial indexes improve query performance

### 3. Timestamps
**Decision**: TIMESTAMP WITH TIME ZONE
**Rationale**:
- Consistent timezone handling
- UTC storage ensures no ambiguity
- Supports global deployments

### 4. Email Validation
**Decision**: CHECK constraint with regex
**Rationale**:
- Database-level validation
- Prevents invalid data entry
- Complements application-level validation

### 5. Foreign Key Cascade Rules
**Decision**: 
- CASCADE DELETE for candidate-related tables
- SET NULL for user references
**Rationale**:
- Candidate data should be removed when candidate is deleted
- User references preserved but set to NULL maintains audit trail

### 6. Partial Indexes
**Decision**: All indexes include `WHERE deleted_at IS NULL`
**Rationale**:
- Smaller index size
- Faster queries (only active records)
- Better performance for common use cases

### 7. Automatic Timestamp Updates
**Decision**: Database trigger function
**Rationale**:
- Ensures consistency without application logic
- Works regardless of ORM or direct SQL access
- Reduces chance of errors

## Constraints Implemented

### Check Constraints

1. **Email Format** (`candidates.email`)
   - Pattern: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`

2. **Application Status** (`candidates.application_status`)
   - Values: 'new', 'reviewing', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn'

3. **Current Stage** (`candidates.current_stage`)
   - Values: 'application', 'screening', 'interview', 'offer', 'onboarding', 'archived'

4. **Date Validation** (`education`, `work_experience`)
   - `end_date IS NULL OR end_date >= start_date`

5. **Document Type** (`documents.document_type`)
   - Values: 'CV', 'resume', 'cover_letter', 'portfolio', 'certificate', 'other'

6. **File Size** (`documents.file_size`)
   - `file_size > 0`

7. **MIME Type Format** (`documents.mime_type`)
   - Pattern: `^[a-z]+/[a-z0-9.+-]+$`

## Indexes Implemented

### users Table
- Primary key on `id`
- Unique index on `email`
- Partial index on `email` (WHERE deleted_at IS NULL)
- Partial index on `role` (WHERE deleted_at IS NULL)

### candidates Table
- Primary key on `id`
- Unique index on `email`
- Partial index on `email` (WHERE deleted_at IS NULL)
- Composite index on `(last_name, first_name)` (WHERE deleted_at IS NULL)
- Partial index on `application_status` (WHERE deleted_at IS NULL)
- Partial index on `current_stage` (WHERE deleted_at IS NULL)
- Partial index on `created_at` (WHERE deleted_at IS NULL)
- Partial index on `created_by` (WHERE deleted_at IS NULL)

### education Table
- Primary key on `id`
- Foreign key index on `candidate_id` (WHERE deleted_at IS NULL)
- Partial index on `institution` (WHERE deleted_at IS NULL)
- Composite index on `(start_date, end_date)` (WHERE deleted_at IS NULL)

### work_experience Table
- Primary key on `id`
- Foreign key index on `candidate_id` (WHERE deleted_at IS NULL)
- Partial index on `company` (WHERE deleted_at IS NULL)
- Composite index on `(start_date, end_date)` (WHERE deleted_at IS NULL)

### documents Table
- Primary key on `id`
- Foreign key index on `candidate_id` (WHERE deleted_at IS NULL)
- Partial index on `document_type` (WHERE deleted_at IS NULL)
- Partial index on `upload_date` (WHERE deleted_at IS NULL)
- Partial index on `uploaded_by` (WHERE deleted_at IS NULL)

## Relationships

### Entity Relationships

1. **users → candidates** (One-to-Many)
   - Via `candidates.created_by` and `candidates.updated_by`
   - SET NULL on user delete

2. **users → documents** (One-to-Many)
   - Via `documents.uploaded_by`
   - SET NULL on user delete

3. **candidates → education** (One-to-Many)
   - Via `education.candidate_id`
   - CASCADE DELETE on candidate delete

4. **candidates → work_experience** (One-to-Many)
   - Via `work_experience.candidate_id`
   - CASCADE DELETE on candidate delete

5. **candidates → documents** (One-to-Many)
   - Via `documents.candidate_id`
   - CASCADE DELETE on candidate delete

## Triggers

### Automatic Timestamp Updates

**Function**: `update_updated_at_column()`
- Automatically updates `updated_at` column on row updates
- Applied to all tables with `updated_at` column:
  - `users`
  - `candidates`
  - `education`
  - `work_experience`
  - `documents`

## Validation Checklist

- [x] All tables have primary keys
- [x] Foreign key relationships are properly defined
- [x] Indexes are created for frequently queried columns
- [x] All mandatory fields have NOT NULL constraints
- [x] Email fields have unique constraints
- [x] Timestamps are included for audit trail
- [x] Migration scripts run without errors
- [x] Down migration successfully reverts all changes
- [x] Sample data inserts successfully
- [x] Soft delete support implemented
- [x] Check constraints for data validation
- [x] Automatic timestamp updates via triggers

## Common Queries

### Find Candidate by Email
```sql
SELECT * FROM candidates 
WHERE email = 'alice.williams@email.com' 
AND deleted_at IS NULL;
```

### Get Candidate with All Related Data
```sql
SELECT 
    c.*,
    json_agg(DISTINCT jsonb_build_object(
        'id', e.id,
        'institution', e.institution,
        'degree', e.degree,
        'field_of_study', e.field_of_study,
        'start_date', e.start_date,
        'end_date', e.end_date
    )) as education,
    json_agg(DISTINCT jsonb_build_object(
        'id', w.id,
        'company', w.company,
        'position', w.position,
        'start_date', w.start_date,
        'end_date', w.end_date
    )) as work_experience,
    json_agg(DISTINCT jsonb_build_object(
        'id', d.id,
        'document_type', d.document_type,
        'file_name', d.file_name,
        'upload_date', d.upload_date
    )) as documents
FROM candidates c
LEFT JOIN education e ON c.id = e.candidate_id AND e.deleted_at IS NULL
LEFT JOIN work_experience w ON c.id = w.candidate_id AND w.deleted_at IS NULL
LEFT JOIN documents d ON c.id = d.candidate_id AND d.deleted_at IS NULL
WHERE c.id = 1 AND c.deleted_at IS NULL
GROUP BY c.id;
```

### Search Candidates by Name
```sql
SELECT * FROM candidates 
WHERE (last_name ILIKE '%williams%' OR first_name ILIKE '%alice%')
AND deleted_at IS NULL
ORDER BY last_name, first_name;
```

### Filter Candidates by Status
```sql
SELECT * FROM candidates 
WHERE application_status = 'reviewing'
AND deleted_at IS NULL
ORDER BY created_at DESC;
```

### Get Candidates with Current Work Experience
```sql
SELECT DISTINCT c.*
FROM candidates c
INNER JOIN work_experience w ON c.id = w.candidate_id
WHERE w.end_date IS NULL
AND c.deleted_at IS NULL
AND w.deleted_at IS NULL;
```

## Troubleshooting

### Migration Fails
- Check PostgreSQL version (must be 12+)
- Verify database user has CREATE privileges
- Check for existing tables that might conflict
- Review error message for specific constraint violations

### Seed Data Fails
- Ensure migration has been run successfully
- Check for duplicate email addresses
- Verify foreign key references exist
- Review constraint violations in error message

### Prisma Schema Sync Issues
- Run `npx prisma generate` after schema changes
- Use `npx prisma db push` to sync schema (development only)
- For production, use Prisma migrations instead

### Performance Issues
- Verify indexes are created: `\d+ table_name` in psql
- Check query execution plans: `EXPLAIN ANALYZE`
- Ensure partial indexes are being used
- Consider additional indexes for specific query patterns

## Future Enhancements

### Potential Additions
1. **Interviews Table** - Track interview schedules and feedback
2. **Notes Table** - Recruiter notes and comments
3. **Skills Table** - Candidate skills with proficiency levels
4. **Applications Table** - Track applications to specific job postings
5. **Tags Table** - Flexible tagging system for candidates
6. **Activity Log Table** - Detailed audit log of all actions

### Performance Optimizations
1. **Partitioning** - For very large datasets (millions of records)
2. **Materialized Views** - For complex reporting queries
3. **Full-Text Search** - For advanced search capabilities
4. **Read Replicas** - For scaling read operations

### Compliance Enhancements
1. **Consent Tracking** - Fields for GDPR consent management
2. **Data Retention Policies** - Automated cleanup jobs
3. **Encryption** - Field-level encryption for sensitive data
4. **Access Logging** - Track who accessed which records

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-constraints.html)

## Support

For issues or questions:
1. Review the schema documentation in `database/docs/schema_documentation.md`
2. Check migration files for constraint definitions
3. Verify database connection and permissions
4. Review PostgreSQL logs for detailed error messages

---

**Implementation Date**: 2025-01-27
**PostgreSQL Version**: 12+
**Status**: ✅ Complete and Tested

