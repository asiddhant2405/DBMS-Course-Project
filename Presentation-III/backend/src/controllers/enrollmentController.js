import pool from '../config/db.js';

export const getAllEnrollments = async (req, res, next) => {
  try {
    const { studentId, courseId, status, search } = req.query;
    let query = `
      SELECT e.*, s.Name AS Student_Name, s.Email AS Student_Email, s.Department AS Student_Department,
             c.Course_Name, c.Category AS Course_Category
      FROM enrollment e
      JOIN student s ON e.Student_ID = s.Student_ID
      JOIN course c ON e.Course_ID = c.Course_ID
      WHERE 1=1
    `;
    const params = [];

    if (studentId && studentId !== 'All') {
      query += ' AND e.Student_ID = ?';
      params.push(parseInt(studentId, 10));
    }

    if (courseId && courseId !== 'All') {
      query += ' AND e.Course_ID = ?';
      params.push(parseInt(courseId, 10));
    }

    if (status && status !== 'All') {
      query += ' AND e.Status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (s.Name LIKE ? OR c.Course_Name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    query += ' ORDER BY e.Enrollment_ID DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT e.*, s.Name AS Student_Name, s.Email AS Student_Email, s.Department,
             c.Course_Name, c.Category, c.Duration
      FROM enrollment e
      JOIN student s ON e.Student_ID = s.Student_ID
      JOIN course c ON e.Course_ID = c.Course_ID
      WHERE e.Enrollment_ID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Enrollment with ID ${id} not found.` });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const createEnrollment = async (req, res, next) => {
  try {
    const { Student_ID, Course_ID, Enroll_Date, Status, Completion_Date } = req.body;
    if (!Student_ID || !Course_ID) {
      return res.status(400).json({ success: false, message: 'Student_ID and Course_ID are required.' });
    }

    const sId = parseInt(Student_ID, 10);
    const cId = parseInt(Course_ID, 10);

    const [student] = await pool.query('SELECT Student_ID FROM student WHERE Student_ID = ?', [sId]);
    if (student.length === 0) {
      return res.status(400).json({ success: false, message: `Student with ID ${Student_ID} does not exist.` });
    }

    const [course] = await pool.query('SELECT Course_ID FROM course WHERE Course_ID = ?', [cId]);
    if (course.length === 0) {
      return res.status(400).json({ success: false, message: `Course with ID ${Course_ID} does not exist.` });
    }

    // Check duplicate enrollment
    const [existing] = await pool.query('SELECT Enrollment_ID FROM enrollment WHERE Student_ID = ? AND Course_ID = ?', [sId, cId]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'This student is already enrolled in this course.' });
    }

    const enrollDate = Enroll_Date || new Date().toISOString().split('T')[0];
    const statusVal = Status || 'Active';
    const compDate = statusVal === 'Completed' ? (Completion_Date || new Date().toISOString().split('T')[0]) : null;

    const [result] = await pool.query(
      'INSERT INTO enrollment (Enroll_Date, Status, Completion_Date, Student_ID, Course_ID) VALUES (?, ?, ?, ?, ?)',
      [enrollDate, statusVal, compDate, sId, cId]
    );

    const [newRecord] = await pool.query(`
      SELECT e.*, s.Name AS Student_Name, c.Course_Name
      FROM enrollment e
      JOIN student s ON e.Student_ID = s.Student_ID
      JOIN course c ON e.Course_ID = c.Course_ID
      WHERE e.Enrollment_ID = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: 'Enrollment registered successfully in MySQL.', data: newRecord[0] });
  } catch (err) {
    next(err);
  }
};

export const updateEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Student_ID, Course_ID, Enroll_Date, Status, Completion_Date } = req.body;

    const [existing] = await pool.query('SELECT * FROM enrollment WHERE Enrollment_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Enrollment with ID ${id} not found.` });
    }

    const sId = parseInt(Student_ID, 10);
    const cId = parseInt(Course_ID, 10);

    const compDate = Status === 'Completed' ? (Completion_Date || new Date().toISOString().split('T')[0]) : null;

    await pool.query(
      'UPDATE enrollment SET Enroll_Date = ?, Status = ?, Completion_Date = ?, Student_ID = ?, Course_ID = ? WHERE Enrollment_ID = ?',
      [Enroll_Date, Status, compDate, sId, cId, id]
    );

    const [updated] = await pool.query(`
      SELECT e.*, s.Name AS Student_Name, c.Course_Name
      FROM enrollment e
      JOIN student s ON e.Student_ID = s.Student_ID
      JOIN course c ON e.Course_ID = c.Course_ID
      WHERE e.Enrollment_ID = ?
    `, [id]);

    res.json({ success: true, message: 'Enrollment updated successfully.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM enrollment WHERE Enrollment_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Enrollment with ID ${id} not found.` });
    }

    await pool.query('DELETE FROM enrollment WHERE Enrollment_ID = ?', [id]);
    res.json({ success: true, message: 'Enrollment deleted successfully from MySQL.' });
  } catch (err) {
    next(err);
  }
};
