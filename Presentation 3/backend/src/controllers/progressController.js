import pool from '../config/db.js';

export const getAllProgress = async (req, res, next) => {
  try {
    const { studentId, moduleId, status, search } = req.query;
    let query = `
      SELECT p.*, s.Name AS Student_Name, s.Department,
             m.Module_Name, m.Sequence_No,
             c.Course_ID, c.Course_Name
      FROM progress p
      JOIN student s ON p.Student_ID = s.Student_ID
      JOIN module m ON p.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE 1=1
    `;
    const params = [];

    if (studentId && studentId !== 'All') {
      query += ' AND p.Student_ID = ?';
      params.push(parseInt(studentId, 10));
    }

    if (moduleId && moduleId !== 'All') {
      query += ' AND p.Module_ID = ?';
      params.push(parseInt(moduleId, 10));
    }

    if (status && status !== 'All') {
      query += ' AND p.Status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (s.Name LIKE ? OR m.Module_Name LIKE ? OR c.Course_Name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY p.Progress_ID DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getProgressById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, s.Name AS Student_Name, s.Email AS Student_Email,
             m.Module_Name, m.Sequence_No,
             c.Course_Name
      FROM progress p
      JOIN student s ON p.Student_ID = s.Student_ID
      JOIN module m ON p.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE p.Progress_ID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Progress record with ID ${id} not found.` });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const createProgress = async (req, res, next) => {
  try {
    const { Student_ID, Module_ID, Progress_Date, Completion_Percent, Status, Time_Spent } = req.body;
    if (!Student_ID || !Module_ID) {
      return res.status(400).json({ success: false, message: 'Student_ID and Module_ID are required.' });
    }

    const sId = parseInt(Student_ID, 10);
    const mId = parseInt(Module_ID, 10);

    // Verify student exists
    const [student] = await pool.query('SELECT Student_ID FROM student WHERE Student_ID = ?', [sId]);
    if (student.length === 0) {
      return res.status(400).json({ success: false, message: `Student with ID ${Student_ID} does not exist.` });
    }

    // Verify module exists and get its Course_ID
    const [module] = await pool.query('SELECT Module_ID, Course_ID FROM module WHERE Module_ID = ?', [mId]);
    if (module.length === 0) {
      return res.status(400).json({ success: false, message: `Module with ID ${Module_ID} does not exist.` });
    }

    const courseId = module[0].Course_ID;

    // Referential business rule: Student MUST be enrolled in the course that contains this module
    const [enrollment] = await pool.query(
      'SELECT Enrollment_ID FROM enrollment WHERE Student_ID = ? AND Course_ID = ?',
      [sId, courseId]
    );
    if (enrollment.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot record progress: The student is not enrolled in the parent course for this module.'
      });
    }

    // Check duplicate progress for this student and module
    const [existing] = await pool.query('SELECT Progress_ID FROM progress WHERE Student_ID = ? AND Module_ID = ?', [sId, mId]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A progress record already exists for this student and module.' });
    }

    const percent = parseFloat(Completion_Percent ?? 0);
    if (percent < 0 || percent > 100) {
      return res.status(400).json({ success: false, message: 'Completion percentage must be between 0 and 100.' });
    }

    const statusVal = Status || (percent >= 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Not Started');
    const timeSpentVal = parseInt(Time_Spent || 0, 10);
    const dateVal = Progress_Date || new Date().toISOString().split('T')[0];

    const [result] = await pool.query(
      'INSERT INTO progress (Progress_Date, Completion_Percent, Status, Time_Spent, Student_ID, Module_ID) VALUES (?, ?, ?, ?, ?, ?)',
      [dateVal, percent, statusVal, timeSpentVal, sId, mId]
    );

    const [newRecord] = await pool.query(`
      SELECT p.*, s.Name AS Student_Name, m.Module_Name, c.Course_Name
      FROM progress p
      JOIN student s ON p.Student_ID = s.Student_ID
      JOIN module m ON p.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE p.Progress_ID = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: 'Progress recorded successfully in MySQL.', data: newRecord[0] });
  } catch (err) {
    next(err);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Student_ID, Module_ID, Progress_Date, Completion_Percent, Status, Time_Spent } = req.body;

    const [existing] = await pool.query('SELECT * FROM progress WHERE Progress_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Progress with ID ${id} not found.` });
    }

    const percent = parseFloat(Completion_Percent ?? 0);
    if (percent < 0 || percent > 100) {
      return res.status(400).json({ success: false, message: 'Completion percentage must be between 0 and 100.' });
    }

    const statusVal = Status || (percent >= 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Not Started');

    await pool.query(
      'UPDATE progress SET Progress_Date = ?, Completion_Percent = ?, Status = ?, Time_Spent = ?, Student_ID = ?, Module_ID = ? WHERE Progress_ID = ?',
      [Progress_Date, percent, statusVal, parseInt(Time_Spent || 0, 10), parseInt(Student_ID, 10), parseInt(Module_ID, 10), id]
    );

    const [updated] = await pool.query(`
      SELECT p.*, s.Name AS Student_Name, m.Module_Name, c.Course_Name
      FROM progress p
      JOIN student s ON p.Student_ID = s.Student_ID
      JOIN module m ON p.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE p.Progress_ID = ?
    `, [id]);

    res.json({ success: true, message: 'Progress updated successfully.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM progress WHERE Progress_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Progress record with ID ${id} not found.` });
    }

    await pool.query('DELETE FROM progress WHERE Progress_ID = ?', [id]);
    res.json({ success: true, message: 'Progress record deleted successfully from MySQL.' });
  } catch (err) {
    next(err);
  }
};
