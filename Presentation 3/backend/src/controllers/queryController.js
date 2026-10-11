import pool from '../config/db.js';

// Predefined query registry ensuring safe execution without arbitrary string injection
const PREDEFINED_QUERIES = {
  'first-year-students': {
    id: 'first-year-students',
    title: 'Query 1: First-Year Students Filter',
    description: 'Retrieves all undergraduate students currently enrolled in academic Year 1 regardless of department.',
    presentationNote: 'Matches Presentation Slide 05 exactly. Expected result: exactly 14 students.',
    sql: `SELECT Name, Department, Year
FROM student
WHERE Year = 1
ORDER BY Student_ID;`,
    executableSql: `SELECT Student_ID, Name, Department, Year, Email, Phone
FROM student
WHERE Year = 1
ORDER BY Student_ID;`
  },
  'instructor-courses': {
    id: 'instructor-courses',
    title: 'Query 2: Instructor-Course Relational JOIN',
    description: 'Performs an INNER JOIN between INSTRUCTOR and COURSE to display instructors and courses they teach.',
    presentationNote: 'Matches Presentation Slide 06. Confirms Dr. Alan Turing teaches exactly two courses.',
    sql: `SELECT i.Name AS Instructor_Name,
       c.Course_Name,
       c.Category
FROM instructor i
JOIN course c
  ON i.Instructor_ID = c.Instructor_ID
ORDER BY i.Instructor_ID, c.Course_ID;`,
    executableSql: `SELECT i.Instructor_ID, i.Name AS Instructor_Name, i.Specialization,
       c.Course_ID, c.Course_Name, c.Category, c.Level
FROM instructor i
JOIN course c
  ON i.Instructor_ID = c.Instructor_ID
ORDER BY i.Instructor_ID, c.Course_ID;`
  },
  'student-enrollments': {
    id: 'student-enrollments',
    title: 'Query 3: Student Enrollments (3-Table JOIN)',
    description: 'Joins STUDENT, ENROLLMENT, and COURSE to display each registered learner alongside their course status.',
    presentationNote: 'Demonstrates many-to-many relationship resolution through the associative ENROLLMENT entity.',
    sql: `SELECT s.Student_ID,
       s.Name AS Student_Name,
       s.Department,
       c.Course_Name,
       e.Enroll_Date,
       e.Status AS Enrollment_Status
FROM enrollment e
JOIN student s ON e.Student_ID = s.Student_ID
JOIN course c ON e.Course_ID = c.Course_ID
ORDER BY e.Enrollment_ID ASC;`,
    executableSql: `SELECT s.Student_ID,
       s.Name AS Student_Name,
       s.Department,
       c.Course_Name,
       e.Enroll_Date,
       e.Status AS Enrollment_Status,
       e.Completion_Date
FROM enrollment e
JOIN student s ON e.Student_ID = s.Student_ID
JOIN course c ON e.Course_ID = c.Course_ID
ORDER BY e.Enrollment_ID ASC;`
  },
  'student-progress': {
    id: 'student-progress',
    title: 'Query 4: Student Learning Progress (4-Table JOIN)',
    description: 'Correlates learner progress with course modules, showing real-time completion percentages and hours spent.',
    presentationNote: 'Demonstrates hierarchical navigation across Student -> Progress -> Module -> Course.',
    sql: `SELECT s.Name AS Student_Name,
       c.Course_Name,
       m.Module_Name,
       p.Completion_Percent,
       p.Status AS Module_Status,
       p.Time_Spent
FROM progress p
JOIN student s ON p.Student_ID = s.Student_ID
JOIN module m ON p.Module_ID = m.Module_ID
JOIN course c ON m.Course_ID = c.Course_ID
ORDER BY p.Progress_ID ASC;`,
    executableSql: `SELECT p.Progress_ID,
       s.Name AS Student_Name,
       c.Course_Name,
       m.Module_Name,
       p.Completion_Percent,
       p.Status AS Module_Status,
       p.Time_Spent,
       p.Progress_Date
FROM progress p
JOIN student s ON p.Student_ID = s.Student_ID
JOIN module m ON p.Module_ID = m.Module_ID
JOIN course c ON m.Course_ID = c.Course_ID
ORDER BY p.Progress_ID ASC;`
  },
  'assessment-results': {
    id: 'assessment-results',
    title: 'Query 5: Assessment Results & Scores (4-Table JOIN)',
    description: 'Brings together student profiles, module assessments, and examination scores with attempt numbering.',
    presentationNote: 'Shows multi-table foreign-key linkage between results, assessments, modules, and learners.',
    sql: `SELECT s.Name AS Student_Name,
       a.Assessment_Name,
       a.Assessment_Type,
       a.Max_Marks,
       r.Score,
       r.Attempt_No,
       r.Result_Date
FROM result r
JOIN student s ON r.Student_ID = s.Student_ID
JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
ORDER BY r.Result_ID ASC;`,
    executableSql: `SELECT r.Result_ID,
       s.Name AS Student_Name,
       s.Department,
       a.Assessment_Name,
       a.Assessment_Type,
       a.Max_Marks,
       r.Score,
       r.Attempt_No,
       r.Result_Date
FROM result r
JOIN student s ON r.Student_ID = s.Student_ID
JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
ORDER BY r.Result_ID ASC;`
  },
  'department-distribution': {
    id: 'department-distribution',
    title: 'Query 6: Department-Wise Student Distribution (GROUP BY)',
    description: 'Uses aggregate function COUNT(*) with GROUP BY to analyze learner concentration across academic departments.',
    presentationNote: 'Demonstrates SQL aggregation and percentage calculations across the 30 seeded student profiles.',
    sql: `SELECT Department,
       COUNT(*) AS Total_Students,
       ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM student)), 1) AS Percentage
FROM student
GROUP BY Department
ORDER BY Total_Students DESC;`,
    executableSql: `SELECT Department,
       COUNT(*) AS Total_Students,
       ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM student)), 1) AS Percentage
FROM student
GROUP BY Department
ORDER BY Total_Students DESC;`
  },
  'course-completion': {
    id: 'course-completion',
    title: 'Query 7: Course Completion Summary (Aggregates & LEFT JOINs)',
    description: 'Summarizes enrollment counts, average learner progress percentages, and completed modules per course.',
    presentationNote: 'Demonstrates advanced analytical aggregation combining LEFT JOINs, AVG, and conditional SUM.',
    sql: `SELECT c.Course_ID,
       c.Course_Name,
       COUNT(DISTINCT e.Student_ID) AS Enrolled_Students,
       ROUND(COALESCE(AVG(p.Completion_Percent), 0), 2) AS Avg_Progress_Percent,
       SUM(CASE WHEN p.Status = 'Completed' THEN 1 ELSE 0 END) AS Completed_Modules_Count
FROM course c
LEFT JOIN enrollment e ON c.Course_ID = e.Course_ID
LEFT JOIN module m ON c.Course_ID = m.Course_ID
LEFT JOIN progress p ON m.Module_ID = p.Module_ID AND e.Student_ID = p.Student_ID
GROUP BY c.Course_ID, c.Course_Name
ORDER BY c.Course_ID ASC;`,
    executableSql: `SELECT c.Course_ID,
       c.Course_Name,
       COUNT(DISTINCT e.Student_ID) AS Enrolled_Students,
       ROUND(COALESCE(AVG(p.Completion_Percent), 0), 2) AS Avg_Progress_Percent,
       SUM(CASE WHEN p.Status = 'Completed' THEN 1 ELSE 0 END) AS Completed_Modules_Count
FROM course c
LEFT JOIN enrollment e ON c.Course_ID = e.Course_ID
LEFT JOIN module m ON c.Course_ID = m.Course_ID
LEFT JOIN progress p ON m.Module_ID = p.Module_ID AND e.Student_ID = p.Student_ID
GROUP BY c.Course_ID, c.Course_Name
ORDER BY c.Course_ID ASC;`
  }
};

export const listPredefinedQueries = (req, res) => {
  const queryList = Object.values(PREDEFINED_QUERIES).map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    presentationNote: q.presentationNote,
    sql: q.sql
  }));

  res.json({ success: true, queries: queryList });
};

export const executePredefinedQuery = async (req, res, next) => {
  try {
    const { queryKey } = req.params;
    const queryMeta = PREDEFINED_QUERIES[queryKey];

    if (!queryMeta) {
      return res.status(404).json({
        success: false,
        message: `Query key '${queryKey}' is not recognized. Arbitrary SQL queries are forbidden.`
      });
    }

    const startTime = process.hrtime();
    const [rows, fields] = await pool.query(queryMeta.executableSql);
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1000000).toFixed(2);

    const columns = fields ? fields.map(f => f.name) : (rows.length > 0 ? Object.keys(rows[0]) : []);

    res.json({
      success: true,
      meta: {
        id: queryMeta.id,
        title: queryMeta.title,
        description: queryMeta.description,
        presentationNote: queryMeta.presentationNote,
        sql: queryMeta.sql,
        executionTimeMs: `${executionTimeMs} ms`,
        rowCount: rows.length
      },
      columns,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};
