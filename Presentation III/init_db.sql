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

-- Insert 4 Instructors
INSERT INTO
    INSTRUCTOR (
        Name,
        Email,
        Specialization,
        Phone
    )
VALUES (
        'Dr. Alan Turing',
        'alan@univ.edu',
        'Computer Science',
        '555-0101'
    ),
    (
        'Dr. Marie Curie',
        'marie@univ.edu',
        'Physics',
        '555-0102'
    ),
    (
        'Dr. Ada Lovelace',
        'ada@univ.edu',
        'Mathematics',
        '555-0103'
    ),
    (
        'Dr. Grace Hopper',
        'grace@univ.edu',
        'Software Eng',
        '555-0104'
    );

-- Insert 4 Courses
INSERT INTO
    COURSE (
        Course_Name,
        Description,
        Duration,
        Category,
        Level,
        Instructor_ID
    )
VALUES (
        'Intro to Python',
        'Learn basic Python',
        40,
        'Programming',
        'Beginner',
        1
    ),
    (
        'Database Systems',
        'SQL and Relational Algebra',
        45,
        'Computer Science',
        'Intermediate',
        4
    ),
    (
        'Applied Physics',
        'Mechanics and Thermodynamics',
        50,
        'Physics',
        'Advanced',
        2
    ),
    (
        'Calculus I',
        'Limits and Derivatives',
        30,
        'Mathematics',
        'Beginner',
        3
    );

-- Insert 4 Modules
INSERT INTO
    MODULE (
        Module_Name,
        Description,
        Sequence_No,
        Course_ID
    )
VALUES (
        'Python Basics',
        'Syntax and variables',
        1,
        1
    ),
    (
        'SQL Normalization',
        '1NF, 2NF, 3NF',
        1,
        2
    ),
    (
        'Kinematics',
        'Motion equations',
        1,
        3
    ),
    (
        'Derivatives',
        'Chain rule',
        1,
        4
    );

-- Insert 4 Assessments
INSERT INTO
    ASSESSMENT (
        Assessment_Name,
        Assessment_Type,
        Max_Marks,
        Module_ID
    )
VALUES (
        'Python Quiz 1',
        'Quiz',
        100.00,
        1
    ),
    (
        'Normalization Test',
        'Exam',
        100.00,
        2
    ),
    (
        'Physics Midterm',
        'Exam',
        100.00,
        3
    ),
    (
        'Calculus Homework',
        'Assignment',
        50.00,
        4
    );

-- Insert 30 Students
INSERT INTO
    STUDENT (
        Name,
        Email,
        Department,
        Year,
        Phone
    )
