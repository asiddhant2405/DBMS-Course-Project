-- =============================================================================
-- ONLINE COURSE LEARNING PROGRESS MANAGEMENT SYSTEM
-- Seed Script: Deterministic Demonstration Data
-- Academic Course: B.Tech 2nd Year DBMS Course Project
-- Student: Siddhant Agarwal (Roll No: 25WU0102262, Section: AIML Whales)
-- Partner: Manthena Naga Sri Rohan (Roll No: 25WU0102151, Section: AIML Panthers)
-- =============================================================================

USE learningprogressdb;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. SEED INSTRUCTOR (3 Instructors)
-- -----------------------------------------------------------------------------
INSERT INTO instructor (Instructor_ID, Name, Email, Specialization, Phone) VALUES
(1, 'Dr. Alan Turing', 'alan@univ.edu', 'Computer Science', '555-0001'),
(2, 'Dr. Ada Lovelace', 'ada@univ.edu', 'Information Tech', '555-0002'),
(3, 'Dr. CV Raman', 'raman@univ.edu', 'Electronics', '555-0003')
ON DUPLICATE KEY UPDATE 
    Name = VALUES(Name), 
    Email = VALUES(Email), 
    Specialization = VALUES(Specialization), 
    Phone = VALUES(Phone);

-- -----------------------------------------------------------------------------
-- 2. SEED STUDENT (Exactly 30 Students matching Slide 4 & 5)
-- Exactly 14 in Year 1, 9 in Year 2, 7 in Year 3.
-- Departments: Computer Science, Information Tech, Electronics.
-- -----------------------------------------------------------------------------
INSERT INTO student (Student_ID, Name, Email, Department, Year, Phone) VALUES
(1, 'Aarav Patel', 'aarav@univ.edu', 'Computer Science', 1, '555-1001'),
(2, 'Aditi Sharma', 'aditi@univ.edu', 'Information Tech', 2, '555-1002'),
(3, 'Rohan Gupta', 'rohan@univ.edu', 'Computer Science', 1, '555-1003'),
(4, 'Sneha Reddy', 'sneha@univ.edu', 'Electronics', 3, '555-1004'),
(5, 'Karan Singh', 'karan@univ.edu', 'Computer Science', 2, '555-1005'),
(6, 'Priya Verma', 'priya@univ.edu', 'Information Tech', 1, '555-1006'),
(7, 'Rahul Desai', 'rahul@univ.edu', 'Computer Science', 1, '555-1007'),
(8, 'Ananya Nair', 'ananya@univ.edu', 'Electronics', 2, '555-1008'),
(9, 'Vikram Joshi', 'vikram@univ.edu', 'Computer Science', 3, '555-1009'),
(10, 'Neha Mehra', 'neha@univ.edu', 'Information Tech', 1, '555-1010'),
(11, 'Arjun Das', 'arjun@univ.edu', 'Computer Science', 2, '555-1011'),
(12, 'Kavya Iyer', 'kavya@univ.edu', 'Electronics', 1, '555-1012'),
(13, 'Dev Kumar', 'dev@univ.edu', 'Information Tech', 3, '555-1013'),
(14, 'Isha Rao', 'isha@univ.edu', 'Computer Science', 1, '555-1014'),
(15, 'Samir Jain', 'samir@univ.edu', 'Electronics', 2, '555-1015'),
(16, 'Maya Sen', 'maya@univ.edu', 'Computer Science', 1, '555-1016'),
(17, 'Kabir Bose', 'kabir@univ.edu', 'Information Tech', 3, '555-1017'),
(18, 'Tara Menon', 'tara@univ.edu', 'Computer Science', 2, '555-1018'),
(19, 'Yash Khanna', 'yash@univ.edu', 'Electronics', 1, '555-1019'),
(20, 'Sanya Kapoor', 'sanya@univ.edu', 'Information Tech', 1, '555-1020'),
(21, 'Aryan Bhat', 'aryan@univ.edu', 'Computer Science', 2, '555-1021'),
(22, 'Nisha Pillai', 'nisha@univ.edu', 'Electronics', 3, '555-1022'),
(23, 'Dhruv Ahuja', 'dhruv@univ.edu', 'Computer Science', 1, '555-1023'),
(24, 'Riya Ghosh', 'riya@univ.edu', 'Information Tech', 2, '555-1024'),
(25, 'Omkar Nath', 'omkar@univ.edu', 'Computer Science', 1, '555-1025'),
(26, 'Zara Sheikh', 'zara@univ.edu', 'Electronics', 1, '555-1026'),
(27, 'Vedant Soni', 'vedant@univ.edu', 'Information Tech', 2, '555-1027'),
(28, 'Mira Rajput', 'mira@univ.edu', 'Computer Science', 3, '555-1028'),
(29, 'Armaan Malik', 'armaan@univ.edu', 'Electronics', 1, '555-1029'),
(30, 'Pooja Hegde', 'pooja@univ.edu', 'Information Tech', 2, '555-1030')
ON DUPLICATE KEY UPDATE 
    Name = VALUES(Name), 
    Email = VALUES(Email), 
    Department = VALUES(Department), 
    Year = VALUES(Year), 
    Phone = VALUES(Phone);

