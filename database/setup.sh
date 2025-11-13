#!/bin/bash

# Database Setup Script
# This script helps set up the database schema for the Candidate Management System

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database configuration (can be overridden by environment variables)
DB_USER="${DB_USER:-LTIdbUser}"
DB_NAME="${DB_NAME:-LTIdb}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo -e "${GREEN}=== Database Setup Script ===${NC}\n"

# Function to check if PostgreSQL is running
check_postgres() {
    echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
        echo -e "${GREEN}✓ PostgreSQL connection successful${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}"
        echo -e "${YELLOW}Please ensure:${NC}"
        echo "  1. PostgreSQL is running"
        echo "  2. Database '$DB_NAME' exists"
        echo "  3. User '$DB_USER' has proper permissions"
        echo "  4. Connection details are correct"
        return 1
    fi
}

# Function to run migration
run_migration() {
    local migration_file="$1"
    local migration_name=$(basename "$migration_file")
    
    echo -e "${YELLOW}Running migration: $migration_name${NC}"
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"; then
        echo -e "${GREEN}✓ Migration completed successfully${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Migration failed${NC}\n"
        return 1
    fi
}

# Function to load seed data
load_seed_data() {
    local seed_file="$1"
    
    echo -e "${YELLOW}Loading seed data...${NC}"
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$seed_file"; then
        echo -e "${GREEN}✓ Seed data loaded successfully${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Failed to load seed data${NC}\n"
        return 1
    fi
}

# Function to verify setup
verify_setup() {
    echo -e "${YELLOW}Verifying database setup...${NC}"
    
    local query="SELECT 
        'users' as table_name, COUNT(*) as count FROM users WHERE deleted_at IS NULL
    UNION ALL
    SELECT 'candidates', COUNT(*) FROM candidates WHERE deleted_at IS NULL
    UNION ALL
    SELECT 'education', COUNT(*) FROM education WHERE deleted_at IS NULL
    UNION ALL
    SELECT 'work_experience', COUNT(*) FROM work_experience WHERE deleted_at IS NULL
    UNION ALL
    SELECT 'documents', COUNT(*) FROM documents WHERE deleted_at IS NULL;"
    
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$query"
    
    echo -e "${GREEN}✓ Verification complete${NC}\n"
}

# Main execution
main() {
    # Get script directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    # Check PostgreSQL connection
    if ! check_postgres; then
        exit 1
    fi
    
    # Run up migration
    MIGRATION_FILE="$SCRIPT_DIR/migrations/001_create_candidates_schema.up.sql"
    if [ ! -f "$MIGRATION_FILE" ]; then
        echo -e "${RED}✗ Migration file not found: $MIGRATION_FILE${NC}"
        exit 1
    fi
    
    if ! run_migration "$MIGRATION_FILE"; then
        exit 1
    fi
    
    # Ask if user wants to load seed data
    read -p "Do you want to load seed data? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        SEED_FILE="$SCRIPT_DIR/seeds/sample_data.sql"
        if [ ! -f "$SEED_FILE" ]; then
            echo -e "${RED}✗ Seed file not found: $SEED_FILE${NC}"
            exit 1
        fi
        
        load_seed_data "$SEED_FILE"
    fi
    
    # Verify setup
    verify_setup
    
    echo -e "${GREEN}=== Setup Complete ===${NC}"
    echo -e "${GREEN}Database schema has been created successfully!${NC}"
}

# Run main function
main

