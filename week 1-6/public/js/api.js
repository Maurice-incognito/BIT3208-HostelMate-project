// public/js/api.js — HostelMate shared utilities
// Auth stored in localStorage — NO cookies used

const API = {
  BASE: '/api',
  getToken() { return localStorage.getItem('hm_token'); },
  getUser()  { const u = localStorage.getItem('hm_user'); return u ? JSON.parse(u) : null; },
  saveAuth(token, user) {
    localStorage.setItem('hm_token', token);
    localStorage.setItem('hm_user', JSON.stringify(user));
  },
  clearAuth() { localStorage.removeItem('hm_token'); localStorage.removeItem('hm_user'); },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin()    { return this.getUser()?.role === 'admin'; },

  async request(method, path, body=null, auth=false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const t = this.getToken();
      if (!t) { window.location = '/login.html'; return; }
      headers['Authorization'] = `Bearer ${t}`;
    }
    const res = await fetch(this.BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },
  get(path, auth=false)         { return this.request('GET',    path, null, auth); },
  post(path, body, auth=false)  { return this.request('POST',   path, body, auth); },
  put(path, body, auth=true)    { return this.request('PUT',    path, body, auth); },
  del(path, auth=true)          { return this.request('DELETE', path, null, auth); },
  patch(path, body, auth=true)  { return this.request('PATCH',  path, body, auth); },
};

function renderNavbar(active = '') {
  const el = document.getElementById('navbar');
  if (!el) return;
  const user = API.getUser();
  el.innerHTML = `
    <a class="brand" href="/index.html">🏠 Hostel<span>Mate</span></a>
    <nav>
      <a href="/index.html"        ${active==='home'     ? 'class="active"':''}>Home</a>
      <a href="/rooms.html"        ${active==='rooms'    ? 'class="active"':''}>Rooms</a>
      ${user ? `
        <a href="/my-bookings.html" ${active==='bookings' ? 'class="active"':''}>My Bookings</a>
        ${API.isAdmin() ? `<a href="/admin.html" ${active==='admin' ? 'class="active"':''}>⚙ Admin</a>` : ''}
        <a href="#" onclick="logout()" style="color:rgba(255,255,255,.6)">Logout (${user.full_name.split(' ')[0]})</a>
      ` : `
        <a href="/login.html"    ${active==='login'    ? 'class="active"':''}>Login</a>
        <a href="/register.html" class="btn-nav">Register</a>
      `}
    </nav>
  `;
}

function logout() { API.clearAuth(); window.location = '/login.html'; }

function showAlert(el, msg, type='error') {
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  if (type !== 'error') setTimeout(() => el.innerHTML = '', 5000);
}

function formatKES(v) {
  return 'KES ' + parseFloat(v).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' });
}

function roomTypeBadge(type) {
  const map = { single:'Single Room', double:'Double Room', triple:'Triple Room', ensuite:'En-Suite' };
  return map[type] || type;
}
