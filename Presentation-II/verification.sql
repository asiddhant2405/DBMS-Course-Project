-- =============================================================================
-- ONLINE COURSE LEARNING PROGRESS MANAGEMENT SYSTEM
-- Verification Queries & Referential Integrity Validation Script
-- =============================================================================

USE learningprogressdb;

-- 1. Table Row Counts (Must show records across all 8 tables)
SELECT 'instructor' AS Table_Name, COUNT(*) AS Total_Rows FROM instructor
UNION ALL SELECT 'student', COUNT(*) FROM student
UNION ALL SELECT 'course', COUNT(*) FROM course
UNION ALL SELECT 'module', COUNT(*) FROM module
UNION ALL SELECT 'assessment', COUNT(*) FROM assessment
UNION ALL SELECT 'enrollment', COUNT(*) FROM enrollment
UNION ALL SELECT 'progress', COUNT(*) FROM progress
UNION ALL SELECT 'result', COUNT(*) FROM result;

-- 2. Query 1 Verification: First-Year Students (Expected: exactly 14)
SELECT COUNT(*) AS First_Year_Count
FROM student
WHERE Year = 1;

SELECT Name, Department, Year
FROM student
WHERE Year = 1
ORDER BY Student_ID;

-- 3. Query 2 Verification: Courses taught by Dr. Alan Turing (Expected: exactly 2)
SELECT i.Name AS Instructor_Name,
       c.Course_Name,
       c.Category
FROM instructor i
JOIN course c
  ON i.Instructor_ID = c.Instructor_ID
WHERE i.Name = 'Dr. Alan Turing';

-- 4. Query 3 Verification: Students with their Course Enrollments
SELECT s.Student_ID,
       s.Name AS Student_Name,
       s.Department,
       c.Course_Name,
       e.Enroll_Date,
       e.Status AS Enrollment_Status
FROM enrollment e
JOIN student s ON e.Student_ID = s.Student_ID
JOIN course c ON e.Course_ID = c.Course_ID
LIMIT 10;

-- 5. Query 4 Verification: Student Module Learning Progress
SELECT s.Name AS Student_Name,
       c.Course_Name,
       m.Module_Name,
       p.Completion_Percent,
       p.Status AS Module_Status,
       p.Time_Spent
FROM progress p
JOIN student s ON p.Student_ID = s.Student_ID
JOIN module m ON p.Module_ID = m.Module_ID
JOIN course c ON m.Course_ID = c.Course_ID
LIMIT 10;

-- 6. Query 5 Verification: Assessment Results with Student Scores
SELECT s.Name AS Student_Name,
       a.Assessment_Name,
       a.Assessment_Type,
       a.Max_Marks,
       r.Score,
       r.Attempt_No,
       r.Result_Date
FROM result r
JOIN student s ON r.Student_ID = s.Student_ID
JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
LIMIT 10;

-- 7. Query 6 Verification: Department Distribution
SELECT Department, COUNT(*) AS Student_Count
FROM student
GROUP BY Department;

-- 8. Query 7 Verification: Course Completion Statistics
SELECT c.Course_ID,
       c.Course_Name,
       COUNT(DISTINCT e.Student_ID) AS Enrolled_Students,
       ROUND(AVG(p.Completion_Percent), 2) AS Avg_Progress_Percent,
       SUM(CASE WHEN p.Status = 'Completed' THEN 1 ELSE 0 END) AS Completed_Modules_Count
FROM course c
LEFT JOIN enrollment e ON c.Course_ID = e.Course_ID
LEFT JOIN module m ON c.Course_ID = m.Course_ID
LEFT JOIN progress p ON m.Module_ID = p.Module_ID AND e.Student_ID = p.Student_ID
GROUP BY c.Course_ID, c.Course_Name;

-- 9. Referential Integrity Validation (All counts should be 0)
SELECT 
    (SELECT COUNT(*) FROM course WHERE Instructor_ID NOT IN (SELECT Instructor_ID FROM instructor)) AS Orphan_Courses,
    (SELECT COUNT(*) FROM module WHERE Course_ID NOT IN (SELECT Course_ID FROM course)) AS Orphan_Modules,
    (SELECT COUNT(*) FROM assessment WHERE Module_ID NOT IN (SELECT Module_ID FROM module)) AS Orphan_Assessments,
    (SELECT COUNT(*) FROM enrollment WHERE Student_ID NOT IN (SELECT Student_ID FROM student) OR Course_ID NOT IN (SELECT Course_ID FROM course)) AS Orphan_Enrollments,
    (SELECT COUNT(*) FROM progress WHERE Student_ID NOT IN (SELECT Student_ID FROM student) OR Module_ID NOT IN (SELECT Module_ID FROM module)) AS Orphan_Progress,
    (SELECT COUNT(*) FROM result WHERE Student_ID NOT IN (SELECT Student_ID FROM student) OR Assessment_ID NOT IN (SELECT Assessment_ID FROM assessment)) AS Orphan_Results;