-- -----------------------------------------------------------------------------
-- 3. SEED COURSE
-- Dr. Alan Turing (Instructor 1) teaches exactly 2 courses:
--   - Course 101: Intro to Python
--   - Course 102: Database Systems
-- Dr. Ada Lovelace (Instructor 2) teaches:
--   - Course 104: Cloud & Web Architecture
-- Dr. CV Raman (Instructor 3) teaches:
--   - Course 103: Circuits & Systems
-- -----------------------------------------------------------------------------
INSERT INTO course (Course_ID, Course_Name, Description, Category, Duration, Level, Instructor_ID) VALUES
(101, 'Intro to Python', 'Basics of Python Programming', 'Programming', '4 Weeks', 'Beginner', 1),
(102, 'Database Systems', 'RDBMS and SQL Design', 'Computer Science', '8 Weeks', 'Intermediate', 1),
(103, 'Circuits & Systems', 'Basic Electronics and Logic', 'Electronics', '6 Weeks', 'Beginner', 3),
(104, 'Cloud & Web Architecture', 'Modern Cloud Solutions and Scalability', 'Information Tech', '6 Weeks', 'Intermediate', 2)
ON DUPLICATE KEY UPDATE 
    Course_Name = VALUES(Course_Name), 
    Description = VALUES(Description), 
    Category = VALUES(Category), 
    Duration = VALUES(Duration), 
    Level = VALUES(Level), 
    Instructor_ID = VALUES(Instructor_ID);

-- -----------------------------------------------------------------------------
-- 4. SEED MODULE
-- -----------------------------------------------------------------------------
INSERT INTO module (Module_ID, Module_Name, Description, Sequence_No, Course_ID) VALUES
(201, 'Python Syntax', 'Variables, Data Types, and Loops', 1, 101),
(202, 'Functions & OOP', 'Classes, Objects, and Methods', 2, 101),
(203, 'ER Modeling', 'Entity-Relationship Diagrams', 1, 102),
(204, 'SQL Queries', 'Joins, Views, and Subqueries', 2, 102),
(205, 'Ohm Law & Power', 'Basic circuit theory and equations', 1, 103),
(206, 'Digital Logic', 'Logic Gates and Boolean Algebra', 2, 103),
(207, 'Cloud Fundamentals', 'Virtualization, Containers and VPC', 1, 104),
(208, 'Web APIs & Microservices', 'RESTful services and API design', 2, 104)
ON DUPLICATE KEY UPDATE 
    Module_Name = VALUES(Module_Name), 
    Description = VALUES(Description), 
    Sequence_No = VALUES(Sequence_No), 
    Course_ID = VALUES(Course_ID);

-- -----------------------------------------------------------------------------
-- 5. SEED ASSESSMENT
-- -----------------------------------------------------------------------------
INSERT INTO assessment (Assessment_ID, Assessment_Name, Assessment_Type, Max_Marks, Module_ID) VALUES
(301, 'Python Quiz 1', 'Quiz', 50, 201),
(302, 'Python Mini-Project', 'Assignment', 100, 202),
(303, 'ER Diagram Task', 'Assignment', 50, 203),
(304, 'SQL Final Test', 'Exam', 100, 204),
(305, 'Circuit Theory Quiz', 'Quiz', 50, 205),
(306, 'Logic Design Exam', 'Exam', 100, 206),
(307, 'Cloud Architecture Quiz', 'Quiz', 50, 207),
(308, 'Microservice Deployment Project', 'Assignment', 100, 208)
ON DUPLICATE KEY UPDATE 
    Assessment_Name = VALUES(Assessment_Name), 
    Assessment_Type = VALUES(Assessment_Type), 
    Max_Marks = VALUES(Max_Marks), 
    Module_ID = VALUES(Module_ID);

