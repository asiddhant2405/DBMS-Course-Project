import pool from '../config/db.js';

export const getAllStudents = async (req, res, next) => {
  try {
    const { search, department, year } = req.query;
    let query = 'SELECT * FROM student WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (Name LIKE ? OR Email LIKE ? OR CAST(Student_ID AS CHAR) LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (department && department !== 'All') {
      query += ' AND Department = ?';
      params.push(department);
    }

    if (year && year !== 'All') {
      query += ' AND Year = ?';
      params.push(parseInt(year, 10));
    }

    query += ' ORDER BY Student_ID ASC';

    const [rows] = await pool.query(query, params);
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [students] = await pool.query('SELECT * FROM student WHERE Student_ID = ?', [id]);

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: `Student with ID ${id} not found.` });
    }

    const student = students[0];

    // Fetch related enrollments with course details
    const [enrollments] = await pool.query(`
      SELECT e.Enrollment_ID, e.Enroll_Date, e.Status, e.Completion_Date,
             c.Course_ID, c.Course_Name, c.Category, c.Level
      FROM enrollment e
      JOIN course c ON e.Course_ID = c.Course_ID
      WHERE e.Student_ID = ?
      ORDER BY e.Enroll_Date DESC
    `, [id]);

    // Fetch related progress with module details
    const [progress] = await pool.query(`
      SELECT p.Progress_ID, p.Progress_Date, p.Completion_Percent, p.Status, p.Time_Spent,
             m.Module_ID, m.Module_Name, m.Sequence_No, c.Course_Name
      FROM progress p
      JOIN module m ON p.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE p.Student_ID = ?
      ORDER BY m.Course_ID, m.Sequence_No
    `, [id]);

    // Fetch related assessment results
    const [results] = await pool.query(`
      SELECT r.Result_ID, r.Score, r.Attempt_No, r.Result_Date,
             a.Assessment_ID, a.Assessment_Name, a.Assessment_Type, a.Max_Marks
      FROM result r
      JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
      WHERE r.Student_ID = ?
      ORDER BY r.Result_Date DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...student,
        enrollments,
        progress,
        results
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { Name, Email, Department, Year, Phone } = req.body;

    if (!Name || !Email || !Department || !Year) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email, Department, and Year are required fields.'
      });
    }

    const parsedYear = parseInt(Year, 10);
    if (isNaN(parsedYear) || parsedYear < 1 || parsedYear > 5) {
      return res.status(400).json({
        success: false,
        message: 'Year must be a valid academic year number (1 to 5).'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO student (Name, Email, Department, Year, Phone) VALUES (?, ?, ?, ?, ?)',
      [Name.trim(), Email.trim().toLowerCase(), Department.trim(), parsedYear, Phone ? Phone.trim() : null]
    );

    const [newStudent] = await pool.query('SELECT * FROM student WHERE Student_ID = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Student record created successfully in MySQL database.',
      data: newStudent[0]
    });
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Name, Email, Department, Year, Phone } = req.body;

    const [existing] = await pool.query('SELECT * FROM student WHERE Student_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Student with ID ${id} not found.` });
    }

    if (!Name || !Email || !Department || !Year) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email, Department, and Year are required fields.'
      });
    }

    await pool.query(
      'UPDATE student SET Name = ?, Email = ?, Department = ?, Year = ?, Phone = ? WHERE Student_ID = ?',
      [Name.trim(), Email.trim().toLowerCase(), Department.trim(), parseInt(Year, 10), Phone ? Phone.trim() : null, id]
    );

    const [updated] = await pool.query('SELECT * FROM student WHERE Student_ID = ?', [id]);

    res.json({
      success: true,
      message: 'Student record updated successfully.',
      data: updated[0]
    });
  } catch (err) {
    next(err);
  }
};

export const checkStudentDependencies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[{ enrollments }]] = await pool.query('SELECT COUNT(*) AS enrollments FROM enrollment WHERE Student_ID = ?', [id]);
    const [[{ progress }]] = await pool.query('SELECT COUNT(*) AS progress FROM progress WHERE Student_ID = ?', [id]);
    const [[{ results }]] = await pool.query('SELECT COUNT(*) AS results FROM result WHERE Student_ID = ?', [id]);

    const total = enrollments + progress + results;
    res.json({
      success: true,
      hasDependencies: total > 0,
      counts: { enrollments, progress, results, total }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { cascade } = req.query;

    const [students] = await connection.query('SELECT * FROM student WHERE Student_ID = ?', [id]);
    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: `Student with ID ${id} not found.` });
    }

    const student = students[0];

    // Check dependent records
    const [[{ enrollments }]] = await connection.query('SELECT COUNT(*) AS enrollments FROM enrollment WHERE Student_ID = ?', [id]);
    const [[{ progress }]] = await connection.query('SELECT COUNT(*) AS progress FROM progress WHERE Student_ID = ?', [id]);
    const [[{ results }]] = await connection.query('SELECT COUNT(*) AS results FROM result WHERE Student_ID = ?', [id]);
    const totalDeps = enrollments + progress + results;

    if (totalDeps > 0 && cascade !== 'true') {
      connection.release();
      return res.status(409).json({
        success: false,
        errorType: 'FOREIGN_KEY_CONFLICT',
        message: `Cannot delete student '${student.Name}' (ID: ${id}) because dependent records exist in the database.`,
        details: {
          enrollments,
          progress,
          results
        },
        suggestion: 'You can resolve this by deleting dependent records first, or request deletion with cascade confirmation.'
      });
    }

    // Execute deletion within transaction if cascade requested or no dependencies
    await connection.beginTransaction();

    if (totalDeps > 0 && cascade === 'true') {
      await connection.query('DELETE FROM result WHERE Student_ID = ?', [id]);
      await connection.query('DELETE FROM progress WHERE Student_ID = ?', [id]);
      await connection.query('DELETE FROM enrollment WHERE Student_ID = ?', [id]);
    }

    await connection.query('DELETE FROM student WHERE Student_ID = ?', [id]);
    await connection.commit();
    connection.release();

    res.json({
      success: true,
      message: `Student '${student.Name}' (ID: ${id}) deleted successfully from MySQL database.`,
      deletedStudent: student,
      cascadedDeletedRecords: cascade === 'true' ? { enrollments, progress, results } : null
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
};
