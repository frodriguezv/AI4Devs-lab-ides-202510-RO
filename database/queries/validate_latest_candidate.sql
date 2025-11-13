-- ============================================================================
-- VALIDATION QUERIES FOR LATEST UPLOADED CANDIDATE
-- ============================================================================
-- These queries help validate that a candidate was saved correctly
-- with all related data (education, work experience, documents)

-- ============================================================================
-- 1. GET LATEST CANDIDATE (BASIC INFO)
-- ============================================================================
-- Shows the most recently created candidate
SELECT 
    id,
    first_name,
    last_name,
    email,
    phone,
    address,
    application_status,
    current_stage,
    created_at,
    updated_at,
    deleted_at
FROM candidates
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1;

-- ============================================================================
-- 2. LATEST CANDIDATE WITH FULL DETAILS
-- ============================================================================
-- Complete information about the latest candidate
SELECT 
    c.id,
    c.first_name || ' ' || c.last_name AS full_name,
    c.email,
    c.phone,
    c.address,
    c.application_status,
    c.current_stage,
    c.created_at,
    c.updated_at,
    COUNT(DISTINCT e.id) AS education_count,
    COUNT(DISTINCT w.id) AS work_experience_count,
    COUNT(DISTINCT d.id) AS document_count
FROM candidates c
LEFT JOIN education e ON e.candidate_id = c.id AND e.deleted_at IS NULL
LEFT JOIN work_experience w ON w.candidate_id = c.id AND w.deleted_at IS NULL
LEFT JOIN documents d ON d.candidate_id = c.id AND d.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.address, 
         c.application_status, c.current_stage, c.created_at, c.updated_at
ORDER BY c.created_at DESC
LIMIT 1;

-- ============================================================================
-- 3. LATEST CANDIDATE'S EDUCATION HISTORY
-- ============================================================================
-- All education entries for the latest candidate
SELECT 
    e.id,
    e.institution,
    e.degree,
    e.field_of_study,
    e.start_date,
    e.end_date,
    e.description,
    e.created_at
FROM education e
INNER JOIN candidates c ON e.candidate_id = c.id
WHERE c.deleted_at IS NULL 
  AND e.deleted_at IS NULL
  AND c.id = (
      SELECT id FROM candidates 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 1
  )
ORDER BY e.start_date DESC;

-- ============================================================================
-- 4. LATEST CANDIDATE'S WORK EXPERIENCE
-- ============================================================================
-- All work experience entries for the latest candidate
SELECT 
    w.id,
    w.company,
    w.position,
    w.start_date,
    w.end_date,
    w.description,
    w.responsibilities,
    w.created_at
FROM work_experience w
INNER JOIN candidates c ON w.candidate_id = c.id
WHERE c.deleted_at IS NULL 
  AND w.deleted_at IS NULL
  AND c.id = (
      SELECT id FROM candidates 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 1
  )
ORDER BY w.start_date DESC;

-- ============================================================================
-- 5. LATEST CANDIDATE'S DOCUMENTS
-- ============================================================================
-- All documents uploaded for the latest candidate
SELECT 
    d.id,
    d.document_type,
    d.file_name,
    d.file_size,
    d.mime_type,
    d.upload_date,
    d.file_path
FROM documents d
INNER JOIN candidates c ON d.candidate_id = c.id
WHERE c.deleted_at IS NULL 
  AND d.deleted_at IS NULL
  AND c.id = (
      SELECT id FROM candidates 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 1
  )
ORDER BY d.upload_date DESC;

-- ============================================================================
-- 6. COMPLETE VALIDATION SUMMARY
-- ============================================================================
-- Comprehensive validation report for the latest candidate
WITH latest_candidate AS (
    SELECT id, first_name, last_name, email, created_at
    FROM candidates
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
)
SELECT 
    'Candidate Info' AS section,
    lc.id::text AS field,
    lc.first_name || ' ' || lc.last_name AS value,
    lc.created_at::text AS timestamp
FROM latest_candidate lc
UNION ALL
SELECT 
    'Email' AS section,
    'email' AS field,
    lc.email AS value,
    lc.created_at::text AS timestamp
FROM latest_candidate lc
UNION ALL
SELECT 
    'Education Entries' AS section,
    COUNT(*)::text AS field,
    'Total education records' AS value,
    MAX(e.created_at)::text AS timestamp
FROM latest_candidate lc
LEFT JOIN education e ON e.candidate_id = lc.id AND e.deleted_at IS NULL
GROUP BY lc.id
UNION ALL
SELECT 
    'Work Experience Entries' AS section,
    COUNT(*)::text AS field,
    'Total work experience records' AS value,
    MAX(w.created_at)::text AS timestamp
FROM latest_candidate lc
LEFT JOIN work_experience w ON w.candidate_id = lc.id AND w.deleted_at IS NULL
GROUP BY lc.id
UNION ALL
SELECT 
    'Documents' AS section,
    COUNT(*)::text AS field,
    'Total documents uploaded' AS value,
    MAX(d.upload_date)::text AS timestamp