-- -----------------------------------------------------------------------------
-- 6. SEED ENROLLMENT (30 Registrations)
-- -----------------------------------------------------------------------------
INSERT INTO enrollment (Enrollment_ID, Enroll_Date, Status, Completion_Date, Student_ID, Course_ID) VALUES
(1, '2026-08-01', 'Completed', '2026-08-30', 1, 101),
(2, '2026-08-02', 'Active', NULL, 2, 101),
(3, '2026-08-03', 'Active', NULL, 3, 101),
(4, '2026-08-04', 'Completed', '2026-09-02', 4, 101),
(5, '2026-08-05', 'Active', NULL, 5, 101),
(6, '2026-08-06', 'Active', NULL, 6, 101),
(7, '2026-08-07', 'Completed', '2026-09-05', 7, 101),
(8, '2026-08-08', 'Active', NULL, 8, 101),
(9, '2026-08-09', 'Active', NULL, 9, 101),
(10, '2026-08-10', 'Completed', '2026-09-08', 10, 101),
(11, '2026-08-01', 'Active', NULL, 11, 102),
(12, '2026-08-02', 'Completed', '2026-09-20', 12, 102),
(13, '2026-08-03', 'Active', NULL, 13, 102),
(14, '2026-08-04', 'Active', NULL, 14, 102),
(15, '2026-08-05', 'Completed', '2026-09-25', 15, 102),
(16, '2026-08-06', 'Active', NULL, 16, 102),
(17, '2026-08-07', 'Active', NULL, 17, 102),
(18, '2026-08-08', 'Completed', '2026-09-28', 18, 102),
(19, '2026-08-09', 'Active', NULL, 19, 102),
(20, '2026-08-10', 'Active', NULL, 20, 102),
(21, '2026-08-01', 'Completed', '2026-09-15', 21, 103),
(22, '2026-08-02', 'Active', NULL, 22, 103),
(23, '2026-08-03', 'Active', NULL, 23, 103),
(24, '2026-08-04', 'Completed', '2026-09-18', 24, 103),
(25, '2026-08-05', 'Active', NULL, 25, 103),
(26, '2026-08-06', 'Active', NULL, 26, 103),
(27, '2026-08-07', 'Completed', '2026-09-20', 27, 103),
(28, '2026-08-08', 'Active', NULL, 28, 103),
(29, '2026-08-09', 'Active', NULL, 29, 103),
(30, '2026-08-10', 'Completed', '2026-09-22', 30, 103)
ON DUPLICATE KEY UPDATE 
    Enroll_Date = VALUES(Enroll_Date), 
    Status = VALUES(Status), 
    Completion_Date = VALUES(Completion_Date), 
    Student_ID = VALUES(Student_ID), 
    Course_ID = VALUES(Course_ID);

