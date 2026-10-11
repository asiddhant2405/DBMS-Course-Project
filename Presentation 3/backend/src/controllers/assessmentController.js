import pool from '../config/db.js';

export const getAllAssessments = async (req, res, next) => {
  try {
    const { moduleId, type, search } = req.query;
    let query = `
      SELECT a.*, m.Module_Name, c.Course_Name, c.Course_ID,
             COUNT(DISTINCT r.Result_ID) AS Submissions_Count,
             ROUND(AVG(r.Score), 2) AS Avg_Score
      FROM assessment a
      JOIN module m ON a.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      LEFT JOIN result r ON a.Assessment_ID = r.Assessment_ID
      WHERE 1=1
    `;
    const params = [];

    if (moduleId && moduleId !== 'All') {
      query += ' AND a.Module_ID = ?';
      params.push(parseInt(moduleId, 10));
    }

    if (type && type !== 'All') {
      query += ' AND a.Assessment_Type = ?';
      params.push(type);
    }

    if (search) {
      query += ' AND (a.Assessment_Name LIKE ? OR m.Module_Name LIKE ? OR c.Course_Name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' GROUP BY a.Assessment_ID ORDER BY a.Assessment_ID ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT a.*, m.Module_Name, c.Course_Name, c.Course_ID
      FROM assessment a
      JOIN module m ON a.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE a.Assessment_ID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Assessment with ID ${id} not found.` });
    }

    const [results] = await pool.query(`
      SELECT r.*, s.Name AS Student_Name, s.Email AS Student_Email
      FROM result r
      JOIN student s ON r.Student_ID = s.Student_ID
      WHERE r.Assessment_ID = ?
      ORDER BY r.Score DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        results
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createAssessment = async (req, res, next) => {
  try {
    const { Assessment_Name, Assessment_Type, Max_Marks, Module_ID } = req.body;
    if (!Assessment_Name || !Module_ID) {
      return res.status(400).json({ success: false, message: 'Assessment_Name and Module_ID are required.' });
    }

    const parsedModuleId = parseInt(Module_ID, 10);
    const [module] = await pool.query('SELECT Module_ID FROM module WHERE Module_ID = ?', [parsedModuleId]);
    if (module.length === 0) {
      return res.status(400).json({ success: false, message: `Module with ID ${Module_ID} does not exist.` });
    }

    const marks = parseInt(Max_Marks || 100, 10);
    if (marks <= 0) {
      return res.status(400).json({ success: false, message: 'Max_Marks must be greater than 0.' });
    }

    const [result] = await pool.query(
      'INSERT INTO assessment (Assessment_Name, Assessment_Type, Max_Marks, Module_ID) VALUES (?, ?, ?, ?)',
      [Assessment_Name.trim(), Assessment_Type ? Assessment_Type.trim() : 'Quiz', marks, parsedModuleId]
    );

    const [newRecord] = await pool.query(`
      SELECT a.*, m.Module_Name, c.Course_Name
      FROM assessment a
      JOIN module m ON a.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE a.Assessment_ID = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: 'Assessment created successfully in MySQL.', data: newRecord[0] });
  } catch (err) {
    next(err);
  }
};

export const updateAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Assessment_Name, Assessment_Type, Max_Marks, Module_ID } = req.body;

    const [existing] = await pool.query('SELECT * FROM assessment WHERE Assessment_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Assessment with ID ${id} not found.` });
    }

    const parsedModuleId = parseInt(Module_ID, 10);
    const [module] = await pool.query('SELECT Module_ID FROM module WHERE Module_ID = ?', [parsedModuleId]);
    if (module.length === 0) {
      return res.status(400).json({ success: false, message: `Module with ID ${Module_ID} does not exist.` });
    }

    const marks = parseInt(Max_Marks || 100, 10);

    await pool.query(
      'UPDATE assessment SET Assessment_Name = ?, Assessment_Type = ?, Max_Marks = ?, Module_ID = ? WHERE Assessment_ID = ?',
      [Assessment_Name.trim(), Assessment_Type ? Assessment_Type.trim() : 'Quiz', marks, parsedModuleId, id]
    );

    const [updated] = await pool.query(`
      SELECT a.*, m.Module_Name, c.Course_Name
      FROM assessment a
      JOIN module m ON a.Module_ID = m.Module_ID
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE a.Assessment_ID = ?
    `, [id]);

    res.json({ success: true, message: 'Assessment updated successfully.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM assessment WHERE Assessment_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Assessment with ID ${id} not found.` });
    }

    await pool.query('DELETE FROM assessment WHERE Assessment_ID = ?', [id]);
    res.json({ success: true, message: `Assessment '${existing[0].Assessment_Name}' deleted successfully from MySQL.` });
  } catch (err) {
    next(err);
  }
};
