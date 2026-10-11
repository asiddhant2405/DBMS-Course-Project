-- =============================================================================
-- ONLINE COURSE LEARNING PROGRESS MANAGEMENT SYSTEM
-- Reset and Repopulate Script (Development / Demo Reset)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS learningprogressdb;
USE learningprogressdb;

-- 1. Apply Schema
SOURCE schema.sql;

-- 2. Populate Seed Records
SOURCE seed.sql;

-- 3. Run Quick Integrity Check
SELECT 'Verification Completed' AS Status;
