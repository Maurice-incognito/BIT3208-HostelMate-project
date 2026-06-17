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
## Week 5 & 6Changes – CAT 1 Complete
- Full CRUD operations on rooms and bookings
- Transactional booking system (MySQL BEGIN/COMMIT)
- Payment tracking with M-Pesa reference numbers
- rooms.html booking modal fully functional
- my-bookings.html with cancel and pay buttons
- All 5 database tables populated with real data
## Week 7 Changes
- Designed N-tier architecture diagram (Presentation → Logic → Data)
- Created security design showing JWT auth flow and role-based access
- Mapped request-response flow for the booking transaction