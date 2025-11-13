-- Fix Database Permissions for LTIdbUser
-- This script grants all necessary permissions to the database user
-- Note: This must be run as a superuser or the database owner

-- First, ensure LTIdbUser is the owner of the database
ALTER DATABASE LTIdb OWNER TO LTIdbUser;

-- Grant CONNECT privilege on the database (should already exist, but ensure it)
GRANT CONNECT ON DATABASE LTIdb TO LTIdbUser;

-- Grant USAGE and CREATE privileges on the public schema
GRANT USAGE ON SCHEMA public TO LTIdbUser;
GRANT CREATE ON SCHEMA public TO LTIdbUser;

-- Make LTIdbUser the owner of the public schema
ALTER SCHEMA public OWNER TO LTIdbUser;

-- Grant all privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO LTIdbUser;

-- Grant all privileges on all existing sequences (for SERIAL columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO LTIdbUser;

-- Make LTIdbUser the owner of all existing tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO LTIdbUser';
    END LOOP;
END $$;

-- Make LTIdbUser the owner of all existing sequences
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' OWNER TO LTIdbUser';
    END LOOP;
END $$;

-- Make LTIdbUser the owner of all existing functions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) LOOP
        EXECUTE 'ALTER FUNCTION public.' || quote_ident(r.proname) || '(' || r.args || ') OWNER TO LTIdbUser';
    END LOOP;
END $$;

-- Grant privileges on all future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO LTIdbUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO LTIdbUser;

-- Grant execute privileges on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO LTIdbUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO LTIdbUser;

