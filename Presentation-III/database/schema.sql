-- =============================================================================
-- ONLINE COURSE LEARNING PROGRESS MANAGEMENT SYSTEM
-- Database Schema: learningprogressdb
-- Academic Course: B.Tech 2nd Year DBMS Course Project
-- Student: Siddhant Agarwal (Roll No: 25WU0102262, Section: AIML Whales)
-- Partner: Manthena Naga Sri Rohan (Roll No: 25WU0102151, Section: AIML Panthers)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS learningprogressdb;
USE learningprogressdb;

-- Drop dependent tables first to allow clean re-creation if needed
DROP TABLE IF EXISTS result;
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS assessment;
DROP TABLE IF EXISTS module;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS instructor;

-- -----------------------------------------------------------------------------
-- 1. INSTRUCTOR (Master Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE instructor (
    Instructor_ID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Specialization VARCHAR(100) DEFAULT NULL,
    Phone VARCHAR(20) DEFAULT NULL,
    PRIMARY KEY (Instructor_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 2. STUDENT (Master Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE student (
    Student_ID INT NOT NULL AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Department VARCHAR(50) NOT NULL,
    Year INT NOT NULL,
    Phone VARCHAR(20) DEFAULT NULL,
    PRIMARY KEY (Student_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 3. COURSE (Master/Organizing Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE course (
    Course_ID INT NOT NULL AUTO_INCREMENT,
    Course_Name VARCHAR(100) NOT NULL,
    Description TEXT DEFAULT NULL,
    Category VARCHAR(50) DEFAULT NULL,
    Duration VARCHAR(50) DEFAULT NULL,
    Level VARCHAR(50) DEFAULT NULL,
    Instructor_ID INT DEFAULT NULL,
    PRIMARY KEY (Course_ID),
    KEY idx_course_instructor (Instructor_ID),
    CONSTRAINT fk_course_instructor FOREIGN KEY (Instructor_ID) 
        REFERENCES instructor (Instructor_ID) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 4. MODULE (Organizing Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE module (
    Module_ID INT NOT NULL AUTO_INCREMENT,
    Module_Name VARCHAR(100) NOT NULL,
    Description TEXT DEFAULT NULL,
    Sequence_No INT DEFAULT 1,
    Course_ID INT NOT NULL,
    PRIMARY KEY (Module_ID),
    KEY idx_module_course (Course_ID),
    CONSTRAINT fk_module_course FOREIGN KEY (Course_ID) 
        REFERENCES course (Course_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 5. ASSESSMENT (Organizing Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE assessment (
    Assessment_ID INT NOT NULL AUTO_INCREMENT,
    Assessment_Name VARCHAR(100) NOT NULL,
    Assessment_Type VARCHAR(50) DEFAULT 'Quiz',
    Max_Marks INT NOT NULL DEFAULT 100,
    Module_ID INT NOT NULL,
    PRIMARY KEY (Assessment_ID),
    KEY idx_assessment_module (Module_ID),
    CONSTRAINT fk_assessment_module FOREIGN KEY (Module_ID) 
        REFERENCES module (Module_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 6. ENROLLMENT (Transactional Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE enrollment (
    Enrollment_ID INT NOT NULL AUTO_INCREMENT,
    Enroll_Date DATE NOT NULL,
    Status VARCHAR(50) NOT NULL DEFAULT 'Active',
    Completion_Date DATE DEFAULT NULL,
    Student_ID INT NOT NULL,
    Course_ID INT NOT NULL,
    PRIMARY KEY (Enrollment_ID),
    UNIQUE KEY uq_student_course (Student_ID, Course_ID),
    KEY idx_enrollment_student (Student_ID),
    KEY idx_enrollment_course (Course_ID),
    CONSTRAINT fk_enrollment_student FOREIGN KEY (Student_ID) 
        REFERENCES student (Student_ID) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_enrollment_course FOREIGN KEY (Course_ID) 
        REFERENCES course (Course_ID) 
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 7. PROGRESS (Transactional Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE progress (
    Progress_ID INT NOT NULL AUTO_INCREMENT,
    Progress_Date DATE NOT NULL,
    Completion_Percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    Status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    Time_Spent INT NOT NULL DEFAULT 0,
    Student_ID INT NOT NULL,
    Module_ID INT NOT NULL,
    PRIMARY KEY (Progress_ID),
    UNIQUE KEY uq_student_module (Student_ID, Module_ID),
    KEY idx_progress_student (Student_ID),
    KEY idx_progress_module (Module_ID),
    CONSTRAINT fk_progress_student FOREIGN KEY (Student_ID) 
        REFERENCES student (Student_ID) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_progress_module FOREIGN KEY (Module_ID) 
        REFERENCES module (Module_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- 8. RESULT (Transactional Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE result (
    Result_ID INT NOT NULL AUTO_INCREMENT,
    Score DECIMAL(5,2) DEFAULT NULL,
    Attempt_No INT DEFAULT 1,
    Result_Date DATE DEFAULT NULL,
    Student_ID INT NOT NULL,
    Assessment_ID INT NOT NULL,
    PRIMARY KEY (Result_ID),
    UNIQUE KEY uq_student_assessment_attempt (Student_ID, Assessment_ID, Attempt_No),
    KEY idx_result_student (Student_ID),
    KEY idx_result_assessment (Assessment_ID),
    CONSTRAINT fk_result_student FOREIGN KEY (Student_ID) 
        REFERENCES student (Student_ID) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_result_assessment FOREIGN KEY (Assessment_ID) 
        REFERENCES assessment (Assessment_ID) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
