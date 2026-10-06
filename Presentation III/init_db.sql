CREATE DATABASE IF NOT EXISTS OnlineLearningSystem;

USE OnlineLearningSystem;

-- Drop child tables first in case they exist to allow clean re-runs
DROP TABLE IF EXISTS RESULT;
DROP TABLE IF EXISTS PROGRESS;
DROP TABLE IF EXISTS ENROLLMENT;
DROP TABLE IF EXISTS ASSESSMENT;
DROP TABLE IF EXISTS MODULE;
DROP TABLE IF EXISTS COURSE;
DROP TABLE IF EXISTS STUDENT;
DROP TABLE IF EXISTS INSTRUCTOR;

-- 1. Master Tables
CREATE TABLE INSTRUCTOR (
    Instructor_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Specialization VARCHAR(100),
    Phone VARCHAR(15)
);

CREATE TABLE STUDENT (
    Student_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Department VARCHAR(50),
    Year INT,
    Phone VARCHAR(15)
);

-- 2. Core Entity
CREATE TABLE COURSE (
    Course_ID INT PRIMARY KEY AUTO_INCREMENT,
    Course_Name VARCHAR(150) NOT NULL,
    Description TEXT,
    Duration INT,
    Category VARCHAR(50),
    Level VARCHAR(50),
    Instructor_ID INT,
    FOREIGN KEY (Instructor_ID) REFERENCES INSTRUCTOR (Instructor_ID) ON DELETE SET NULL
);

-- 3. Organizational Entities
CREATE TABLE MODULE (
    Module_ID INT PRIMARY KEY AUTO_INCREMENT,
    Module_Name VARCHAR(150) NOT NULL,
    Description TEXT,
    Sequence_No INT,
    Course_ID INT,
    FOREIGN KEY (Course_ID) REFERENCES COURSE (Course_ID) ON DELETE CASCADE
);

CREATE TABLE ASSESSMENT (
    Assessment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Assessment_Name VARCHAR(150) NOT NULL,
    Assessment_Type VARCHAR(50),
    Max_Marks DECIMAL(5, 2),
    Module_ID INT,
    FOREIGN KEY (Module_ID) REFERENCES MODULE (Module_ID) ON DELETE CASCADE
);

-- 4. Transactional Entities
CREATE TABLE ENROLLMENT (
    Enrollment_ID INT PRIMARY KEY AUTO_INCREMENT,
    Enroll_Date DATE NOT NULL,
    Status VARCHAR(50),
    Completion_Date DATE,
    Student_ID INT,
    Course_ID INT,
    FOREIGN KEY (Student_ID) REFERENCES STUDENT (Student_ID) ON DELETE CASCADE,
    FOREIGN KEY (Course_ID) REFERENCES COURSE (Course_ID) ON DELETE CASCADE
);

CREATE TABLE PROGRESS (
    Progress_ID INT PRIMARY KEY AUTO_INCREMENT,
    Progress_Date DATE,
    Completion_Percent DECIMAL(5, 2),
    Status VARCHAR(50),
    Time_Spent INT,
    Student_ID INT,
    Module_ID INT,
    FOREIGN KEY (Student_ID) REFERENCES STUDENT (Student_ID) ON DELETE CASCADE,
    FOREIGN KEY (Module_ID) REFERENCES MODULE (Module_ID) ON DELETE CASCADE
);

CREATE TABLE RESULT (
    Result_ID INT PRIMARY KEY AUTO_INCREMENT,
    Score DECIMAL(5, 2),
    Attempt_No INT,
    Result_Date DATE,
    Student_ID INT,
    Assessment_ID INT,
    FOREIGN KEY (Student_ID) REFERENCES STUDENT (Student_ID) ON DELETE CASCADE,
    FOREIGN KEY (Assessment_ID) REFERENCES ASSESSMENT (Assessment_ID) ON DELETE CASCADE
);


-- Insert 4 records into INSTRUCTOR
INSERT INTO INSTRUCTOR (Instructor_ID, Name, Email, Specialization, Phone)
VALUES
    (1, 'Dr. Alan Turing', 'alan@univ.edu', 'Computer Science', '555-0101'),
    (2, 'Dr. Marie Curie', 'marie@univ.edu', 'Physics', '555-0102'),
    (3, 'Dr. Ada Lovelace', 'ada@univ.edu', 'Mathematics', '555-0103'),
    (4, 'Dr. Grace Hopper', 'grace@univ.edu', 'Software Eng', '555-0104');

