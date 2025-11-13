#!/bin/bash

# Script to run validation queries for the latest candidate
# Usage: ./run_validation.sh [query_number]
# Query numbers: 1-8 (see validate_latest_candidate.sql)

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database connection details
DB_HOST="${DB_HOST:-10.211.55.2}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-LTIdbUser}"
DB_NAME="${DB_NAME:-LTIdb}"
DB_PASSWORD="${DB_PASSWORD:-D1ymf8wyQEGthFR1E9xhCq}"
DOCKER_HOST="${DOCKER_HOST:-tcp://10.211.55.2:2375}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUERY_FILE="$SCRIPT_DIR/validate_latest_candidate.sql"

# Check if query file exists
if [ ! -f "$QUERY_FILE" ]; then
    echo "Error: Query file not found: $QUERY_FILE"
    exit 1
fi

# Function to run query using Docker
run_query_docker() {
    local query_num=$1
    local container_name="ai4devs-lab-ides-202510-ro-db-1"
    
    echo -e "${YELLOW}Running validation query #$query_num...${NC}"
    
    # Extract specific query from file (simplified - you may need to adjust)
    if [ -z "$query_num" ]; then
        # Run all queries
        export DOCKER_HOST="$DOCKER_HOST"
        docker exec "$container_name" psql -U "$DB_USER" -d "$DB_NAME" -f - < "$QUERY_FILE"
    else
        # For now, run the quick validation query (#8)
        export DOCKER_HOST="$DOCKER_HOST"
        docker exec "$container_name" psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT json_build_object(
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
                'createdAt', c.created_at
            ),
            'education', COALESCE(
                json_agg(
                    json_build_object(
                        'id', e.id,
                        'institution', e.institution,
                        'degree', e.degree,
                        'fieldOfStudy', e.field_of_study,
                        'startDate', e.start_date,
                        'endDate', e.end_date
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
                        'endDate', w.end_date
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
                        'uploadDate', d.upload_date
                    ) ORDER BY d.upload_date DESC
                ) FILTER (WHERE d.id IS NOT NULL),
                '[]'::json
            ),
            'summary', json_build_object(
                'totalEducation', COUNT(DISTINCT e.id),
                'totalWorkExperience', COUNT(DISTINCT w.id),
                'totalDocuments', COUNT(DISTINCT d.id)
            )
        ) AS candidate_data
        FROM candidates c
        LEFT JOIN education e ON e.candidate_id = c.id AND e.deleted_at IS NULL
        LEFT JOIN work_experience w ON w.candidate_id = c.id AND w.deleted_at IS NULL
        LEFT JOIN documents d ON d.candidate_id = c.id AND d.deleted_at IS NULL
        WHERE c.deleted_at IS NULL
        GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, c.address,
                 c.application_status, c.current_stage, c.created_at
        ORDER BY c.created_at DESC
        LIMIT 1;
        "
    fi
    
    echo -e "${GREEN}✓ Query completed${NC}"
}

# Function to show latest candidate summary
show_summary() {
    local container_name="ai4devs-lab-ides-202510-ro-db-1"
    
    echo -e "${YELLOW}Latest Candidate Summary:${NC}"
    echo ""
    
    export DOCKER_HOST="$DOCKER_HOST"
    docker exec "$container_name" psql -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT 
        c.id,
        c.first_name || ' ' || c.last_name AS name,
        c.email,
        c.phone,
        c.application_status,
        c.current_stage,
        COUNT(DISTINCT e.id) AS education_count,
        COUNT(DISTINCT w.id) AS work_experience_count,
        COUNT(DISTINCT d.id) AS document_count,
        c.created_at
    FROM candidates c
    LEFT JOIN education e ON e.candidate_id = c.id AND e.deleted_at IS NULL
    LEFT JOIN work_experience w ON w.candidate_id = c.id AND w.deleted_at IS NULL
    LEFT JOIN documents d ON d.candidate_id = c.id AND d.deleted_at IS NULL
    WHERE c.deleted_at IS NULL
    GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone, 
             c.application_status, c.current_stage, c.created_at
    ORDER BY c.created_at DESC
    LIMIT 1;
    "
}

# Main execution
if [ "$1" == "summary" ] || [ -z "$1" ]; then
    show_summary
elif [ "$1" == "full" ]; then
    run_query_docker
else
    echo "Usage: $0 [summary|full|query_number]"
    echo ""
    echo "Options:"
    echo "  summary      - Show quick summary (default)"
    echo "  full         - Run all validation queries"
    echo "  query_number - Run specific query (1-8)"
    echo ""
    echo "Examples:"
    echo "  $0              # Show summary"
    echo "  $0 summary      # Show summary"
    echo "  $0 full         # Run all queries"
fi

