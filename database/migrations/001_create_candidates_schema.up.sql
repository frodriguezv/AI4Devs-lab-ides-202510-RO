-- Migration: Create Candidates Management Schema
-- Description: Creates all tables for the Applicant Tracking System (ATS)
-- PostgreSQL Version: 12+

BEGIN;

-- ============================================================================
-- USERS/RECRUITERS TABLE
-- ============================================================================
-- Stores recruiter/user information for audit trail purposes
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'recruiter',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Index for email lookups (already unique, but explicit index for performance)
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;

COMMENT ON TABLE users IS 'Stores recruiter/user information for audit trail and system access';
COMMENT ON COLUMN users.role IS 'User role: recruiter, admin, manager, etc.';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp for data retention compliance';

-- ============================================================================
-- CANDIDATES TABLE
-- ============================================================================
-- Main table for storing candidate information
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    application_status VARCHAR(50) NOT NULL DEFAULT 'new',
    current_stage VARCHAR(50) NOT NULL DEFAULT 'application',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_application_status CHECK (application_status IN ('new', 'reviewing', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn')),
    CONSTRAINT chk_current_stage CHECK (current_stage IN ('application', 'screening', 'interview', 'offer', 'onboarding', 'archived'))
);

-- Indexes for candidates table
CREATE INDEX idx_candidates_email ON candidates(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_name ON candidates(last_name, first_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_status ON candidates(application_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_stage ON candidates(current_stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_created_at ON candidates(created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_created_by ON candidates(created_by) WHERE deleted_at IS NULL;

COMMENT ON TABLE candidates IS 'Main table storing candidate information and application tracking';
COMMENT ON COLUMN candidates.application_status IS 'Overall application status: new, reviewing, interviewing, offer, hired, rejected, withdrawn';
COMMENT ON COLUMN candidates.current_stage IS 'Current stage in the hiring process';
COMMENT ON COLUMN candidates.deleted_at IS 'Soft delete timestamp for GDPR compliance';

-- ============================================================================
-- EDUCATION TABLE
-- ============================================================================
-- Stores education history for candidates (one-to-many relationship)
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
    CONSTRAINT chk_education_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes for education table
CREATE INDEX idx_education_candidate_id ON education(candidate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_education_institution ON education(institution) WHERE deleted_at IS NULL;
CREATE INDEX idx_education_dates ON education(start_date, end_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE education IS 'Stores education history for candidates (supports multiple entries per candidate)';
COMMENT ON COLUMN education.end_date IS 'NULL indicates ongoing education';
COMMENT ON COLUMN education.field_of_study IS 'Major, specialization, or field of study';

-- ============================================================================
-- WORK EXPERIENCE TABLE
-- ============================================================================
-- Stores work experience history for candidates (one-to-many relationship)
CREATE TABLE IF NOT EXISTS work_experience (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    responsibilities TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
    CONSTRAINT chk_work_experience_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes for work_experience table
CREATE INDEX idx_work_experience_candidate_id ON work_experience(candidate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_experience_company ON work_experience(company) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_experience_dates ON work_experience(start_date, end_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE work_experience IS 'Stores work experience history for candidates (supports multiple entries per candidate)';
COMMENT ON COLUMN work_experience.end_date IS 'NULL indicates current position';
COMMENT ON COLUMN work_experience.responsibilities IS 'Detailed list of responsibilities and achievements';

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
-- Stores documents associated with candidates (one-to-many relationship)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    
    -- Constraints
    CONSTRAINT chk_document_type CHECK (document_type IN ('CV', 'resume', 'cover_letter', 'portfolio', 'certificate', 'other')),
    CONSTRAINT chk_file_size CHECK (file_size > 0),
    CONSTRAINT chk_mime_type CHECK (mime_type ~* '^[a-z]+/[a-z0-9.+-]+$')
);

-- Indexes for documents table
CREATE INDEX idx_documents_candidate_id ON documents(candidate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type ON documents(document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_upload_date ON documents(upload_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by) WHERE deleted_at IS NULL;

COMMENT ON TABLE documents IS 'Stores documents associated with candidates (CVs, cover letters, portfolios, etc.)';
COMMENT ON COLUMN documents.file_path IS 'Server-side file path or storage location';
COMMENT ON COLUMN documents.file_url IS 'Public URL for accessing the document (if applicable)';
COMMENT ON COLUMN documents.file_size IS 'File size in bytes';

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON work_experience
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at timestamp on row updates';

COMMIT;

