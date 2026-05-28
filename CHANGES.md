## Week 3 Changes
- Implemented client-side form validation (register.html, login.html)
- Built shared API utility in public/js/api.js
- Set up Express.js server with JWT authentication
- Auth routes: POST /register, POST /login
- JWT token stored in localStorage (no cookies)
## Week 4 Changes
- Built REST API routes: rooms.js, bookings.js
- Implemented role-based auth middleware
- Admin panel page completed (admin.html)
- Protected routes return 403 for unauthorized users