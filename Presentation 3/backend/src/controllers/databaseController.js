import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDatabaseOverview = async (req, res, next) => {
  try {
    const dbName = process.env.DB_NAME || 'learningprogressdb';

    // 1. Fetch table row counts
    const tables = ['instructor', 'student', 'course', 'module', 'assessment', 'enrollment', 'progress', 'result'];
    const rowCounts = {};

    for (const t of tables) {
      const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM \`${t}\``);
      rowCounts[t] = count;
    }

    // 2. Fetch schema details from information_schema
    const [columns] = await pool.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `, [dbName]);

    // 3. Fetch Foreign Key relations
    const [foreignKeys] = await pool.query(`
      SELECT 
        TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [dbName]);

    // 4. Group columns by table
    const tableSchemas = {};
    tables.forEach(t => {
      tableSchemas[t] = {
        tableName: t,
        rowCount: rowCounts[t],
        columns: columns.filter(c => c.TABLE_NAME === t).map(c => ({
          name: c.COLUMN_NAME,
          type: c.COLUMN_TYPE,
          isNullable: c.IS_NULLABLE === 'YES',
          isPrimaryKey: c.COLUMN_KEY === 'PRI',
          isForeignKey: foreignKeys.some(fk => fk.TABLE_NAME === t && fk.COLUMN_NAME === c.COLUMN_NAME),
          extra: c.EXTRA
        })),
        foreignKeys: foreignKeys.filter(fk => fk.TABLE_NAME === t).map(fk => ({
          column: fk.COLUMN_NAME,
          referencedTable: fk.REFERENCED_TABLE_NAME,
          referencedColumn: fk.REFERENCED_COLUMN_NAME
        }))
      };
    });

    // 5. Server info
    const [[serverInfo]] = await pool.query('SELECT VERSION() AS version, DATABASE() AS databaseName, NOW() AS serverTime');

    res.json({
      success: true,
      server: {
        version: serverInfo.version,
        database: serverInfo.databaseName,
        serverTime: serverInfo.serverTime,
        status: 'Online'
      },
      tableCounts: rowCounts,
      schemas: tableSchemas
    });
  } catch (err) {
    next(err);
  }
};

export const resetAndSeedDatabase = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    if (!fs.existsSync(seedPath)) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Seed SQL file not found on server.' });
    }

    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Split SQL by semicolons, filtering empty statements and comments
    const statements = seedSql
      .split(/;\s*[\r\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();

    res.json({
      success: true,
      message: 'Database successfully reseeded with deterministic sample data (30 students, 3 instructors, 4 courses, 8 modules, 8 assessments, 30 enrollments, 60 progress records, 60 results).'
    });
  } catch (err) {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    connection.release();
    next(err);
  }
};
