// server.js — HostelMate BIT3208
// Week 4: REST API routes completed — auth, rooms, bookings
// Role-based middleware: admin vs student
// Routes: /api/auth /api/rooms /api/bookings
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/rooms',    require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', system: 'HostelMate', time: new Date() })
);

// SPA fallback
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🏠 HostelMate running on http://localhost:${PORT}`);
  console.log(`   API health: http://localhost:${PORT}/api/health`);
  console.log(`   Admin: admin@hostelmate.ac.ke / Admin@1234\n`);
});
