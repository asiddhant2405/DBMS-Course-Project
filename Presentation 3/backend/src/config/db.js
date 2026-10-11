import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '87654321',
  database: process.env.DB_NAME || 'learningprogressdb',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT VERSION() AS version, DATABASE() AS currentDb');
    connection.release();
    console.log(`[MySQL] Connected successfully to MySQL ${rows[0].version} (Database: ${rows[0].currentDb})`);
    return { success: true, version: rows[0].version, database: rows[0].currentDb };
  } catch (err) {
    console.error('[MySQL] Connection test failed:', err.message);
    return { success: false, error: err.message };
  }
};

export default pool;
