// setup-admin.js — Run ONCE after importing schema.sql
// Sets the admin password correctly using bcrypt
// Usage: node setup-admin.js
// Delete this file after it works.

const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const password = 'Admin@1234';
    const hash = await bcrypt.hash(password, 10);

    const db = await mysql.createConnection({
      host: 'localhost', port: 3306,
      user: 'root', password: '',
      database: 'hostelmate_db'
    });

    await db.query('DELETE FROM students WHERE email = ?', ['admin@hostelmate.ac.ke']);
    await db.query(
      'INSERT INTO students (full_name, email, password, admission_no, role) VALUES (?,?,?,?,?)',
      ['Admin', 'admin@hostelmate.ac.ke', hash, 'ADMIN001', 'admin']
    );

    console.log('\n✅ HostelMate admin account ready!');
    console.log('   Email    → admin@hostelmate.ac.ke');
    console.log('   Password → Admin@1234');
    console.log('\nNow run: npm start\n');
    await db.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Make sure XAMPP MySQL is running and schema.sql was imported first.');
  }
})();
