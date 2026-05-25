// config/db.js — MySQL connection pool via connection string
const mysql = require('mysql2/promise');
require('dotenv').config();

let poolConfig;

if (process.env.DB_CONNECTION_STRING) {
  const url = new URL(process.env.DB_CONNECTION_STRING);
  poolConfig = {
    host: url.hostname, port: parseInt(url.port) || 3306,
    user: url.username, password: url.password,
    database: url.pathname.replace('/', ''),
    waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  };
  console.log(`[DB] Connection string → ${url.hostname}/${url.pathname.replace('/', '')}`);
} else {
  poolConfig = {
    host: 'localhost', port: 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostelmate_db',
    waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  };
  console.log(`[DB] Using env vars → ${poolConfig.host}/${poolConfig.database}`);
}

const pool = mysql.createPool(poolConfig);

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('[DB] ✅ Connected to MySQL successfully');
    conn.release();
  } catch (err) {
    console.error('[DB] ❌ Connection failed:', err.message);
  }
})();

module.exports = pool;
