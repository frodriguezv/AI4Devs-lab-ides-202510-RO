-- Auto-detect and fix permissions
-- This script will work regardless of the actual role name case

-- First, let's see what user we are
DO $$
DECLARE
    current_role_name TEXT;
BEGIN
    current_role_name := current_user;
    RAISE NOTICE 'Current user: %', current_role_name;
END $$;

-- Grant USAGE and CREATE privileges on the public schema to current user
GRANT USAGE ON SCHEMA public TO CURRENT_USER;
GRANT CREATE ON SCHEMA public TO CURRENT_USER;

-- Grant all privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO CURRENT_USER;

-- Grant all privileges on all existing sequences (for SERIAL columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO CURRENT_USER;

-- Grant execute privileges on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO CURRENT_USER;

-- Grant privileges on all future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO CURRENT_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO CURRENT_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO CURRENT_USER;

-- Also ensure the public schema is usable by default
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;