-- Insert 31 records into STUDENT
INSERT INTO STUDENT (Student_ID, Name, Email, Department, Year, Phone)
VALUES
    (1, 'Aarav Patel', 'aarav@univ.edu', 'Computer Science', 1, '555-1001'),
    (2, 'Aditi Sharma', 'aditi@univ.edu', 'Information Tech', 1, '555-1002'),
    (3, 'Rohan Gupta', 'rohan@univ.edu', 'Computer Science', 1, '555-1003'),
    (4, 'Sneha Reddy', 'sneha@univ.edu', 'Electronics', 1, '555-1004'),
    (5, 'Karan Singh', 'karan@univ.edu', 'Computer Science', 1, '555-1005'),
    (6, 'Priya Verma', 'priya@univ.edu', 'Information Tech', 1, '555-1006'),
    (7, 'Rahul Desai', 'rahul@univ.edu', 'Computer Science', 1, '555-1007'),
    (8, 'Ananya Nair', 'ananya@univ.edu', 'Electronics', 1, '555-1008'),
    (9, 'Vikram Joshi', 'vikram@univ.edu', 'Computer Science', 1, '555-1009'),
    (10, 'Neha Mehra', 'neha@univ.edu', 'Information Tech', 1, '555-1010'),
    (11, 'Arjun Das', 'arjun@univ.edu', 'Computer Science', 1, '555-1011'),
    (12, 'Kavya Iyer', 'kavya@univ.edu', 'Electronics', 1, '555-1012'),
    (13, 'Dev Kumar', 'dev@univ.edu', 'Information Tech', 1, '555-1013'),
    (14, 'Isha Rao', 'isha@univ.edu', 'Computer Science', 1, '555-1014'),
    (15, 'Samir Jain', 'samir@univ.edu', 'Electronics', 1, '555-1015'),
    (16, 'Maya Sen', 'maya@univ.edu', 'Computer Science', 1, '555-1016'),
    (17, 'Kabir Bose', 'kabir@univ.edu', 'Information Tech', 1, '555-1017'),
    (18, 'Tara Menon', 'tara@univ.edu', 'Computer Science', 1, '555-1018'),
    (19, 'Yash Khanna', 'yash@univ.edu', 'Electronics', 1, '555-1019'),
    (20, 'Sanya Kapoor', 'sanya@univ.edu', 'Information Tech', 1, '555-1020'),
    (21, 'Aryan Bhat', 'aryan@univ.edu', 'Computer Science', 1, '555-1021'),
    (22, 'Nisha Pillai', 'nisha@univ.edu', 'Electronics', 1, '555-1022'),
    (23, 'Dhruv Ahuja', 'dhruv@univ.edu', 'Computer Science', 1, '555-1023'),
    (24, 'Riya Ghosh', 'riya@univ.edu', 'Information Tech', 1, '555-1024'),
    (25, 'Omkar Nath', 'omkar@univ.edu', 'Computer Science', 1, '555-1025'),
    (26, 'Zara Sheikh', 'zara@univ.edu', 'Electronics', 1, '555-1026'),
    (27, 'Vedant Soni', 'vedant@univ.edu', 'Information Tech', 1, '555-1027'),
    (28, 'Mira Rajput', 'mira@univ.edu', 'Computer Science', 1, '555-1028'),
    (29, 'Armaan Malik', 'armaan@univ.edu', 'Electronics', 1, '555-1029'),
    (30, 'Pooja Hegde', 'pooja@univ.edu', 'Information Tech', 1, '555-1030'),
    (31, 'Siddhant Agarwal', 'asiddhant706@gmail.com', 'Computer Science', 1, '634534');

-- Insert 4 records into COURSE
INSERT INTO COURSE (Course_ID, Course_Name, Description, Duration, Category, Level, Instructor_ID)
VALUES
    (1, 'Intro to Python', 'Learn basic Python', 40, 'Programming', 'Beginner', 1),
    (2, 'Database Systems', 'SQL and Relational Algebra', 45, 'Computer Science', 'Intermediate', 4),
    (3, 'Applied Physics', 'Mechanics and Thermodynamics', 50, 'Physics', 'Advanced', 2),
    (4, 'Calculus I', 'Limits and Derivatives', 30, 'Mathematics', 'Beginner', 3);

-- Insert 4 records into MODULE
INSERT INTO MODULE (Module_ID, Module_Name, Description, Sequence_No, Course_ID)
VALUES
    (1, 'Python Basics', 'Syntax and variables', 1, 1),
    (2, 'SQL Normalization', '1NF, 2NF, 3NF', 1, 2),
    (3, 'Kinematics', 'Motion equations', 1, 3),
    (4, 'Derivatives', 'Chain rule', 1, 4);

