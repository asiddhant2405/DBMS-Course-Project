import pool from '../config/db.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM student');
    const [[{ totalInstructors }]] = await pool.query('SELECT COUNT(*) AS totalInstructors FROM instructor');
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) AS totalCourses FROM course');
    const [[{ totalModules }]] = await pool.query('SELECT COUNT(*) AS totalModules FROM module');
    const [[{ totalAssessments }]] = await pool.query('SELECT COUNT(*) AS totalAssessments FROM assessment');
    const [[{ totalEnrollments }]] = await pool.query('SELECT COUNT(*) AS totalEnrollments FROM enrollment');
    const [[{ totalProgress }]] = await pool.query('SELECT COUNT(*) AS totalProgress FROM progress');
    const [[{ totalResults }]] = await pool.query('SELECT COUNT(*) AS totalResults FROM result');

    // Overall module completion stats
    const [[progressStats]] = await pool.query(`
      SELECT 
        COUNT(*) AS totalTracked,
        SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS completedCount,
        SUM(CASE WHEN Status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressCount,
        SUM(CASE WHEN Status = 'Not Started' THEN 1 ELSE 0 END) AS notStartedCount,
        ROUND(AVG(Completion_Percent), 1) AS avgPercent,
        ROUND((SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)), 1) AS completionRate
      FROM progress
    `);

    // Department distribution
    const [deptDistribution] = await pool.query(`
      SELECT Department AS name, COUNT(*) AS count
      FROM student
      GROUP BY Department
      ORDER BY count DESC
    `);

    // Year distribution
    const [yearDistribution] = await pool.query(`
      SELECT CONCAT('Year ', Year) AS name, Year AS yearNum, COUNT(*) AS count
      FROM student
      GROUP BY Year
      ORDER BY Year ASC
    `);

    // Course status breakdown
    const [courseProgress] = await pool.query(`
      SELECT 
        c.Course_ID, c.Course_Name, c.Category,
        COUNT(DISTINCT e.Student_ID) AS enrolledCount,
        ROUND(COALESCE(AVG(p.Completion_Percent), 0), 1) AS avgProgress
      FROM course c
      LEFT JOIN enrollment e ON c.Course_ID = e.Course_ID
      LEFT JOIN module m ON c.Course_ID = m.Course_ID
      LEFT JOIN progress p ON m.Module_ID = p.Module_ID AND e.Student_ID = p.Student_ID
      GROUP BY c.Course_ID, c.Course_Name, c.Category
      ORDER BY enrolledCount DESC
    `);

    // Recent activity
    const [recentEnrollments] = await pool.query(`
      SELECT e.Enrollment_ID, e.Enroll_Date, e.Status, s.Name AS Student_Name, c.Course_Name
      FROM enrollment e
      JOIN student s ON e.Student_ID = s.Student_ID
      JOIN course c ON e.Course_ID = c.Course_ID
      ORDER BY e.Enrollment_ID DESC
      LIMIT 5
    `);

    const [recentResults] = await pool.query(`
      SELECT r.Result_ID, r.Score, r.Attempt_No, r.Result_Date,
             s.Name AS Student_Name, a.Assessment_Name, a.Max_Marks
      FROM result r
      JOIN student s ON r.Student_ID = s.Student_ID
      JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
      WHERE r.Score IS NOT NULL
      ORDER BY r.Result_ID DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalInstructors,
          totalCourses,
          totalModules,
          totalAssessments,
          totalEnrollments,
          totalProgress,
          totalResults,
          overallCompletionRate: progressStats.completionRate || 0,
          avgCompletionPercent: progressStats.avgPercent || 0,
          completedModulesCount: progressStats.completedCount || 0,
          inProgressModulesCount: progressStats.inProgressCount || 0
        },
        deptDistribution,
        yearDistribution,
        courseProgress,
        recentEnrollments,
        recentResults
      }
    });
  } catch (err) {
    next(err);
  }
};
