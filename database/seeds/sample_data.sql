-- Seed Data: Sample Data for Candidates Management System
-- Description: Inserts sample data for testing and development
-- Run this after executing the up migration

BEGIN;

-- ============================================================================
-- INSERT SAMPLE USERS/RECRUITERS
-- ============================================================================
INSERT INTO users (name, email, role) VALUES
    ('John Smith', 'john.smith@company.com', 'recruiter'),
    ('Sarah Johnson', 'sarah.johnson@company.com', 'senior_recruiter'),
    ('Michael Chen', 'michael.chen@company.com', 'recruiter'),
    ('Emily Davis', 'emily.davis@company.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE CANDIDATES
-- ============================================================================
INSERT INTO candidates (first_name, last_name, email, phone, address, application_status, current_stage, created_by) VALUES
    ('Alice', 'Williams', 'alice.williams@email.com', '+1-555-0101', '123 Main St, San Francisco, CA 94102', 'reviewing', 'screening', 1),
    ('Bob', 'Martinez', 'bob.martinez@email.com', '+1-555-0102', '456 Oak Ave, New York, NY 10001', 'interviewing', 'interview', 1),
    ('Carol', 'Anderson', 'carol.anderson@email.com', '+1-555-0103', '789 Pine Rd, Austin, TX 78701', 'new', 'application', 2),
    ('David', 'Taylor', 'david.taylor@email.com', '+1-555-0104', '321 Elm St, Seattle, WA 98101', 'offer', 'offer', 2),
    ('Eva', 'Brown', 'eva.brown@email.com', '+1-555-0105', '654 Maple Dr, Boston, MA 02101', 'hired', 'onboarding', 1)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE EDUCATION RECORDS
-- ============================================================================
-- Education for Alice Williams (candidate_id = 1)
INSERT INTO education (candidate_id, institution, degree, field_of_study, start_date, end_date, description) VALUES
    (1, 'Stanford University', 'Bachelor of Science', 'Computer Science', '2015-09-01', '2019-05-15', 'Graduated magna cum laude. Focused on software engineering and algorithms.'),
    (1, 'Stanford University', 'Master of Science', 'Computer Science', '2019-09-01', '2021-05-15', 'Specialized in machine learning and distributed systems.');

-- Education for Bob Martinez (candidate_id = 2)
INSERT INTO education (candidate_id, institution, degree, field_of_study, start_date, end_date, description) VALUES
    (2, 'MIT', 'Bachelor of Science', 'Electrical Engineering', '2014-09-01', '2018-05-20', 'Dean''s List for 4 semesters. Senior project on IoT systems.');

-- Education for Carol Anderson (candidate_id = 3)
INSERT INTO education (candidate_id, institution, degree, field_of_study, start_date, end_date, description) VALUES
    (3, 'UC Berkeley', 'Bachelor of Arts', 'Business Administration', '2016-09-01', '2020-05-15', 'Concentration in marketing and analytics.'),
    (3, 'Harvard Business School', 'Master of Business Administration', 'Business Strategy', '2020-09-01', '2022-05-20', 'Focus on product management and technology strategy.');

-- Education for David Taylor (candidate_id = 4)
INSERT INTO education (candidate_id, institution, degree, field_of_study, start_date, end_date, description) VALUES
    (4, 'University of Washington', 'Bachelor of Science', 'Information Systems', '2017-09-01', '2021-05-15', 'Relevant coursework in database design and web development.');

-- Education for Eva Brown (candidate_id = 5)
INSERT INTO education (candidate_id, institution, degree, field_of_study, start_date, end_date, description) VALUES
    (5, 'Northeastern University', 'Bachelor of Science', 'Data Science', '2015-09-01', '2019-05-15', 'Co-op program with 3 industry placements.'),
    (5, 'Carnegie Mellon University', 'Master of Science', 'Machine Learning', '2019-09-01', '2021-05-15', 'Thesis on deep learning applications in healthcare.');

-- ============================================================================
-- INSERT SAMPLE WORK EXPERIENCE RECORDS
-- ============================================================================
-- Work experience for Alice Williams (candidate_id = 1)
INSERT INTO work_experience (candidate_id, company, position, start_date, end_date, description, responsibilities) VALUES
    (1, 'TechCorp Inc.', 'Software Engineer', '2021-06-01', '2023-08-31', 'Developed and maintained microservices architecture for e-commerce platform.', 
     '• Designed and implemented RESTful APIs using Node.js and Express
• Optimized database queries reducing response time by 40%
• Collaborated with cross-functional teams in agile environment
• Mentored 2 junior developers'),
    (1, 'StartupXYZ', 'Senior Software Engineer', '2023-09-01', NULL, 'Leading backend development for SaaS product.', 
     '• Architecting scalable cloud infrastructure on AWS
• Implementing CI/CD pipelines reducing deployment time by 60%
• Leading team of 5 engineers
• Contributing to product roadmap decisions');

-- Work experience for Bob Martinez (candidate_id = 2)
INSERT INTO work_experience (candidate_id, company, position, start_date, end_date, description, responsibilities) VALUES
    (2, 'Global Systems Ltd.', 'Junior Engineer', '2018-07-01', '2020-12-31', 'Worked on embedded systems for industrial automation.', 
     '• Developed firmware for IoT devices
• Performed hardware testing and validation
• Documented technical specifications'),
    (2, 'Innovation Labs', 'Full Stack Developer', '2021-01-01', NULL, 'Building web applications for enterprise clients.', 
     '• Developed React frontend applications
• Built Node.js backend services
• Integrated third-party APIs
• Participated in code reviews and technical discussions');

-- Work experience for Carol Anderson (candidate_id = 3)
INSERT INTO work_experience (candidate_id, company, position, start_date, end_date, description, responsibilities) VALUES
    (3, 'Marketing Pro', 'Marketing Intern', '2019-06-01', '2019-08-31', 'Summer internship in digital marketing.', 
     '• Created social media content
• Analyzed campaign performance metrics
• Assisted with market research'),
    (3, 'Strategy Consulting Group', 'Business Analyst', '2022-07-01', NULL, 'Analyzing business processes and recommending improvements.', 
     '• Conducted stakeholder interviews
• Created process flow diagrams
• Developed business cases for technology investments
• Presented findings to C-level executives');

-- Work experience for David Taylor (candidate_id = 4)
INSERT INTO work_experience (candidate_id, company, position, start_date, end_date, description, responsibilities) VALUES
    (4, 'WebDev Solutions', 'Junior Developer', '2021-06-01', '2023-05-31', 'Developed custom web solutions for small businesses.', 
     '• Built WordPress websites
• Customized themes and plugins
• Provided client support and training'),
    (4, 'CloudTech Services', 'Software Developer', '2023-06-01', NULL, 'Developing cloud-based applications.', 
     '• Building microservices with Python and FastAPI
• Working with Docker and Kubernetes
• Implementing automated testing
• Collaborating with DevOps team');

-- Work experience for Eva Brown (candidate_id = 5)
INSERT INTO work_experience (candidate_id, company, position, start_date, end_date, description, responsibilities) VALUES
    (5, 'Data Analytics Co.', 'Data Analyst', '2021-06-01', '2022-12-31', 'Analyzed customer behavior and business metrics.', 
     '• Created SQL queries for data extraction
• Built dashboards in Tableau
• Performed statistical analysis
• Presented insights to stakeholders'),
    (5, 'AI Innovations', 'Data Scientist', '2023-01-01', NULL, 'Developing machine learning models for predictive analytics.', 
     '• Building and training ML models using Python and TensorFlow
• Feature engineering and data preprocessing
• A/B testing and model validation
• Publishing research findings');

-- ============================================================================
-- INSERT SAMPLE DOCUMENTS
-- ============================================================================
-- Documents for Alice Williams (candidate_id = 1)
INSERT INTO documents (candidate_id, document_type, file_name, file_path, file_url, mime_type, file_size, uploaded_by) VALUES
    (1, 'CV', 'alice_williams_cv.pdf', '/documents/candidates/1/alice_williams_cv.pdf', 'https://storage.example.com/documents/1/alice_williams_cv.pdf', 'application/pdf', 245760, 1),
    (1, 'cover_letter', 'alice_williams_cover_letter.pdf', '/documents/candidates/1/alice_williams_cover_letter.pdf', 'https://storage.example.com/documents/1/alice_williams_cover_letter.pdf', 'application/pdf', 98304, 1);

-- Documents for Bob Martinez (candidate_id = 2)
INSERT INTO documents (candidate_id, document_type, file_name, file_path, file_url, mime_type, file_size, uploaded_by) VALUES
    (2, 'resume', 'bob_martinez_resume.pdf', '/documents/candidates/2/bob_martinez_resume.pdf', 'https://storage.example.com/documents/2/bob_martinez_resume.pdf', 'application/pdf', 189440, 1),
    (2, 'portfolio', 'bob_martinez_portfolio.pdf', '/documents/candidates/2/bob_martinez_portfolio.pdf', 'https://storage.example.com/documents/2/bob_martinez_portfolio.pdf', 'application/pdf', 5242880, 1);

-- Documents for Carol Anderson (candidate_id = 3)
INSERT INTO documents (candidate_id, document_type, file_name, file_path, file_url, mime_type, file_size, uploaded_by) VALUES
    (3, 'CV', 'carol_anderson_cv.pdf', '/documents/candidates/3/carol_anderson_cv.pdf', 'https://storage.example.com/documents/3/carol_anderson_cv.pdf', 'application/pdf', 212992, 2);

-- Documents for David Taylor (candidate_id = 4)
INSERT INTO documents (candidate_id, document_type, file_name, file_path, file_url, mime_type, file_size, uploaded_by) VALUES
    (4, 'resume', 'david_taylor_resume.pdf', '/documents/candidates/4/david_taylor_resume.pdf', 'https://storage.example.com/documents/4/david_taylor_resume.pdf', 'application/pdf', 196608, 2),
    (4, 'cover_letter', 'david_taylor_cover_letter.pdf', '/documents/candidates/4/david_taylor_cover_letter.pdf', 'https://storage.example.com/documents/4/david_taylor_cover_letter.pdf', 'application/pdf', 114688, 2),
    (4, 'certificate', 'david_taylor_aws_cert.pdf', '/documents/candidates/4/david_taylor_aws_cert.pdf', 'https://storage.example.com/documents/4/david_taylor_aws_cert.pdf', 'application/pdf', 153600, 2);

-- Documents for Eva Brown (candidate_id = 5)
INSERT INTO documents (candidate_id, document_type, file_name, file_path, file_url, mime_type, file_size, uploaded_by) VALUES
    (5, 'CV', 'eva_brown_cv.pdf', '/documents/candidates/5/eva_brown_cv.pdf', 'https://storage.example.com/documents/5/eva_brown_cv.pdf', 'application/pdf', 229376, 1),
    (5, 'portfolio', 'eva_brown_portfolio.pdf', '/documents/candidates/5/eva_brown_portfolio.pdf', 'https://storage.example.com/documents/5/eva_brown_portfolio.pdf', 'application/pdf', 3145728, 1);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Uncomment the following queries to verify the seed data:

-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_candidates FROM candidates;
-- SELECT COUNT(*) as total_education FROM education;
-- SELECT COUNT(*) as total_work_experience FROM work_experience;
-- SELECT COUNT(*) as total_documents FROM documents;

-- SELECT c.first_name, c.last_name, c.email, c.application_status, 
--        COUNT(DISTINCT e.id) as education_count,
--        COUNT(DISTINCT w.id) as work_experience_count,
--        COUNT(DISTINCT d.id) as document_count
-- FROM candidates c
-- LEFT JOIN education e ON c.id = e.candidate_id AND e.deleted_at IS NULL
-- LEFT JOIN work_experience w ON c.id = w.candidate_id AND w.deleted_at IS NULL
-- LEFT JOIN documents d ON c.id = d.candidate_id AND d.deleted_at IS NULL
-- WHERE c.deleted_at IS NULL
-- GROUP BY c.id, c.first_name, c.last_name, c.email, c.application_status
-- ORDER BY c.id;