VALUES (
        'Aarav Patel',
        'aarav@univ.edu',
        'Computer Science',
        1,
        '555-1001'
    ),
    (
        'Aditi Sharma',
        'aditi@univ.edu',
        'Information Tech',
        1,
        '555-1002'
    ),
    (
        'Rohan Gupta',
        'rohan@univ.edu',
        'Computer Science',
        1,
        '555-1003'
    ),
    (
        'Sneha Reddy',
        'sneha@univ.edu',
        'Electronics',
        1,
        '555-1004'
    ),
    (
        'Karan Singh',
        'karan@univ.edu',
        'Computer Science',
        1,
        '555-1005'
    ),
    (
        'Priya Verma',
        'priya@univ.edu',
        'Information Tech',
        1,
        '555-1006'
    ),
    (
        'Rahul Desai',
        'rahul@univ.edu',
        'Computer Science',
        1,
        '555-1007'
    ),
    (
        'Ananya Nair',
        'ananya@univ.edu',
        'Electronics',
        1,
        '555-1008'
    ),
    (
        'Vikram Joshi',
        'vikram@univ.edu',
        'Computer Science',
        1,
        '555-1009'
    ),
    (
        'Neha Mehra',
        'neha@univ.edu',
        'Information Tech',
        1,
        '555-1010'
    ),
    (
        'Arjun Das',
        'arjun@univ.edu',
        'Computer Science',
        1,
        '555-1011'
    ),
    (
        'Kavya Iyer',
        'kavya@univ.edu',
        'Electronics',
        1,
        '555-1012'
    ),
    (
        'Dev Kumar',
        'dev@univ.edu',
        'Information Tech',
        1,
        '555-1013'
    ),
    (
        'Isha Rao',
        'isha@univ.edu',
        'Computer Science',
        1,
        '555-1014'
    ),
    (
        'Samir Jain',
        'samir@univ.edu',
        'Electronics',
        1,
        '555-1015'
    ),
    (
        'Maya Sen',
        'maya@univ.edu',
        'Computer Science',
        1,
        '555-1016'
    ),
    (
        'Kabir Bose',
        'kabir@univ.edu',
        'Information Tech',
        1,
        '555-1017'
    ),
    (
        'Tara Menon',
        'tara@univ.edu',
        'Computer Science',
        1,
        '555-1018'
    ),
    (
        'Yash Khanna',
        'yash@univ.edu',
        'Electronics',
        1,
        '555-1019'
    ),
    (
        'Sanya Kapoor',
        'sanya@univ.edu',
        'Information Tech',
        1,
        '555-1020'
    ),
    (
        'Aryan Bhat',
        'aryan@univ.edu',
        'Computer Science',
        1,
        '555-1021'
    ),
    (
        'Nisha Pillai',
        'nisha@univ.edu',
        'Electronics',
        1,
        '555-1022'
    ),
    (
        'Dhruv Ahuja',
        'dhruv@univ.edu',
        'Computer Science',
        1,
        '555-1023'
    ),
    (
        'Riya Ghosh',
        'riya@univ.edu',
        'Information Tech',
        1,
        '555-1024'
    ),
    (
        'Omkar Nath',
        'omkar@univ.edu',
        'Computer Science',
        1,
        '555-1025'
    ),
    (
        'Zara Sheikh',
        'zara@univ.edu',
        'Electronics',
        1,
        '555-1026'
    ),
    (
        'Vedant Soni',
        'vedant@univ.edu',
        'Information Tech',
        1,
        '555-1027'
    ),
    (
        'Mira Rajput',
        'mira@univ.edu',
        'Computer Science',
        1,
        '555-1028'
    ),
    (
        'Armaan Malik',
        'armaan@univ.edu',
        'Electronics',
        1,
        '555-1029'
    ),
    (
        'Pooja Hegde',
        'pooja@univ.edu',
        'Information Tech',
        1,
        '555-1030'
    ),
    (
        'Siddhant Agarwal',
        'asiddhant706@gmail.com',
        'Computer Science',
        1,
        '33142132'
    );

-- Insert 4 Enrollments
INSERT INTO
    ENROLLMENT (
        Enroll_Date,
        Status,
        Completion_Date,
        Student_ID,
        Course_ID
    )
VALUES (
        '2026-08-01',
        'Active',
        NULL,
        1,
        1
    ),
    (
        '2026-08-01',
        'Completed',
        '2026-09-01',
        2,
        2
    ),
    (
        '2026-08-02',
        'Active',
        NULL,
        3,
        3
    ),
    (
        '2026-08-02',
        'Active',
        NULL,
        4,
        4
    );

-- Insert 4 Progress Records
INSERT INTO
    PROGRESS (
        Progress_Date,
        Completion_Percent,
        Status,
        Time_Spent,
        Student_ID,
        Module_ID
    )
VALUES (
        '2026-09-01',
        100.00,
        'Completed',
        120,
        1,
        1
    ),
    (
        '2026-09-01',
        50.00,
        'In Progress',
        60,
        2,
        2
    ),
    (
        '2026-09-02',
        25.00,
        'In Progress',
        30,
        3,
        3
    ),
    (
        '2026-09-03',
        75.00,
        'In Progress',
        90,
        4,
        4
    );

-- Insert 4 Result Records
INSERT INTO
    RESULT (
        Score,
        Attempt_No,
        Result_Date,
        Student_ID,
        Assessment_ID
    )
VALUES (95.50, 1, '2026-09-05', 1, 1),
    (82.00, 1, '2026-09-06', 2, 2),
    (45.00, 1, '2026-09-07', 3, 3),
    (48.50, 1, '2026-09-08', 4, 4);

-- 1. Enroll all 30 students across the 4 available courses
INSERT INTO
    ENROLLMENT (
        Enroll_Date,
        Status,
        Completion_Date,
        Student_ID,
        Course_ID
    )
VALUES
    -- Course 1: Intro to Python (Students 1-8)
    (
        '2026-08-01',
        'Completed',
        '2026-09-01',
        1,
        1
    ),
    (
        '2026-08-01',
        'Active',
        NULL,
        2,
        1
    ),
    (
        '2026-08-02',
        'Active',
        NULL,
        3,
        1
    ),
    (
        '2026-08-03',
        'Active',
        NULL,
        4,
        1
    ),
    (
        '2026-08-04',
        'Completed',
        '2026-09-04',
        5,
        1
    ),
    (
        '2026-08-05',
        'Active',
        NULL,
        6,
        1
    ),
    (
        '2026-08-06',
        'Active',
        NULL,
        7,
        1
    ),
    (
        '2026-08-07',
        'Active',
        NULL,
        8,
        1
    ),

