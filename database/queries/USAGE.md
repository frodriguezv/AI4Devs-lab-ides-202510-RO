# Quick Start Guide - Candidate Validation Queries

## Quick Validation (Recommended)

### Option 1: Quick Summary (Fastest)
```bash
cd /Users/freddyrodriguez/Documents/GitHub/AI4Devs-lab-ides-202510-RO
export DOCKER_HOST=tcp://10.211.55.2:2375

docker exec ai4devs-lab-ides-202510-ro-db-1 psql -U LTIdbUser -d LTIdb -c "
SELECT 
    c.id,
    c.first_name || ' ' || c.last_name AS name,
    c.email,
    c.phone,
    COUNT(DISTINCT e.id) AS education_count,
    COUNT(DISTINCT w.id) AS work_exp_count,
    COUNT(DISTINCT d.id) AS document_count,
    c.created_at
FROM candidates c
LEFT JOIN education e ON e.candidate_id = c.id AND e.deleted_at IS NULL
LEFT JOIN work_experience w ON w.candidate_id = c.id AND w.deleted_at IS NULL
LEFT JOIN documents d ON d.candidate_id = c.id AND d.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.created_at
ORDER BY c.created_at DESC
LIMIT 1;
"
```

### Option 2: Full JSON Validation
```bash
cd /Users/freddyrodriguez/Documents/GitHub/AI4Devs-lab-ides-202510-RO
export DOCKER_HOST=tcp://10.211.55.2:2375

docker exec ai4devs-lab-ides-202510-ro-db-1 psql -U LTIdbUser -d LTIdb -f - < database/queries/quick_validate.sql
```

### Option 3: Using the Script
```bash
cd /Users/freddyrodriguez/Documents/GitHub/AI4Devs-lab-ides-202510-RO
export DOCKER_HOST=tcp://10.211.55.2:2375

./database/queries/run_validation.sh summary
```

## Available Queries

### 1. Basic Candidate Info
Get the latest candidate's basic information:
```sql
SELECT id, first_name, last_name, email, phone, created_at
FROM candidates
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1;
```

### 2. Education History
Get all education entries for the latest candidate:
```sql
SELECT e.*
FROM education e
INNER JOIN candidates c ON e.candidate_id = c.id
WHERE c.deleted_at IS NULL 
  AND e.deleted_at IS NULL
  AND c.id = (SELECT id FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1)
ORDER BY e.start_date DESC;
```

### 3. Work Experience
Get all work experience entries:
```sql
SELECT w.*
FROM work_experience w
INNER JOIN candidates c ON w.candidate_id = c.id
WHERE c.deleted_at IS NULL 
  AND w.deleted_at IS NULL
  AND c.id = (SELECT id FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1)
ORDER BY w.start_date DESC;
```

### 4. Documents
Get all uploaded documents:
```sql
SELECT d.*
FROM documents d
INNER JOIN candidates c ON d.candidate_id = c.id
WHERE c.deleted_at IS NULL 
  AND d.deleted_at IS NULL
  AND c.id = (SELECT id FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1)
ORDER BY d.upload_date DESC;
```

### 5. Complete Validation (JSON)
Get everything in one JSON object:
```bash
docker exec ai4devs-lab-ides-202510-ro-db-1 psql -U LTIdbUser -d LTIdb -f - < database/queries/quick_validate.sql
```

## Example Output

When you run the quick summary, you'll see something like:
```
 id |       name       |        email        |         created_at         | education_count | work_exp_count 
----+------------------+---------------------+----------------------------+-----------------+----------------
  1 | Freddy Rodriguez | frodriguez@test.com | 2025-11-13 04:51:54.368+00 |               1 |              1
```

## Validation Checklist

After uploading a candidate, verify:
- ✅ Candidate basic info is saved (name, email, phone)
- ✅ Education entries are linked correctly
- ✅ Work experience entries are linked correctly
- ✅ Documents are uploaded (if any)
- ✅ All dates are valid (end_date >= start_date)
- ✅ Email format is valid
- ✅ No soft-deleted records are showing

## Troubleshooting

### If queries return no results:
1. Check if any candidates exist: `SELECT COUNT(*) FROM candidates WHERE deleted_at IS NULL;`
2. Verify database connection: `docker ps | grep postgres`
3. Check DATABASE_URL in backend/.env

### If you see connection errors:
1. Ensure Docker is running: `export DOCKER_HOST=tcp://10.211.55.2:2375`
2. Verify container is running: `docker ps`
3. Test connection: `docker exec ai4devs-lab-ides-202510-ro-db-1 psql -U LTIdbUser -d LTIdb -c "SELECT 1;"`