-- -----------------------------------------------------------------------------
-- 7. SEED PROGRESS (60 Module Tracking Records)
-- -----------------------------------------------------------------------------
INSERT INTO progress (Progress_ID, Progress_Date, Completion_Percent, Status, Time_Spent, Student_ID, Module_ID) VALUES
(1, '2026-08-15', 100.00, 'Completed', 120, 1, 201),
(2, '2026-08-25', 100.00, 'Completed', 150, 1, 202),
(3, '2026-08-16', 100.00, 'Completed', 130, 2, 201),
(4, '2026-08-26', 50.00, 'In Progress', 80, 2, 202),
(5, '2026-08-17', 100.00, 'Completed', 110, 3, 201),
(6, '2026-08-27', 60.00, 'In Progress', 90, 3, 202),
(7, '2026-08-18', 100.00, 'Completed', 140, 4, 201),
(8, '2026-08-28', 100.00, 'Completed', 160, 4, 202),
(9, '2026-08-19', 100.00, 'Completed', 125, 5, 201),
(10, '2026-08-29', 75.00, 'In Progress', 100, 5, 202),
(11, '2026-08-20', 100.00, 'Completed', 115, 6, 201),
(12, '2026-08-30', 40.00, 'In Progress', 60, 6, 202),
(13, '2026-08-21', 100.00, 'Completed', 135, 7, 201),
(14, '2026-09-01', 100.00, 'Completed', 145, 7, 202),
(15, '2026-08-22', 100.00, 'Completed', 105, 8, 201),
(16, '2026-09-02', 30.00, 'In Progress', 45, 8, 202),
(17, '2026-08-23', 100.00, 'Completed', 125, 9, 201),
(18, '2026-09-03', 80.00, 'In Progress', 110, 9, 202),
(19, '2026-08-24', 100.00, 'Completed', 145, 10, 201),
(20, '2026-09-04', 100.00, 'Completed', 155, 10, 202),
(21, '2026-08-15', 100.00, 'Completed', 180, 11, 203),
(22, '2026-08-25', 50.00, 'In Progress', 100, 11, 204),
(23, '2026-08-16', 100.00, 'Completed', 190, 12, 203),
(24, '2026-08-26', 100.00, 'Completed', 200, 12, 204),
(25, '2026-08-17', 100.00, 'Completed', 170, 13, 203),
(26, '2026-08-27', 40.00, 'In Progress', 80, 13, 204),
(27, '2026-08-18', 100.00, 'Completed', 160, 14, 203),
(28, '2026-08-28', 60.00, 'In Progress', 120, 14, 204),
(29, '2026-08-19', 100.00, 'Completed', 200, 15, 203),
(30, '2026-08-29', 100.00, 'Completed', 210, 15, 204),
(31, '2026-08-20', 100.00, 'Completed', 150, 16, 203),
(32, '2026-08-30', 20.00, 'In Progress', 40, 16, 204),
(33, '2026-08-21', 100.00, 'Completed', 180, 17, 203),
(34, '2026-09-01', 90.00, 'In Progress', 170, 17, 204),
(35, '2026-08-22', 100.00, 'Completed', 195, 18, 203),
(36, '2026-09-02', 100.00, 'Completed', 205, 18, 204),
(37, '2026-08-23', 100.00, 'Completed', 165, 19, 203),
(38, '2026-09-03', 75.00, 'In Progress', 140, 19, 204),
(39, '2026-08-24', 100.00, 'Completed', 175, 20, 203),
(40, '2026-09-04', 85.00, 'In Progress', 160, 20, 204),
(41, '2026-08-15', 100.00, 'Completed', 140, 21, 205),
(42, '2026-08-25', 100.00, 'Completed', 150, 21, 206),
(43, '2026-08-16', 100.00, 'Completed', 130, 22, 205),
(44, '2026-08-26', 60.00, 'In Progress', 90, 22, 206),
(45, '2026-08-17', 100.00, 'Completed', 150, 23, 205),
(46, '2026-08-27', 45.00, 'In Progress', 70, 23, 206),
(47, '2026-08-18', 100.00, 'Completed', 160, 24, 205),
(48, '2026-08-28', 100.00, 'Completed', 170, 24, 206),
(49, '2026-08-19', 100.00, 'Completed', 120, 25, 205),
(50, '2026-08-29', 55.00, 'In Progress', 85, 25, 206),
(51, '2026-08-20', 100.00, 'Completed', 145, 26, 205),
(52, '2026-08-30', 80.00, 'In Progress', 125, 26, 206),
(53, '2026-08-21', 100.00, 'Completed', 155, 27, 205),
(54, '2026-09-01', 100.00, 'Completed', 165, 27, 206),
(55, '2026-08-22', 100.00, 'Completed', 135, 28, 205),
(56, '2026-09-02', 40.00, 'In Progress', 60, 28, 206),
(57, '2026-08-23', 100.00, 'Completed', 140, 29, 205),
(58, '2026-09-03', 75.00, 'In Progress', 110, 29, 206),
(59, '2026-08-24', 100.00, 'Completed', 165, 30, 205),
(60, '2026-09-04', 100.00, 'Completed', 175, 30, 206)
ON DUPLICATE KEY UPDATE 
    Progress_Date = VALUES(Progress_Date), 
    Completion_Percent = VALUES(Completion_Percent), 
    Status = VALUES(Status), 
    Time_Spent = VALUES(Time_Spent), 
    Student_ID = VALUES(Student_ID), 
    Module_ID = VALUES(Module_ID);

