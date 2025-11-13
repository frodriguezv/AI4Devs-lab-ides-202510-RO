# Database Validation Queries

This directory contains SQL queries for validating and inspecting candidate data.

## validate_latest_candidate.sql

A comprehensive set of queries to validate the most recently uploaded candidate. Includes:

### Query Types:

1. **Basic Info** - Get the latest candidate's basic information
2. **Full Details** - Complete candidate info with counts of related records
3. **Education History** - All education entries for the latest candidate
4. **Work Experience** - All work experience entries for the latest candidate
5. **Documents** - All documents uploaded for the latest candidate
6. **Validation Summary** - Comprehensive validation report
7. **Data Integrity Checks** - Validate required fields, email format, and date consistency
8. **Quick Validation** - Single JSON query to get everything at once

## Usage

### Using psql (if installed locally):

```bash
# Connect to database
PGPASSWORD='D1ymf8wyQEGthFR1E9xhCq' psql -h 10.211.55.2 -p 5432 -U LTIdbUser -d LTIdb

# Run specific query (copy and paste from the file)
# Or run entire file
\i database/queries/validate_latest_candidate.sql
```

### Using Docker:

```bash
# Copy query file to container and execute
docker cp database/queries/validate_latest_candidate.sql ai4devs-lab-ides-202510-ro-db-1:/tmp/
docker exec ai4devs-lab-ides-202510-ro-db-1 psql -U LTIdbUser -d LTIdb -f /tmp/validate_latest_candidate.sql
```

### Using Prisma Studio:

1. Start Prisma Studio: `cd backend && npx prisma studio`
2. Navigate to the `candidates` table
3. View the latest candidate and related data

### Quick Validation Script:

```bash
# Run the quick validation query (query #8)
cd backend
export DOCKER_HOST=tcp://10.211.55.2:2375
docker exec ai4devs-lab-ides-202510-ro-db-1 psql -U LTIdbUser -d LTIdb -c "
SELECT json_build_object(
    'candidate', json_build_object(
        'id', c.id,
        'firstName', c.first_name,
        'lastName', c.last_name,
        'email', c.email,
        'phone', c.phone
    ),
    'educationCount', COUNT(DISTINCT e.id),
    'workExperienceCount', COUNT(DISTINCT w.id),
    'documentCount', COUNT(DISTINCT d.id)
) AS summary
FROM candidates c
LEFT JOIN education e ON e.candidate_id = c.id AND e.deleted_at IS NULL
LEFT JOIN work_experience w ON w.candidate_id = c.id AND w.deleted_at IS NULL
LEFT JOIN documents d ON d.candidate_id = c.id AND d.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 1;
"
```

## Query Examples

### Get Latest Candidate Basic Info:
```sql
SELECT id, first_name, last_name, email, phone, created_at
FROM candidates
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1;
```

### Count Related Records:
```sql
SELECT 
    c.first_name || ' ' || c.last_name AS name,
    COUNT(DISTINCT e.id) AS education_count,
    COUNT(DISTINCT w.id) AS work_experience_count,
    COUNT(DISTINCT d.id) AS document_count
FROM candidates c
LEFT JOIN education e ON e.candidate_id = c.id AND e.deleted_at IS NULL
LEFT JOIN work_experience w ON w.candidate_id = c.id AND w.deleted_at IS NULL
LEFT JOIN documents d ON d.candidate_id = c.id AND d.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.first_name, c.last_name
ORDER BY c.created_at DESC
LIMIT 1;
```

## Notes

- All queries filter out soft-deleted records (`deleted_at IS NULL`)
- Queries are ordered by `created_at DESC` to get the latest candidate
- The JSON query (#8) is useful for API responses or quick validation