-- Course 2: Database Systems (Students 9-16)
(
    '2026-08-10',
    'Active',
    NULL,
    9,
    2
),
(
    '2026-08-11',
    'Active',
    NULL,
    10,
    2
),
(
    '2026-08-12',
    'Completed',
    '2026-09-12',
    11,
    2
),
(
    '2026-08-13',
    'Active',
    NULL,
    12,
    2
),
(
    '2026-08-14',
    'Active',
    NULL,
    13,
    2
),
(
    '2026-08-15',
    'Active',
    NULL,
    14,
    2
),
(
    '2026-08-16',
    'Completed',
    '2026-09-16',
    15,
    2
),
(
    '2026-08-17',
    'Active',
    NULL,
    16,
    2
),

-- Course 3: Applied Physics (Students 17-23)
(
    '2026-08-20',
    'Active',
    NULL,
    17,
    3
),
(
    '2026-08-21',
    'Active',
    NULL,
    18,
    3
),
(
    '2026-08-22',
    'Active',
    NULL,
    19,
    3
),
(
    '2026-08-23',
    'Completed',
    '2026-09-23',
    20,
    3
),
(
    '2026-08-24',
    'Active',
    NULL,
    21,
    3
),
(
    '2026-08-25',
    'Active',
    NULL,
    22,
    3
),
(
    '2026-08-26',
    'Active',
    NULL,
    23,
    3
),

-- Course 4: Calculus I (Students 24-30)
(
    '2026-08-27',
    'Active',
    NULL,
    24,
    4
),
(
    '2026-08-28',
    'Active',
    NULL,
    25,
    4
),
(
    '2026-08-29',
    'Completed',
    '2026-09-29',
    26,
    4
),
(
    '2026-08-30',
    'Active',
    NULL,
    27,
    4
),
(
    '2026-08-31',
    'Active',
    NULL,
    28,
    4
),
(
    '2026-09-01',
    'Active',
    NULL,
    29,
    4
),
(
    '2026-09-02',
    'Completed',
    '2026-10-02',
    30,
    4
),
(
    '2026-08-10',
    'Active',
    NULL,
    31,
    2
);

-- 2. Log Progress for all 30 students corresponding to their enrolled modules
INSERT INTO
    PROGRESS (
        Progress_Date,
        Completion_Percent,
        Status,
        Time_Spent,
        Student_ID,
        Module_ID
    )
VALUES
    -- Module 1 (Python)
    (
        '2026-09-01',
        100.00,
        'Completed',
        120,
        1,
        1
    ),
    (
        '2026-09-02',
        50.00,
        'In Progress',
        60,
        2,
        1
    ),
    (
        '2026-09-03',
        75.00,
        'In Progress',
        90,
        3,
        1
    ),
    (
        '2026-09-04',
        25.00,
        'In Progress',
        30,
        4,
        1
    ),
    (
        '2026-09-04',
        100.00,
        'Completed',
        140,
        5,
        1
    ),
    (
        '2026-09-05',
        80.00,
        'In Progress',
        100,
        6,
        1
    ),
    (
        '2026-09-06',
        40.00,
        'In Progress',
        50,
        7,
        1
    ),
    (
        '2026-09-07',
        10.00,
        'In Progress',
        15,
        8,
        1
    ),

-- Module 2 (SQL Normalization)
(
    '2026-09-10',
    60.00,
    'In Progress',
    80,
    9,
    2
),
(
    '2026-09-11',
    30.00,
    'In Progress',
    45,
    10,
    2
),
(
    '2026-09-12',
    100.00,
    'Completed',
    150,
    11,
    2
),
(
    '2026-09-13',
    90.00,
    'In Progress',
    120,
    12,
    2
),
(
    '2026-09-14',
    15.00,
    'In Progress',
    20,
    13,
    2
),
(
    '2026-09-15',
    70.00,
    'In Progress',
    95,
    14,
    2
),
(
    '2026-09-16',
    100.00,
    'Completed',
    130,
    15,
    2
),
(
    '2026-09-17',
    55.00,
    'In Progress',
    75,
    16,
    2
),

