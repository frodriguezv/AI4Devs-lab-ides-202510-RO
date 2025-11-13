-- Quick validation query for the latest candidate
-- Returns a single JSON object with all candidate data

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
            'totalDocuments', COUNT(DISTINCT d.id),
            'validation', json_build_object(
                'hasRequiredFields', 
                    CASE WHEN c.first_name IS NOT NULL AND c.last_name IS NOT NULL 
                         AND c.email IS NOT NULL AND c.phone IS NOT NULL 
                    THEN true ELSE false END,
                'hasValidEmail',
                    CASE WHEN c.email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' 
                    THEN true ELSE false END,
                'hasEducation', CASE WHEN COUNT(DISTINCT e.id) > 0 THEN true ELSE false END,
                'hasWorkExperience', CASE WHEN COUNT(DISTINCT w.id) > 0 THEN true ELSE false END,
                'hasDocuments', CASE WHEN COUNT(DISTINCT d.id) > 0 THEN true ELSE false END
            )
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