-- Insert 4 records into ASSESSMENT
INSERT INTO ASSESSMENT (Assessment_ID, Assessment_Name, Assessment_Type, Max_Marks, Module_ID)
VALUES
    (1, 'Python Quiz 1', 'Quiz', 100.00, 1),
    (2, 'Normalization Test', 'Exam', 100.00, 2),
    (3, 'Physics Midterm', 'Exam', 100.00, 3),
    (4, 'Calculus Homework', 'Assignment', 50.00, 4);

-- Insert 35 records into ENROLLMENT
INSERT INTO ENROLLMENT (Enrollment_ID, Enroll_Date, Status, Completion_Date, Student_ID, Course_ID)
VALUES
    (1, '2026-08-01', 'Active', NULL, 1, 1),
    (2, '2026-08-01', 'Completed', '2026-09-01', 2, 2),
    (3, '2026-08-02', 'Active', NULL, 3, 3),
    (4, '2026-08-02', 'Active', NULL, 4, 4),
    (5, '2026-08-01', 'Completed', '2026-09-01', 1, 1),
    (6, '2026-08-01', 'Active', NULL, 2, 1),
    (7, '2026-08-02', 'Active', NULL, 3, 1),
    (8, '2026-08-03', 'Active', NULL, 4, 1),
    (9, '2026-08-04', 'Completed', '2026-09-04', 5, 1),
    (10, '2026-08-05', 'Active', NULL, 6, 1),
    (11, '2026-08-06', 'Active', NULL, 7, 1),
    (12, '2026-08-07', 'Active', NULL, 8, 1),
    (13, '2026-08-10', 'Active', NULL, 9, 2),
    (14, '2026-08-11', 'Active', NULL, 10, 2),
    (15, '2026-08-12', 'Completed', '2026-09-12', 11, 2),
    (16, '2026-08-13', 'Active', NULL, 12, 2),
    (17, '2026-08-14', 'Active', NULL, 13, 2),
    (18, '2026-08-15', 'Active', NULL, 14, 2),
    (19, '2026-08-16', 'Completed', '2026-09-16', 15, 2),
    (20, '2026-08-17', 'Active', NULL, 16, 2),
    (21, '2026-08-20', 'Active', NULL, 17, 3),
    (22, '2026-08-21', 'Active', NULL, 18, 3),
    (23, '2026-08-22', 'Active', NULL, 19, 3),
    (24, '2026-08-23', 'Completed', '2026-09-23', 20, 3),
    (25, '2026-08-24', 'Active', NULL, 21, 3),
    (26, '2026-08-25', 'Active', NULL, 22, 3),
    (27, '2026-08-26', 'Active', NULL, 23, 3),
    (28, '2026-08-27', 'Active', NULL, 24, 4),
    (29, '2026-08-28', 'Active', NULL, 25, 4),
    (30, '2026-08-29', 'Completed', '2026-09-29', 26, 4),
    (31, '2026-08-30', 'Active', NULL, 27, 4),
    (32, '2026-08-31', 'Active', NULL, 28, 4),
    (33, '2026-09-01', 'Active', NULL, 29, 4),
    (34, '2026-09-02', 'Completed', '2026-10-02', 30, 4),
    (36, '2026-10-06', 'Active', NULL, 31, 1);

