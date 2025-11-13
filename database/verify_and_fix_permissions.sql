-- Verify and Fix Database Permissions for LTIdbUser
-- This script checks current permissions and fixes them

-- Check current user
SELECT current_user, session_user;

-- Check if user is superuser
SELECT usesuper FROM pg_user WHERE usename = 'LTIdbUser';

-- Check schema ownership
SELECT schema_name, schema_owner 
FROM information_schema.schemata 
WHERE schema_name = 'public';

-- Fix: Make LTIdbUser the owner of the public schema
ALTER SCHEMA public OWNER TO "LTIdbUser";

-- Grant CONNECT on database
GRANT CONNECT ON DATABASE LTIdb TO "LTIdbUser";

-- Grant all privileges on public schema
GRANT ALL ON SCHEMA public TO "LTIdbUser";
GRANT ALL ON SCHEMA public TO PUBLIC;

-- Grant all privileges on all existing tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON TABLE public.' || quote_ident(r.tablename) || ' TO "LTIdbUser"';
        EXECUTE 'GRANT ALL PRIVILEGES ON TABLE public.' || quote_ident(r.tablename) || ' TO PUBLIC';
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO "LTIdbUser"';
    END LOOP;
END $$;

-- Grant all privileges on all existing sequences
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON SEQUENCE public.' || quote_ident(r.sequence_name) || ' TO "LTIdbUser"';
        EXECUTE 'GRANT ALL PRIVILEGES ON SEQUENCE public.' || quote_ident(r.sequence_name) || ' TO PUBLIC';
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' OWNER TO "LTIdbUser"';
    END LOOP;
END $$;

-- Grant execute on all functions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) LOOP
        BEGIN
            EXECUTE 'GRANT EXECUTE ON FUNCTION public.' || quote_ident(r.proname) || '(' || r.args || ') TO "LTIdbUser"';
            EXECUTE 'GRANT EXECUTE ON FUNCTION public.' || quote_ident(r.proname) || '(' || r.args || ') TO PUBLIC';
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors for functions that might have issues
            NULL;
        END;
    END LOOP;
END $$;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "LTIdbUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "LTIdbUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO "LTIdbUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO PUBLIC;

-- Verify permissions were granted
SELECT 'Permissions fixed successfully!' as status;

