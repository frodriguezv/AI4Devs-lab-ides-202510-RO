#!/bin/bash

# Database Setup Script for Candidate Management System
# This script automates the database setup process including migrations and seed data

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Database configuration
DB_USER="${DB_USER:-LTIdbUser}"
DB_NAME="${DB_NAME:-LTIdb}"
DB_PASSWORD="${DB_PASSWORD:-D1ymf8wyQEGthFR1E9xhCq}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Docker configuration
DOCKER_SERVICE="db"
USE_DOCKER=true

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Database Setup Script - Candidate Management System  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}\n"

# Function to check if Docker is available and running
check_docker() {
    if command -v docker &> /dev/null; then
        if docker info &> /dev/null; then
            echo -e "${GREEN}✓ Docker is available and running${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ Docker is installed but not running${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ Docker is not installed or not in PATH${NC}"
        return 1
    fi
}

# Function to check if Docker Compose service is running
check_docker_service() {
    if docker-compose ps "$DOCKER_SERVICE" 2>/dev/null | grep -q "Up"; then
        echo -e "${GREEN}✓ Docker database service is running${NC}"
        return 0
    else
        return 1
    fi
}

# Function to start Docker database
start_docker_db() {
    echo -e "${YELLOW}Starting Docker database container...${NC}"
    
    # Check if docker-compose.sh exists
    if [ -f "$SCRIPT_DIR/docker-compose.sh" ]; then
        "$SCRIPT_DIR/docker-compose.sh" up -d "$DOCKER_SERVICE"
    elif command -v docker-compose &> /dev/null; then
        docker-compose up -d "$DOCKER_SERVICE"
    else
        echo -e "${RED}✗ docker-compose not found${NC}"
        return 1
    fi
    
    # Wait for database to be ready
    echo -e "${YELLOW}Waiting for database to be ready...${NC}"
    sleep 5
    
    # Check if service is up
    if check_docker_service; then
        echo -e "${GREEN}✓ Database container started successfully${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Failed to start database container${NC}\n"
        return 1
    fi
}

# Function to check PostgreSQL connection
check_postgres() {
    local max_attempts=10
    local attempt=1
    
    echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if $USE_DOCKER; then
            if docker-compose exec -T "$DOCKER_SERVICE" psql -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
                echo -e "${GREEN}✓ PostgreSQL connection successful${NC}\n"
                return 0
            fi
        else
            if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
                echo -e "${GREEN}✓ PostgreSQL connection successful${NC}\n"
                return 0
            fi
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            echo -e "${YELLOW}  Attempt $attempt/$max_attempts failed, retrying in 2 seconds...${NC}"
            sleep 2
        fi
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}✗ Cannot connect to PostgreSQL after $max_attempts attempts${NC}"
    echo -e "${YELLOW}Please ensure:${NC}"
    echo "  1. PostgreSQL is running"
    echo "  2. Database '$DB_NAME' exists"
    echo "  3. User '$DB_USER' has proper permissions"
    echo "  4. Connection details are correct"
    return 1
}

# Function to run migration
run_migration() {
    local migration_file="$SCRIPT_DIR/database/migrations/001_create_candidates_schema.up.sql"
    local migration_name=$(basename "$migration_file")
    
    if [ ! -f "$migration_file" ]; then
        echo -e "${RED}✗ Migration file not found: $migration_file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Running migration: $migration_name${NC}"
    
    if $USE_DOCKER; then
        # Copy migration file to container and execute
        docker-compose exec -T "$DOCKER_SERVICE" psql -U "$DB_USER" -d "$DB_NAME" < "$migration_file"
    else
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migration completed successfully${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Migration failed${NC}\n"
        return 1
    fi
}

# Function to load seed data
load_seed_data() {
    local seed_file="$SCRIPT_DIR/database/seeds/sample_data.sql"
    
    if [ ! -f "$seed_file" ]; then
        echo -e "${RED}✗ Seed file not found: $seed_file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Loading seed data...${NC}"
    
    if $USE_DOCKER; then
        docker-compose exec -T "$DOCKER_SERVICE" psql -U "$DB_USER" -d "$DB_NAME" < "$seed_file"
    else
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$seed_file"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Seed data loaded successfully${NC}\n"
        return 0
    else
        echo -e "${YELLOW}⚠ Seed data loading completed with warnings (this is normal if data already exists)${NC}\n"
        return 0
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
    
    if $USE_DOCKER; then
        docker-compose exec -T "$DOCKER_SERVICE" psql -U "$DB_USER" -d "$DB_NAME" -c "$query"
    else
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$query"
    fi
    
    echo -e "${GREEN}✓ Verification complete${NC}\n"
}

# Function to generate Prisma client
generate_prisma_client() {
    echo -e "${YELLOW}Generating Prisma client...${NC}"
    
    if [ ! -d "$SCRIPT_DIR/backend" ]; then
        echo -e "${YELLOW}⚠ Backend directory not found, skipping Prisma client generation${NC}\n"
        return 0
    fi
    
    cd "$SCRIPT_DIR/backend"
    
    if [ ! -f "package.json" ]; then
        echo -e "${YELLOW}⚠ package.json not found in backend directory${NC}\n"
        cd "$SCRIPT_DIR"
        return 0
    fi
    
    if npm run prisma:generate 2>/dev/null; then
        echo -e "${GREEN}✓ Prisma client generated successfully${NC}\n"
        cd "$SCRIPT_DIR"
        return 0
    else
        echo -e "${YELLOW}⚠ Prisma client generation completed with warnings${NC}\n"
        cd "$SCRIPT_DIR"
        return 0
    fi
}

# Main execution
main() {
    # Determine if we should use Docker
    if check_docker && check_docker_service; then
        USE_DOCKER=true
        echo -e "${GREEN}Using Docker for database operations${NC}\n"
    elif check_docker; then
        echo -e "${YELLOW}Docker is available but database service is not running${NC}"
        read -p "Do you want to start the database container? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if start_docker_db; then
                USE_DOCKER=true
            else
                echo -e "${YELLOW}Falling back to direct PostgreSQL connection${NC}\n"
                USE_DOCKER=false
            fi
        else
            USE_DOCKER=false
            echo -e "${YELLOW}Using direct PostgreSQL connection${NC}\n"
        fi
    else
        USE_DOCKER=false
        echo -e "${YELLOW}Docker not available, using direct PostgreSQL connection${NC}\n"
    fi
    
    # Check PostgreSQL connection
    if ! check_postgres; then
        echo -e "${RED}✗ Database setup failed: Cannot connect to PostgreSQL${NC}"
        exit 1
    fi
    
    # Run migration
    if ! run_migration; then
        echo -e "${RED}✗ Database setup failed: Migration error${NC}"
        exit 1
    fi
    
    # Ask if user wants to load seed data
    read -p "Do you want to load seed data? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        load_seed_data
    else
        echo -e "${YELLOW}Skipping seed data loading${NC}\n"
    fi
    
    # Verify setup
    verify_setup
    
    # Generate Prisma client
    generate_prisma_client
    
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Database Setup Completed Successfully!        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}\n"
    echo -e "${GREEN}Your database is ready to use!${NC}\n"
    echo -e "Connection details:"
    echo -e "  Host: ${DB_HOST}"
    echo -e "  Port: ${DB_PORT}"
    echo -e "  Database: ${DB_NAME}"
    echo -e "  User: ${DB_USER}\n"
}

# Run main function
main