FROM latest_candidate lc
LEFT JOIN documents d ON d.candidate_id = lc.id AND d.deleted_at IS NULL
GROUP BY lc.id;

-- ============================================================================
-- 7. DATA INTEGRITY CHECKS
-- ============================================================================
-- Validate data integrity for the latest candidate

-- Check for required fields
SELECT 
    'Required Fields Check' AS check_type,
    CASE 
        WHEN first_name IS NULL OR first_name = '' THEN 'FAIL: first_name is missing'
        WHEN last_name IS NULL OR last_name = '' THEN 'FAIL: last_name is missing'
        WHEN email IS NULL OR email = '' THEN 'FAIL: email is missing'
        WHEN phone IS NULL OR phone = '' THEN 'FAIL: phone is missing'
        ELSE 'PASS: All required fields present'
    END AS result
FROM candidates
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1;

-- Check email format
SELECT 
    'Email Format Check' AS check_type,
    CASE 
        WHEN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' 
        THEN 'PASS: Valid email format'
        ELSE 'FAIL: Invalid email format'
    END AS result
FROM candidates
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1;

-- Check education date consistency
SELECT 
    'Education Dates Check' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: No education entries to validate'
        WHEN COUNT(*) = SUM(CASE WHEN end_date IS NULL OR end_date >= start_date THEN 1 ELSE 0 END)
        THEN 'PASS: All education dates are valid'
        ELSE 'FAIL: Some education entries have invalid date ranges'
    END AS result
FROM education e
INNER JOIN candidates c ON e.candidate_id = c.id
WHERE c.deleted_at IS NULL 
  AND e.deleted_at IS NULL
  AND c.id = (SELECT id FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1);

-- Check work experience date consistency
SELECT 
    'Work Experience Dates Check' AS check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'PASS: No work experience entries to validate'
        WHEN COUNT(*) = SUM(CASE WHEN end_date IS NULL OR end_date >= start_date THEN 1 ELSE 0 END)
        THEN 'PASS: All work experience dates are valid'
        ELSE 'FAIL: Some work experience entries have invalid date ranges'
    END AS result
FROM work_experience w
INNER JOIN candidates c ON w.candidate_id = c.id
WHERE c.deleted_at IS NULL 
  AND w.deleted_at IS NULL
  AND c.id = (SELECT id FROM candidates WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 1);

-- ============================================================================
-- 8. QUICK VALIDATION (ALL IN ONE)
-- ============================================================================
-- Single query to get everything about the latest candidate
SELECT 
    json_build_object(
        'candidate', json_build_object(
            'id', c.id,
            'firstName', c.first_name,
            'lastName', c.last_name,
            'fullName', c.first_name || ' ' || c.last_name,
            'email', c.email,
            'phone', c.phone,
            'address', c.address,
            'applicationStatus', c.application_status,
            'currentStage', c.current_stage,
            'createdAt', c.created_at,
            'updatedAt', c.updated_at
        ),
        'education', COALESCE(
            json_agg(
                json_build_object(
                    'id', e.id,
                    'institution', e.institution,
                    'degree', e.degree,
                    'fieldOfStudy', e.field_of_study,
                    'startDate', e.start_date,
                    'endDate', e.end_date,
                    'description', e.description
                ) ORDER BY e.start_date DESC
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
        ),
        'workExperience', COALESCE(
            json_agg(
                json_build_object(
                    'id', w.id,
                    'company', w.company,
                    'position', w.position,
                    'startDate', w.start_date,
                    'endDate', w.end_date,
                    'description', w.description,
                    'responsibilities', w.responsibilities
                ) ORDER BY w.start_date DESC
            ) FILTER (WHERE w.id IS NOT NULL),
            '[]'::json
        ),
        'documents', COALESCE(
            json_agg(
                json_build_object(
                    'id', d.id,
                    'documentType', d.document_type,
                    'fileName', d.file_name,
                    'fileSize', d.file_size,
                    'mimeType', d.mime_type,
                    'uploadDate', d.upload_date
                ) ORDER BY d.upload_date DESC
            ) FILTER (WHERE d.id IS NOT NULL),
            '[]'::json
        ),
        'summary', json_build_object(
            'totalEducation', COUNT(DISTINCT e.id),
            'totalWorkExperience', COUNT(DISTINCT w.id),
            'totalDocuments', COUNT(DISTINCT d.id)
        )
    ) AS candidate_data
FROM candidates c
LEFT JOIN education e ON e.candidate_id = c.id AND e.deleted_at IS NULL
LEFT JOIN work_experience w ON w.candidate_id = c.id AND w.deleted_at IS NULL
LEFT JOIN documents d ON d.candidate_id = c.id AND d.deleted_at IS NULL
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.address,
         c.application_status, c.current_stage, c.created_at, c.updated_at
ORDER BY c.created_at DESC
LIMIT 1;

