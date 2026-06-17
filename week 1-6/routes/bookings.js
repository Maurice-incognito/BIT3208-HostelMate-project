// routes/bookings.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/bookings/mine — student's own bookings
router.get('/mine', authenticate, async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.*, r.room_number, r.type AS room_type, r.floor,
           h.name AS hostel_name, r.image_url
    FROM   bookings b
    JOIN   rooms   r ON b.room_id    = r.id
    JOIN   hostels h ON r.hostel_id  = h.id
    WHERE  b.student_id = ?
    ORDER  BY b.booked_at DESC
  `, [req.user.id]);
  res.json({ bookings: rows });
});

// GET /api/bookings/all — admin only
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.*, s.full_name, s.email, s.admission_no,
           r.room_number, r.type AS room_type, h.name AS hostel_name
    FROM   bookings b
    JOIN   students s ON b.student_id = s.id
    JOIN   rooms    r ON b.room_id    = r.id
    JOIN   hostels  h ON r.hostel_id  = h.id
    ORDER  BY b.booked_at DESC
  `);
  res.json({ bookings: rows });
});

// POST /api/bookings — make a booking
router.post('/', authenticate, async (req, res) => {
  const { room_id, semester, academic_year, check_in_date, check_out_date, notes } = req.body;
  if (!room_id || !semester || !academic_year || !check_in_date || !check_out_date)
    return res.status(400).json({ error: 'All booking fields are required.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check room availability
    const [[room]] = await conn.query(
      'SELECT * FROM rooms WHERE id = ? FOR UPDATE', [room_id]
    );
    if (!room) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'Room not found.' }); }
    if (room.status !== 'available')
      { await conn.rollback(); conn.release(); return res.status(400).json({ error: 'Room is not available.' }); }
    if (room.occupied >= room.capacity)
      { await conn.rollback(); conn.release(); return res.status(400).json({ error: 'Room is fully booked.' }); }

    // Check student doesn't already have an active booking
    const [existing] = await conn.query(
      "SELECT id FROM bookings WHERE student_id=? AND booking_status IN ('pending','confirmed')", [req.user.id]
    );
    if (existing.length)
      { await conn.rollback(); conn.release(); return res.status(400).json({ error: 'You already have an active booking. Cancel it first.' }); }

    // Create booking
    const [result] = await conn.query(
      'INSERT INTO bookings (student_id,room_id,semester,academic_year,check_in_date,check_out_date,amount_due,notes) VALUES(?,?,?,?,?,?,?,?)',
      [req.user.id, room_id, semester, academic_year, check_in_date, check_out_date, room.price_per_sem, notes||'']
    );

    // Increment occupied count; update status if full
    const newOccupied = room.occupied + 1;
    const newStatus   = newOccupied >= room.capacity ? 'fully_booked' : 'available';
    await conn.query('UPDATE rooms SET occupied=?, status=? WHERE id=?', [newOccupied, newStatus, room_id]);

    await conn.commit(); conn.release();
    res.status(201).json({ message: 'Booking submitted successfully! Awaiting confirmation.', booking_id: result.insertId });
  } catch (e) {
    await conn.rollback(); conn.release();
    console.error(e); res.status(500).json({ error: 'Booking failed. Try again.' });
  }
});

// PATCH /api/bookings/:id/status — admin confirms/cancels
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { booking_status } = req.body;
  await db.query('UPDATE bookings SET booking_status=? WHERE id=?', [booking_status, req.params.id]);

  // If cancelled, free up the bed
  if (booking_status === 'cancelled') {
    const [[b]] = await db.query('SELECT room_id FROM bookings WHERE id=?', [req.params.id]);
    if (b) {
      await db.query('UPDATE rooms SET occupied = GREATEST(occupied-1,0) WHERE id=?', [b.room_id]);
      await db.query("UPDATE rooms SET status='available' WHERE id=? AND status='fully_booked'", [b.room_id]);
    }
  }
  res.json({ message: 'Booking status updated.' });
});

// DELETE /api/bookings/:id — student cancels own booking
router.delete('/:id', authenticate, async (req, res) => {
  const [[b]] = await db.query('SELECT * FROM bookings WHERE id=? AND student_id=?', [req.params.id, req.user.id]);
  if (!b) return res.status(404).json({ error: 'Booking not found.' });
  if (b.booking_status === 'confirmed') return res.status(400).json({ error: 'Confirmed bookings cannot be self-cancelled. Contact admin.' });

  await db.query('UPDATE bookings SET booking_status=? WHERE id=?', ['cancelled', req.params.id]);
  await db.query('UPDATE rooms SET occupied=GREATEST(occupied-1,0) WHERE id=?', [b.room_id]);
  await db.query("UPDATE rooms SET status='available' WHERE id=? AND status='fully_booked'", [b.room_id]);
  res.json({ message: 'Booking cancelled.' });
});

// POST /api/bookings/:id/pay — record payment
router.post('/:id/pay', authenticate, async (req, res) => {
  const { amount, method, reference } = req.body;
  const [[b]] = await db.query('SELECT * FROM bookings WHERE id=? AND student_id=?', [req.params.id, req.user.id]);
  if (!b) return res.status(404).json({ error: 'Booking not found.' });

  await db.query('INSERT INTO payments (booking_id,student_id,amount,method,reference) VALUES(?,?,?,?,?)',
    [req.params.id, req.user.id, amount, method||'mpesa', reference||'']);
  const status = parseFloat(amount) >= parseFloat(b.amount_due) ? 'paid' : 'partial';
  await db.query('UPDATE bookings SET payment_status=? WHERE id=?', [status, req.params.id]);
  res.json({ message: 'Payment recorded.', payment_status: status });
});

module.exports = router;
