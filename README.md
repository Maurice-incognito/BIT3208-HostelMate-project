# 🏠 HostelMate – Student Hostel Room Booking System
**BIT3208 Advanced Web Design & Development — CAT 1**  
**Lecturer:** Lec Nyoro
Maurice Ochieng
---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | MySQL (via connection string) |
| Auth | JWT → stored in `localStorage` (no cookies) |
| Frontend | Vanilla JS + Custom CSS |

---

## Setup (Step by Step)

### 1. Import the database
- Open `http://localhost/phpmyadmin`
- Click **SQL** tab → paste contents of `database/schema.sql` → click **Go**

### 2. Configure environment
```bash
# Copy .env.example to .env
cp .env.example .env
```
Edit `.env`:
```
DB_CONNECTION_STRING=mysql://root:@localhost:3306/hostelmate_db
JWT_SECRET=HostelMate_BIT3208_JWT_Secret_LecNyoro_2024
PORT=3000
```

### 3. Install packages
```bash
npm install
```

### 4. Set up admin password
```bash
node setup-admin.js
```

### 5. Start server
```bash
npm start
```

### 6. Open browser
```
http://localhost:3000
```

---

## Default Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostelmate.ac.ke | Admin@1234 |
| Student | Register at /register.html | Your choice |

---

## Project Structure
```
hostelmate/
├── server.js              ← Entry point
├── .env                   ← Connection string & JWT secret
├── setup-admin.js         ← Run once to fix admin password
├── config/db.js           ← MySQL pool (parses connection string)
├── middleware/auth.js     ← JWT middleware (no cookies)
├── routes/
│   ├── auth.js            ← Register, login, /me
│   ├── rooms.js           ← CRUD rooms
│   └── bookings.js        ← Book, confirm, pay, cancel
├── public/
│   ├── index.html         ← Homepage
│   ├── rooms.html         ← Browse & book rooms
│   ├── my-bookings.html   ← Student booking history
│   ├── login.html
│   ├── register.html
│   ├── admin.html         ← Admin panel
│   ├── css/style.css
│   └── js/api.js
└── database/
    └── schema.sql         ← Full DB schema + seed data
```

---

## Database Tables
| Table | Purpose |
|-------|---------|
| `students` | User accounts (students & admin) |
| `hostels` | Hostel building records |
| `rooms` | Room inventory with availability |
| `bookings` | Room booking records |
| `payments` | M-Pesa/payment records |

---

## CAT 1 Requirements Checklist
- [x] Web project connected to MySQL via connection string
- [x] Data visible in database (5 tables with seed data)
- [x] No cookies — JWT stored in `localStorage`
- [x] User registration and login (bcrypt + JWT)
- [x] Form validation (frontend + backend)
- [x] Product catalog → Room catalog with search & filters
- [x] CRUD operations (rooms, bookings)
- [x] Role-based access (admin vs student)
- [x] Secure password storage (bcrypt 10 rounds)
- [x] Database transactions (booking uses BEGIN/COMMIT)
