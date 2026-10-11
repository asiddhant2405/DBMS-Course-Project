import pool from '../config/db.js';

export const getAllCourses = async (req, res, next) => {
  try {
    const { search, category, level } = req.query;
    let query = `
      SELECT c.*, i.Name AS Instructor_Name,
             COUNT(DISTINCT m.Module_ID) AS Module_Count,
             COUNT(DISTINCT e.Enrollment_ID) AS Enrolled_Count
      FROM course c
      LEFT JOIN instructor i ON c.Instructor_ID = i.Instructor_ID
      LEFT JOIN module m ON c.Course_ID = m.Course_ID
      LEFT JOIN enrollment e ON c.Course_ID = e.Course_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (c.Course_Name LIKE ? OR c.Category LIKE ? OR i.Name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (category && category !== 'All') {
      query += ' AND c.Category = ?';
      params.push(category);
    }

    if (level && level !== 'All') {
      query += ' AND c.Level = ?';
      params.push(level);
    }

    query += ' GROUP BY c.Course_ID ORDER BY c.Course_ID ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [courses] = await pool.query(`
      SELECT c.*, i.Name AS Instructor_Name, i.Email AS Instructor_Email, i.Specialization AS Instructor_Specialization
      FROM course c
      LEFT JOIN instructor i ON c.Instructor_ID = i.Instructor_ID
      WHERE c.Course_ID = ?
    `, [id]);

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: `Course with ID ${id} not found.` });
    }

    const [modules] = await pool.query('SELECT * FROM module WHERE Course_ID = ? ORDER BY Sequence_No ASC', [id]);
    const [enrollments] = await pool.query(`
      SELECT e.Enrollment_ID, e.Enroll_Date, e.Status, e.Completion_Date,
             s.Student_ID, s.Name AS Student_Name, s.Department, s.Year
      FROM enrollment e
      JOIN student s ON e.Student_ID = s.Student_ID
      WHERE e.Course_ID = ?
      ORDER BY e.Enroll_Date DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...courses[0],
        modules,
        enrollments
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { Course_Name, Description, Category, Duration, Level, Instructor_ID } = req.body;

    if (!Course_Name) {
      return res.status(400).json({ success: false, message: 'Course_Name is required.' });
    }

    let parsedInstructorId = null;
    if (Instructor_ID) {
      parsedInstructorId = parseInt(Instructor_ID, 10);
      const [inst] = await pool.query('SELECT Instructor_ID FROM instructor WHERE Instructor_ID = ?', [parsedInstructorId]);
      if (inst.length === 0) {
        return res.status(400).json({ success: false, message: `Instructor with ID ${Instructor_ID} does not exist.` });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO course (Course_Name, Description, Category, Duration, Level, Instructor_ID) VALUES (?, ?, ?, ?, ?, ?)',
      [Course_Name.trim(), Description ? Description.trim() : null, Category ? Category.trim() : null, Duration ? Duration.trim() : null, Level ? Level.trim() : null, parsedInstructorId]
    );

    const [newRecord] = await pool.query(`
      SELECT c.*, i.Name AS Instructor_Name
      FROM course c
      LEFT JOIN instructor i ON c.Instructor_ID = i.Instructor_ID
      WHERE c.Course_ID = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: 'Course created successfully in MySQL.', data: newRecord[0] });
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Course_Name, Description, Category, Duration, Level, Instructor_ID } = req.body;

    const [existing] = await pool.query('SELECT * FROM course WHERE Course_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Course with ID ${id} not found.` });
    }

    let parsedInstructorId = null;
    if (Instructor_ID) {
      parsedInstructorId = parseInt(Instructor_ID, 10);
      const [inst] = await pool.query('SELECT Instructor_ID FROM instructor WHERE Instructor_ID = ?', [parsedInstructorId]);
      if (inst.length === 0) {
        return res.status(400).json({ success: false, message: `Instructor with ID ${Instructor_ID} does not exist.` });
      }
    }

    await pool.query(
      'UPDATE course SET Course_Name = ?, Description = ?, Category = ?, Duration = ?, Level = ?, Instructor_ID = ? WHERE Course_ID = ?',
      [Course_Name.trim(), Description ? Description.trim() : null, Category ? Category.trim() : null, Duration ? Duration.trim() : null, Level ? Level.trim() : null, parsedInstructorId, id]
    );

    const [updated] = await pool.query(`
      SELECT c.*, i.Name AS Instructor_Name
      FROM course c
      LEFT JOIN instructor i ON c.Instructor_ID = i.Instructor_ID
      WHERE c.Course_ID = ?
    `, [id]);

    res.json({ success: true, message: 'Course updated successfully.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    const [existing] = await connection.query('SELECT * FROM course WHERE Course_ID = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: `Course with ID ${id} not found.` });
    }

    const [[{ enrollmentCount }]] = await connection.query('SELECT COUNT(*) AS enrollmentCount FROM enrollment WHERE Course_ID = ?', [id]);
    const [[{ moduleCount }]] = await connection.query('SELECT COUNT(*) AS moduleCount FROM module WHERE Course_ID = ?', [id]);

    if ((enrollmentCount > 0 || moduleCount > 0) && cascade !== 'true') {
      connection.release();
      return res.status(409).json({
        success: false,
        errorType: 'FOREIGN_KEY_CONFLICT',
        message: `Cannot delete course '${existing[0].Course_Name}' because it has ${enrollmentCount} student enrollment(s) and ${moduleCount} module(s).`,
        details: { enrollmentCount, moduleCount }
      });
    }

    await connection.beginTransaction();

    if (cascade === 'true') {
      // Find modules belonging to this course
      const [modules] = await connection.query('SELECT Module_ID FROM module WHERE Course_ID = ?', [id]);
      for (const m of modules) {
        await connection.query('DELETE FROM result WHERE Assessment_ID IN (SELECT Assessment_ID FROM assessment WHERE Module_ID = ?)', [m.Module_ID]);
        await connection.query('DELETE FROM progress WHERE Module_ID = ?', [m.Module_ID]);
        await connection.query('DELETE FROM assessment WHERE Module_ID = ?', [m.Module_ID]);
      }
      await connection.query('DELETE FROM module WHERE Course_ID = ?', [id]);
      await connection.query('DELETE FROM enrollment WHERE Course_ID = ?', [id]);
    }

    await connection.query('DELETE FROM course WHERE Course_ID = ?', [id]);
    await connection.commit();
    connection.release();

    res.json({ success: true, message: `Course '${existing[0].Course_Name}' deleted successfully from MySQL.` });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
};
