// routes/rooms.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/rooms — public, with filters
router.get('/', async (req, res) => {
  const { type, hostel_id, status, search } = req.query;
  let q = `
    SELECT r.*, h.name AS hostel_name, h.gender,
           (r.capacity - r.occupied) AS available_beds
    FROM   rooms r JOIN hostels h ON r.hostel_id = h.id
    WHERE  1=1
  `;
  const p = [];
  if (type)      { q += ' AND r.type = ?';             p.push(type); }
  if (hostel_id) { q += ' AND r.hostel_id = ?';        p.push(hostel_id); }
  if (status)    { q += ' AND r.status = ?';           p.push(status); }
  if (search)    { q += ' AND (r.room_number LIKE ? OR h.name LIKE ?)'; p.push(`%${search}%`, `%${search}%`); }
  q += ' ORDER BY r.hostel_id, r.floor, r.room_number';
  const [rows] = await db.query(q, p);
  res.json({ rooms: rows });
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  const [rows] = await db.query(`
    SELECT r.*, h.name AS hostel_name, h.gender, h.description AS hostel_desc,
           (r.capacity - r.occupied) AS available_beds
    FROM   rooms r JOIN hostels h ON r.hostel_id = h.id
    WHERE  r.id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Room not found.' });
  res.json({ room: rows[0] });
});

// GET /api/rooms/meta/hostels
router.get('/meta/hostels', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM hostels ORDER BY name');
  res.json({ hostels: rows });
});

// POST /api/rooms — admin
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { hostel_id, room_number, floor, type, price_per_sem, capacity, amenities, image_url } = req.body;
  if (!hostel_id || !room_number || !type || !price_per_sem || !capacity)
    return res.status(400).json({ error: 'hostel_id, room_number, type, price and capacity are required.' });
  const [r] = await db.query(
    'INSERT INTO rooms (hostel_id,room_number,floor,type,price_per_sem,capacity,amenities,image_url) VALUES(?,?,?,?,?,?,?,?)',
    [hostel_id, room_number, floor||1, type, price_per_sem, capacity, amenities||'', image_url||'']
  );
  res.status(201).json({ message: 'Room created.', id: r.insertId });
});

// PUT /api/rooms/:id — admin
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { room_number, floor, type, price_per_sem, capacity, amenities, image_url, status } = req.body;
  await db.query(
    'UPDATE rooms SET room_number=?,floor=?,type=?,price_per_sem=?,capacity=?,amenities=?,image_url=?,status=? WHERE id=?',
    [room_number, floor, type, price_per_sem, capacity, amenities, image_url, status, req.params.id]
  );
  res.json({ message: 'Room updated.' });
});

// DELETE /api/rooms/:id — admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await db.query('DELETE FROM rooms WHERE id=?', [req.params.id]);
  res.json({ message: 'Room deleted.' });
});

module.exports = router;
