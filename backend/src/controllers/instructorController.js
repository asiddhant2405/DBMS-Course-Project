import pool from '../config/db.js';

export const getAllInstructors = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT i.*, COUNT(c.Course_ID) AS Courses_Taught_Count
      FROM instructor i
      LEFT JOIN course c ON i.Instructor_ID = c.Instructor_ID
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (i.Name LIKE ? OR i.Email LIKE ? OR i.Specialization LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' GROUP BY i.Instructor_ID ORDER BY i.Instructor_ID ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
};

export const getInstructorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [instructors] = await pool.query('SELECT * FROM instructor WHERE Instructor_ID = ?', [id]);
    if (instructors.length === 0) {
      return res.status(404).json({ success: false, message: `Instructor with ID ${id} not found.` });
    }

    const [courses] = await pool.query('SELECT * FROM course WHERE Instructor_ID = ?', [id]);

    res.json({
      success: true,
      data: {
        ...instructors[0],
        courses
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createInstructor = async (req, res, next) => {
  try {
    const { Name, Email, Specialization, Phone } = req.body;
    if (!Name || !Email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO instructor (Name, Email, Specialization, Phone) VALUES (?, ?, ?, ?)',
      [Name.trim(), Email.trim().toLowerCase(), Specialization ? Specialization.trim() : null, Phone ? Phone.trim() : null]
    );

    const [newRecord] = await pool.query('SELECT * FROM instructor WHERE Instructor_ID = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Instructor created successfully in MySQL.', data: newRecord[0] });
  } catch (err) {
    next(err);
  }
};

export const updateInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Name, Email, Specialization, Phone } = req.body;

    const [existing] = await pool.query('SELECT * FROM instructor WHERE Instructor_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Instructor with ID ${id} not found.` });
    }

    await pool.query(
      'UPDATE instructor SET Name = ?, Email = ?, Specialization = ?, Phone = ? WHERE Instructor_ID = ?',
      [Name.trim(), Email.trim().toLowerCase(), Specialization ? Specialization.trim() : null, Phone ? Phone.trim() : null, id]
    );

    const [updated] = await pool.query('SELECT * FROM instructor WHERE Instructor_ID = ?', [id]);
    res.json({ success: true, message: 'Instructor updated successfully.', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM instructor WHERE Instructor_ID = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Instructor with ID ${id} not found.` });
    }

    const [[{ courseCount }]] = await pool.query('SELECT COUNT(*) AS courseCount FROM course WHERE Instructor_ID = ?', [id]);
    if (courseCount > 0) {
      return res.status(409).json({
        success: false,
        errorType: 'FOREIGN_KEY_CONFLICT',
        message: `Cannot delete instructor '${existing[0].Name}' because they teach ${courseCount} course(s). Reassign or remove the courses first.`
      });
    }

    await pool.query('DELETE FROM instructor WHERE Instructor_ID = ?', [id]);
    res.json({ success: true, message: `Instructor '${existing[0].Name}' deleted successfully from MySQL.` });
  } catch (err) {
    next(err);
  }
};
