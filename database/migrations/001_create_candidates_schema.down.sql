-- Migration: Rollback Candidates Management Schema
-- Description: Drops all tables and related objects created in the up migration
-- PostgreSQL Version: 12+

BEGIN;

-- Drop triggers first
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_work_experience_updated_at ON work_experience;
DROP TRIGGER IF EXISTS update_education_updated_at ON education;
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order of dependencies
-- Documents table depends on candidates and users
DROP TABLE IF EXISTS documents CASCADE;

-- Work experience table depends on candidates
DROP TABLE IF EXISTS work_experience CASCADE;

-- Education table depends on candidates
DROP TABLE IF EXISTS education CASCADE;

-- Candidates table depends on users
DROP TABLE IF EXISTS candidates CASCADE;

-- Users table (no dependencies)
DROP TABLE IF EXISTS users CASCADE;

COMMIT;

