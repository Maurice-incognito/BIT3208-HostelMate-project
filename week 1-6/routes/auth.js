// routes/auth.js
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { full_name, email, password, admission_no, phone, course, year_of_study } = req.body;
  if (!full_name || !email || !password || !admission_no)
    return res.status(400).json({ error: 'Full name, email, admission number and password are required.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  try {
    const [ex] = await db.query('SELECT id FROM students WHERE email=? OR admission_no=?', [email, admission_no]);
    if (ex.length) return res.status(409).json({ error: 'Email or admission number already registered.' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      'INSERT INTO students (full_name,email,password,admission_no,phone,course,year_of_study) VALUES(?,?,?,?,?,?,?)',
      [full_name, email, hash, admission_no, phone||'', course||'', year_of_study||1]
    );
    const token = jwt.sign({ id: r.insertId, email, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'Registration successful!', token, user: { id: r.insertId, full_name, email, admission_no, role: 'student' } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error.' }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  try {
    const [rows] = await db.query('SELECT * FROM students WHERE email=?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password.' });
    const u = rows[0];
    if (!await bcrypt.compare(password, u.password))
      return res.status(401).json({ error: 'Invalid email or password.' });
    const token = jwt.sign({ id: u.id, email: u.email, role: u.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful!', token, user: { id: u.id, full_name: u.full_name, email: u.email, admission_no: u.admission_no, role: u.role } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error.' }); }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const [rows] = await db.query('SELECT id,full_name,email,admission_no,phone,course,year_of_study,role,created_at FROM students WHERE id=?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found.' });
  res.json({ user: rows[0] });
});

module.exports = router;
