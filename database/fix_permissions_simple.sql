-- Simple permissions fix for LTIdbUser
-- Run this as LTIdbUser (which should be a superuser when created via POSTGRES_USER)
-- Using quoted identifier to preserve case: "LTIdbUser"

-- First, ensure the user can connect to the database
GRANT CONNECT ON DATABASE LTIdb TO "LTIdbUser";

-- Make LTIdbUser the owner of the public schema (if not already)
ALTER SCHEMA public OWNER TO "LTIdbUser";

-- Grant USAGE and CREATE privileges on the public schema
GRANT USAGE ON SCHEMA public TO "LTIdbUser";
GRANT CREATE ON SCHEMA public TO "LTIdbUser";

-- Also grant to PUBLIC role (all users)
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;

-- Grant all privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "LTIdbUser";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO PUBLIC;

-- Grant all privileges on all existing sequences (for SERIAL columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "LTIdbUser";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;

-- Grant execute privileges on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO "LTIdbUser";
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO PUBLIC;

-- Grant privileges on all future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "LTIdbUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "LTIdbUser";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO "LTIdbUser";

-- Also set default privileges for PUBLIC
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO PUBLIC;

