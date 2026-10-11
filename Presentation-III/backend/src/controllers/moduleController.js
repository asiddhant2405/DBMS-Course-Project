import pool from '../config/db.js';

export const getAllModules = async (req, res, next) => {
  try {
    const { courseId, search } = req.query;
    let query = `
      SELECT m.*, c.Course_Name,
             COUNT(DISTINCT a.Assessment_ID) AS Assessment_Count
      FROM module m
      JOIN course c ON m.Course_ID = c.Course_ID
      LEFT JOIN assessment a ON m.Module_ID = a.Module_ID
      WHERE 1=1
    `;
    const params = [];

    if (courseId && courseId !== 'All') {
      query += ' AND m.Course_ID = ?';
      params.push(parseInt(courseId, 10));
    }

    if (search) {
      query += ' AND (m.Module_Name LIKE ? OR c.Course_Name LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s);
    }

    query += ' GROUP BY m.Module_ID ORDER BY m.Course_ID ASC, m.Sequence_No ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getModuleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [modules] = await pool.query(`
      SELECT m.*, c.Course_Name
      FROM module m
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE m.Module_ID = ?
    `, [id]);

    if (modules.length === 0) {
      return res.status(404).json({ success: false, message: `Module with ID ${id} not found.` });
    }

    const [assessments] = await pool.query('SELECT * FROM assessment WHERE Module_ID = ?', [id]);

    res.json({
      success: true,
      data: {
        ...modules[0],
        assessments
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createModule = async (req, res, next) => {
  try {
    const { Module_Name, Description, Sequence_No, Course_ID } = req.body;
    if (!Module_Name || !Course_ID) {
      return res.status(400).json({ success: false, message: 'Module_Name and Course_ID are required.' });
    }

    const parsedCourseId = parseInt(Course_ID, 10);
    const [course] = await pool.query('SELECT Course_ID FROM course WHERE Course_ID = ?', [parsedCourseId]);
    if (course.length === 0) {
      return res.status(400).json({ success: false, message: `Course with ID ${Course_ID} does not exist.` });
    }

    const [result] = await pool.query(
      'INSERT INTO module (Module_Name, Description, Sequence_No, Course_ID) VALUES (?, ?, ?, ?)',
      [Module_Name.trim(), Description ? Description.trim() : null, parseInt(Sequence_No || 1, 10), parsedCourseId]
    );

    const [newRecord] = await pool.query(`
      SELECT m.*, c.Course_Name
      FROM module m
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE m.Module_ID = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, message: 'Module created successfully in MySQL.', data: newRecord[0] });
  } catch (err) {
    next(err);
  }
};

export const updateModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Module_Name, Description, Sequence_No, Course_ID } = req.body;

    const [existing] = await pool.query('SELECT * FROM module WHERE Module_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Module with ID ${id} not found.` });
    }

    const parsedCourseId = parseInt(Course_ID, 10);
    const [course] = await pool.query('SELECT Course_ID FROM course WHERE Course_ID = ?', [parsedCourseId]);
    if (course.length === 0) {
      return res.status(400).json({ success: false, message: `Course with ID ${Course_ID} does not exist.` });
    }

    await pool.query(
      'UPDATE module SET Module_Name = ?, Description = ?, Sequence_No = ?, Course_ID = ? WHERE Module_ID = ?',
      [Module_Name.trim(), Description ? Description.trim() : null, parseInt(Sequence_No || 1, 10), parsedCourseId, id]
    );

    const [updated] = await pool.query(`
      SELECT m.*, c.Course_Name
      FROM module m
      JOIN course c ON m.Course_ID = c.Course_ID
      WHERE m.Module_ID = ?
    `, [id]);

    res.json({ success: true, message: 'Module updated successfully.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM module WHERE Module_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Module with ID ${id} not found.` });
    }

    // Because module has ON DELETE CASCADE for assessments & progress in our schema, or we can check
    await pool.query('DELETE FROM module WHERE Module_ID = ?', [id]);
    res.json({ success: true, message: `Module '${existing[0].Module_Name}' deleted successfully from MySQL.` });
  } catch (err) {
    next(err);
  }
};
