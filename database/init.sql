-- Harachi ERP Database Initialization Script
-- This script sets up the initial database configuration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create initial schema
CREATE SCHEMA IF NOT EXISTS public;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO postgres;

-- Create audit schema for system-wide audit logs
CREATE SCHEMA IF NOT EXISTS audit;

-- Grant permissions
GRANT USAGE ON SCHEMA audit TO postgres;
GRANT CREATE ON SCHEMA audit TO postgres;

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit.audit_logs (
            table_name,
            operation,
            old_values,
            new_values,
            changed_by,
            changed_at
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            row_to_json(OLD),
            NULL,
            current_user,
            NOW()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit.audit_logs (
            table_name,
            operation,
            old_values,
            new_values,
            changed_by,
            changed_at
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            row_to_json(OLD),
            row_to_json(NEW),
            current_user,
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit.audit_logs (
            table_name,
            operation,
            old_values,
            new_values,
            changed_by,
            changed_at
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            NULL,
            row_to_json(NEW),
            current_user,
            NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit.audit_logs(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit.audit_logs(changed_by);

-- Create function to create company schema
CREATE OR REPLACE FUNCTION create_company_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || quote_ident(schema_name);
    EXECUTE 'GRANT USAGE ON SCHEMA ' || quote_ident(schema_name) || ' TO postgres';
    EXECUTE 'GRANT CREATE ON SCHEMA ' || quote_ident(schema_name) || ' TO postgres';
END;
$$ LANGUAGE plpgsql;

-- Create function to drop company schema
CREATE OR REPLACE FUNCTION drop_company_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE 'DROP SCHEMA IF EXISTS ' || quote_ident(schema_name) || ' CASCADE';
END;
$$ LANGUAGE plpgsql;

-- Create function to get company schemas
CREATE OR REPLACE FUNCTION get_company_schemas()
RETURNS TABLE(schema_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT nspname::TEXT
    FROM pg_namespace
    WHERE nspname LIKE 'company_%'
    AND nspname != 'information_schema'
    AND nspname != 'pg_catalog'
    AND nspname != 'pg_toast'
    AND nspname != 'audit';
END;
$$ LANGUAGE plpgsql;

-- Set up connection limits
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();

-- Create initial admin user (will be created by Prisma migrations)
-- This is just a placeholder for the initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
    RAISE NOTICE 'Ready for Prisma migrations';
END $$;
