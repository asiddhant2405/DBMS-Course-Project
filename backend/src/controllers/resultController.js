import pool from '../config/db.js';

export const getAllResults = async (req, res, next) => {
  try {
    const { studentId, assessmentId, search } = req.query;
    let query = `
      SELECT r.*, s.Name AS Student_Name, s.Department,
             a.Assessment_Name, a.Assessment_Type, a.Max_Marks,
             m.Module_Name, c.Course_Name
      FROM result r
      JOIN student s ON r.Student_ID = s.Student_ID
      JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
      JOIN module m ON a.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE 1=1
    `;
    const params = [];

    if (studentId && studentId !== 'All') {
      query += ' AND r.Student_ID = ?';
      params.push(parseInt(studentId, 10));
    }

    if (assessmentId && assessmentId !== 'All') {
      query += ' AND r.Assessment_ID = ?';
      params.push(parseInt(assessmentId, 10));
    }

    if (search) {
      query += ' AND (s.Name LIKE ? OR a.Assessment_Name LIKE ? OR c.Course_Name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY r.Result_ID DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getResultById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT r.*, s.Name AS Student_Name, s.Email AS Student_Email,
             a.Assessment_Name, a.Assessment_Type, a.Max_Marks,
             m.Module_Name, c.Course_Name
      FROM result r
      JOIN student s ON r.Student_ID = s.Student_ID
      JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
      JOIN module m ON a.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE r.Result_ID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Result with ID ${id} not found.` });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const createResult = async (req, res, next) => {
  try {
    const { Student_ID, Assessment_ID, Score, Attempt_No, Result_Date } = req.body;
    if (!Student_ID || !Assessment_ID) {
      return res.status(400).json({ success: false, message: 'Student_ID and Assessment_ID are required.' });
    }

    const sId = parseInt(Student_ID, 10);
    const aId = parseInt(Assessment_ID, 10);

    const [student] = await pool.query('SELECT Student_ID FROM student WHERE Student_ID = ?', [sId]);
    if (student.length === 0) {
      return res.status(400).json({ success: false, message: `Student with ID ${Student_ID} does not exist.` });
    }

    const [assessment] = await pool.query('SELECT Assessment_ID, Max_Marks FROM assessment WHERE Assessment_ID = ?', [aId]);
    if (assessment.length === 0) {
      return res.status(400).json({ success: false, message: `Assessment with ID ${Assessment_ID} does not exist.` });
    }

    const maxMarks = assessment[0].Max_Marks;
    let scoreVal = Score !== null && Score !== undefined && Score !== '' ? parseFloat(Score) : null;

    if (scoreVal !== null) {
      if (scoreVal < 0 || scoreVal > maxMarks) {
        return res.status(400).json({
          success: false,
          message: `Score must be between 0 and maximum marks (${maxMarks}).`
        });
      }
    }

    const attempt = parseInt(Attempt_No || 1, 10);
    const resDate = Result_Date || (scoreVal !== null ? new Date().toISOString().split('T')[0] : null);

    const [result] = await pool.query(
      'INSERT INTO result (Score, Attempt_No, Result_Date, Student_ID, Assessment_ID) VALUES (?, ?, ?, ?, ?)',
      [scoreVal, attempt, resDate, sId, aId]
    );

    const [newRecord] = await pool.query(`
      SELECT r.*, s.Name AS Student_Name, a.Assessment_Name, a.Max_Marks
      FROM result r
      JOIN student s ON r.Student_ID = s.Student_ID
      JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
      WHERE r.Result_ID = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: 'Assessment result saved successfully in MySQL.', data: newRecord[0] });
  } catch (err) {
    next(err);
  }
};

export const updateResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Student_ID, Assessment_ID, Score, Attempt_No, Result_Date } = req.body;

    const [existing] = await pool.query('SELECT * FROM result WHERE Result_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Result with ID ${id} not found.` });
    }

    const sId = parseInt(Student_ID, 10);
    const aId = parseInt(Assessment_ID, 10);

    const [assessment] = await pool.query('SELECT Max_Marks FROM assessment WHERE Assessment_ID = ?', [aId]);
    const maxMarks = assessment.length > 0 ? assessment[0].Max_Marks : 100;

    let scoreVal = Score !== null && Score !== undefined && Score !== '' ? parseFloat(Score) : null;
    if (scoreVal !== null && (scoreVal < 0 || scoreVal > maxMarks)) {
      return res.status(400).json({ success: false, message: `Score must be between 0 and maximum marks (${maxMarks}).` });
    }

    await pool.query(
      'UPDATE result SET Score = ?, Attempt_No = ?, Result_Date = ?, Student_ID = ?, Assessment_ID = ? WHERE Result_ID = ?',
      [scoreVal, parseInt(Attempt_No || 1, 10), Result_Date || null, sId, aId, id]
    );

    const [updated] = await pool.query(`
      SELECT r.*, s.Name AS Student_Name, a.Assessment_Name, a.Max_Marks
      FROM result r
      JOIN student s ON r.Student_ID = s.Student_ID
      JOIN assessment a ON r.Assessment_ID = a.Assessment_ID
      WHERE r.Result_ID = ?
    `, [id]);

    res.json({ success: true, message: 'Result updated successfully.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM result WHERE Result_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Result with ID ${id} not found.` });
    }

    await pool.query('DELETE FROM result WHERE Result_ID = ?', [id]);
    res.json({ success: true, message: 'Result deleted successfully from MySQL.' });
  } catch (err) {
    next(err);
  }
};