-- Module 3 (Kinematics)
(
    '2026-09-20',
    85.00,
    'In Progress',
    110,
    17,
    3
),
(
    '2026-09-21',
    45.00,
    'In Progress',
    60,
    18,
    3
),
(
    '2026-09-22',
    20.00,
    'In Progress',
    25,
    19,
    3
),
(
    '2026-09-23',
    100.00,
    'Completed',
    160,
    20,
    3
),
(
    '2026-09-24',
    65.00,
    'In Progress',
    85,
    21,
    3
),
(
    '2026-09-25',
    5.00,
    'In Progress',
    10,
    22,
    3
),
(
    '2026-09-26',
    95.00,
    'In Progress',
    125,
    23,
    3
),

-- Module 4 (Derivatives)
(
    '2026-09-27',
    35.00,
    'In Progress',
    40,
    24,
    4
),
(
    '2026-09-28',
    50.00,
    'In Progress',
    70,
    25,
    4
),
(
    '2026-09-29',
    100.00,
    'Completed',
    140,
    26,
    4
),
(
    '2026-09-30',
    75.00,
    'In Progress',
    90,
    27,
    4
),
(
    '2026-10-01',
    80.00,
    'In Progress',
    100,
    28,
    4
),
(
    '2026-10-02',
    10.00,
    'In Progress',
    15,
    29,
    4
),
(
    '2026-10-02',
    100.00,
    'Completed',
    135,
    30,
    4
),
(
    '2026-09-15',
    92.00,
    'In Progress',
    115,
    31,
    2
);

-- 3. Generate Assessment Results for all 30 students
INSERT INTO
    RESULT (
        Score,
        Attempt_No,
        Result_Date,
        Student_ID,
        Assessment_ID
    )
VALUES
    -- Assessment 1 (Python Quiz 1 - Max 100)
    (95.50, 1, '2026-09-05', 1, 1),
    (45.00, 1, '2026-09-06', 2, 1),
    (78.00, 1, '2026-09-07', 3, 1),
    (30.00, 1, '2026-09-08', 4, 1),
    (88.00, 1, '2026-09-09', 5, 1),
    (82.50, 1, '2026-09-10', 6, 1),
    (55.00, 1, '2026-09-11', 7, 1),
    (20.00, 1, '2026-09-12', 8, 1),

-- Assessment 2 (Normalization Test - Max 100)
(68.00, 1, '2026-09-15', 9, 2),
(40.00, 1, '2026-09-16', 10, 2),
(92.00, 1, '2026-09-17', 11, 2),
(85.00, 1, '2026-09-18', 12, 2),
(35.00, 1, '2026-09-19', 13, 2),
(72.00, 1, '2026-09-20', 14, 2),
(98.00, 1, '2026-09-21', 15, 2),
(60.00, 1, '2026-09-22', 16, 2),

-- Assessment 3 (Physics Midterm - Max 100)
(84.00, 1, '2026-09-25', 17, 3),
(48.00, 1, '2026-09-26', 18, 3),
(25.00, 1, '2026-09-27', 19, 3),
(91.00, 1, '2026-09-28', 20, 3),
(70.00, 1, '2026-09-29', 21, 3),
(15.00, 1, '2026-09-30', 22, 3),
(89.00, 1, '2026-10-01', 23, 3),

-- Assessment 4 (Calculus Homework - Max 50)
(20.00, 1, '2026-10-02', 24, 4),
(28.00, 1, '2026-10-03', 25, 4),
(48.00, 1, '2026-10-04', 26, 4),
(38.00, 1, '2026-10-05', 27, 4),
(42.00, 1, '2026-10-06', 28, 4),
(10.00, 1, '2026-10-07', 29, 4),
(45.00, 1, '2026-10-08', 30, 4);

-- Add a few extra attempts to trigger the 'failed >= 3 times' query from earlier
INSERT INTO
    RESULT (
        Score,
        Attempt_No,
        Result_Date,
        Student_ID,
        Assessment_ID
    )
VALUES (32.00, 2, '2026-09-10', 4, 1),
    (42.00, 3, '2026-09-12', 4, 1),
    (44.00, 2, '2026-09-18', 10, 2),
    (48.00, 3, '2026-09-20', 10, 2),
    (96.50, 1, '2026-09-20', 31, 2);

-- Guarantee next auto_increment is one higher than the greatest student id
ALTER TABLE STUDENT AUTO_INCREMENT = 32;