-- -----------------------------------------------------------------------------
-- 8. SEED RESULT (60 Assessment Results)
-- -----------------------------------------------------------------------------
INSERT INTO result (Result_ID, Score, Attempt_No, Result_Date, Student_ID, Assessment_ID) VALUES
(1, 45.00, 1, '2026-08-20', 1, 301),
(2, 92.50, 1, '2026-08-30', 1, 302),
(3, 38.00, 1, '2026-08-21', 2, 301),
(4, NULL, NULL, NULL, 2, 302),
(5, 42.00, 1, '2026-08-22', 3, 301),
(6, NULL, NULL, NULL, 3, 302),
(7, 48.00, 1, '2026-08-23', 4, 301),
(8, 88.00, 1, '2026-09-02', 4, 302),
(9, 41.00, 1, '2026-08-24', 5, 301),
(10, NULL, NULL, NULL, 5, 302),
(11, 35.00, 1, '2026-08-25', 6, 301),
(12, NULL, NULL, NULL, 6, 302),
(13, 49.00, 1, '2026-08-26', 7, 301),
(14, 95.00, 1, '2026-09-05', 7, 302),
(15, 36.00, 1, '2026-08-27', 8, 301),
(16, NULL, NULL, NULL, 8, 302),
(17, 44.00, 1, '2026-08-28', 9, 301),
(18, NULL, NULL, NULL, 9, 302),
(19, 50.00, 1, '2026-08-29', 10, 301),
(20, 98.00, 1, '2026-09-08', 10, 302),
(21, 42.00, 1, '2026-08-20', 11, 303),
(22, NULL, NULL, NULL, 11, 304),
(23, 48.00, 1, '2026-08-21', 12, 303),
(24, 89.00, 1, '2026-09-20', 12, 304),
(25, 39.00, 1, '2026-08-22', 13, 303),
(26, NULL, NULL, NULL, 13, 304),
(27, 45.00, 1, '2026-08-23', 14, 303),
(28, NULL, NULL, NULL, 14, 304),
(29, 49.50, 1, '2026-08-24', 15, 303),
(30, 94.00, 1, '2026-09-25', 15, 304),
(31, 34.00, 1, '2026-08-25', 16, 303),
(32, NULL, NULL, NULL, 16, 304),
(33, 47.00, 1, '2026-08-26', 17, 303),
(34, NULL, NULL, NULL, 17, 304),
(35, 50.00, 1, '2026-08-27', 18, 303),
(36, 91.00, 1, '2026-09-28', 18, 304),
(37, 41.00, 1, '2026-08-28', 19, 303),
(38, NULL, NULL, NULL, 19, 304),
(39, 46.00, 1, '2026-08-29', 20, 303),
(40, NULL, NULL, NULL, 20, 304),
(41, 44.00, 1, '2026-08-20', 21, 305),
(42, 85.00, 1, '2026-09-15', 21, 306),
(43, 37.00, 1, '2026-08-21', 22, 305),
(44, NULL, NULL, NULL, 22, 306),
(45, 43.00, 1, '2026-08-22', 23, 305),
(46, NULL, NULL, NULL, 23, 306),
(47, 48.00, 1, '2026-08-23', 24, 305),
(48, 92.00, 1, '2026-09-18', 24, 306),
(49, 35.00, 1, '2026-08-24', 25, 305),
(50, NULL, NULL, NULL, 25, 306),
(51, 46.50, 1, '2026-08-25', 26, 305),
(52, NULL, NULL, NULL, 26, 306),
(53, 49.00, 1, '2026-08-26', 27, 305),
(54, 96.00, 1, '2026-09-20', 27, 306),
(55, 38.00, 1, '2026-08-27', 28, 305),
(56, NULL, NULL, NULL, 28, 306),
(57, 42.00, 1, '2026-08-28', 29, 305),
(58, NULL, NULL, NULL, 29, 306),
(59, 47.00, 1, '2026-08-29', 30, 305),
(60, 89.00, 1, '2026-09-22', 30, 306)
ON DUPLICATE KEY UPDATE 
    Score = VALUES(Score), 
    Attempt_No = VALUES(Attempt_No), 
    Result_Date = VALUES(Result_Date), 
    Student_ID = VALUES(Student_ID), 
    Assessment_ID = VALUES(Assessment_ID);

SET FOREIGN_KEY_CHECKS = 1;