-- Insert 35 records into PROGRESS
INSERT INTO PROGRESS (Progress_ID, Progress_Date, Completion_Percent, Status, Time_Spent, Student_ID, Module_ID)
VALUES
    (1, '2026-09-01', 100.00, 'Completed', 120, 1, 1),
    (2, '2026-09-01', 50.00, 'In Progress', 60, 2, 2),
    (3, '2026-09-02', 25.00, 'In Progress', 30, 3, 3),
    (4, '2026-09-03', 75.00, 'In Progress', 90, 4, 4),
    (5, '2026-09-01', 100.00, 'Completed', 120, 1, 1),
    (6, '2026-09-02', 50.00, 'In Progress', 60, 2, 1),
    (7, '2026-09-03', 75.00, 'In Progress', 90, 3, 1),
    (8, '2026-09-04', 25.00, 'In Progress', 30, 4, 1),
    (9, '2026-09-04', 100.00, 'Completed', 140, 5, 1),
    (10, '2026-09-05', 80.00, 'In Progress', 100, 6, 1),
    (11, '2026-09-06', 40.00, 'In Progress', 50, 7, 1),
    (12, '2026-09-07', 10.00, 'In Progress', 15, 8, 1),
    (13, '2026-09-10', 60.00, 'In Progress', 80, 9, 2),
    (14, '2026-09-11', 30.00, 'In Progress', 45, 10, 2),
    (15, '2026-09-12', 100.00, 'Completed', 150, 11, 2),
    (16, '2026-09-13', 90.00, 'In Progress', 120, 12, 2),
    (17, '2026-09-14', 15.00, 'In Progress', 20, 13, 2),
    (18, '2026-09-15', 70.00, 'In Progress', 95, 14, 2),
    (19, '2026-09-16', 100.00, 'Completed', 130, 15, 2),
    (20, '2026-09-17', 55.00, 'In Progress', 75, 16, 2),
    (21, '2026-09-20', 85.00, 'In Progress', 110, 17, 3),
    (22, '2026-09-21', 45.00, 'In Progress', 60, 18, 3),
    (23, '2026-09-22', 20.00, 'In Progress', 25, 19, 3),
    (24, '2026-09-23', 100.00, 'Completed', 160, 20, 3),
    (25, '2026-09-24', 65.00, 'In Progress', 85, 21, 3),
    (26, '2026-09-25', 5.00, 'In Progress', 10, 22, 3),
    (27, '2026-09-26', 95.00, 'In Progress', 125, 23, 3),
    (28, '2026-09-27', 35.00, 'In Progress', 40, 24, 4),
    (29, '2026-09-28', 50.00, 'In Progress', 70, 25, 4),
    (30, '2026-09-29', 100.00, 'Completed', 140, 26, 4),
    (31, '2026-09-30', 75.00, 'In Progress', 90, 27, 4),
    (32, '2026-10-01', 80.00, 'In Progress', 100, 28, 4),
    (33, '2026-10-02', 10.00, 'In Progress', 15, 29, 4),
    (34, '2026-10-02', 100.00, 'Completed', 135, 30, 4),
    (36, '2026-10-06', 0.00, 'In Progress', 0, 31, 1);

-- Insert 38 records into RESULT
INSERT INTO RESULT (Result_ID, Score, Attempt_No, Result_Date, Student_ID, Assessment_ID)
VALUES
    (1, 95.50, 1, '2026-09-05', 1, 1),
    (2, 82.00, 1, '2026-09-06', 2, 2),
    (3, 45.00, 1, '2026-09-07', 3, 3),
    (4, 48.50, 1, '2026-09-08', 4, 4),
    (5, 95.50, 1, '2026-09-05', 1, 1),
    (6, 45.00, 1, '2026-09-06', 2, 1),
    (7, 78.00, 1, '2026-09-07', 3, 1),
    (8, 30.00, 1, '2026-09-08', 4, 1),
    (9, 88.00, 1, '2026-09-09', 5, 1),
    (10, 82.50, 1, '2026-09-10', 6, 1),
    (11, 55.00, 1, '2026-09-11', 7, 1),
    (12, 20.00, 1, '2026-09-12', 8, 1),
    (13, 68.00, 1, '2026-09-15', 9, 2),
    (14, 40.00, 1, '2026-09-16', 10, 2),
    (15, 92.00, 1, '2026-09-17', 11, 2),
    (16, 85.00, 1, '2026-09-18', 12, 2),
    (17, 35.00, 1, '2026-09-19', 13, 2),
    (18, 72.00, 1, '2026-09-20', 14, 2),
    (19, 98.00, 1, '2026-09-21', 15, 2),
    (20, 60.00, 1, '2026-09-22', 16, 2),
    (21, 84.00, 1, '2026-09-25', 17, 3),
    (22, 48.00, 1, '2026-09-26', 18, 3),
    (23, 25.00, 1, '2026-09-27', 19, 3),
    (24, 91.00, 1, '2026-09-28', 20, 3),
    (25, 70.00, 1, '2026-09-29', 21, 3),
    (26, 15.00, 1, '2026-09-30', 22, 3),
    (27, 89.00, 1, '2026-10-01', 23, 3),
    (28, 20.00, 1, '2026-10-02', 24, 4),
    (29, 28.00, 1, '2026-10-03', 25, 4),
    (30, 48.00, 1, '2026-10-04', 26, 4),
    (31, 38.00, 1, '2026-10-05', 27, 4),
    (32, 42.00, 1, '2026-10-06', 28, 4),
    (33, 10.00, 1, '2026-10-07', 29, 4),
    (34, 45.00, 1, '2026-10-08', 30, 4),
    (35, 32.00, 2, '2026-09-10', 4, 1),
    (36, 42.00, 3, '2026-09-12', 4, 1),
    (37, 44.00, 2, '2026-09-18', 10, 2),
    (38, 48.00, 3, '2026-09-20', 10, 2);
