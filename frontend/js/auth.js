// The role is read back out of the JWT rather than kept in its own
// localStorage key, which can drift out of step with the token it describes.
// This is for routing the UI only — the server re-checks every write.
function tokenPayload(token) {
    const raw = token || localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
        const part = raw.split('.')[1];
        if (!part) return null;
        const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        return null;
    }
}

function currentRole() {
    const payload = tokenPayload();
    return payload && payload.role ? payload.role : null;
}

// impersonateShop() parks the admin's own token here before swapping in a
// vendor one. Without a way back, the admin stays a vendor for the rest of the
// session — the admin panel still renders, because it only checks that some
// token exists, but every admin-only write comes back 403.
function isImpersonating() {
    return !!localStorage.getItem('admin_token');
}

function exitImpersonation() {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) return false;
    localStorage.setItem(TOKEN_KEY, adminToken);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    localStorage.setItem('houz_role', 'admin');
    return true;
}

function initLoginPage() {
    if (localStorage.getItem(TOKEN_KEY)) {
      // Send people where their token actually works. Sending a vendor token
      // to /admin is what put an unusable admin panel on screen.
      window.location.href = currentRole() === 'admin' ? '/admin' : '/dashboard';
      return;
    }
  
    const form = document.getElementById('loginForm');
    if (!form) return;
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const btn = document.getElementById('loginBtn');
      const errorEl = document.getElementById('loginError');
  
      if (!username || !password) return;
  
      btn.textContent = 'Tekshirilmoqda…';
      btn.disabled = true;
      if (errorEl) errorEl.style.display = 'none';
  
      try {
        const res = await fetch(`${API}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
  
        const data = await res.json();
  
        if (res.ok && data.success && data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem('houz_role', data.role || 'vendor');
          // A fresh login ends any impersonation left over from before.
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_role');
          window.location.href = data.role === 'admin' ? '/admin' : '/dashboard';
        } else {
          throw new Error('invalid');
        }
      } catch {
        if (errorEl) errorEl.style.display = 'block';
        btn.textContent = 'Kirish';
        btn.disabled = false;
      }
    });
}
  
function handle401(res) {
    if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        alert("Ваша сессия истекла. Пожалуйста, войдите снова.\n(Sessiya tugadi. Iltimos, qayta kiring.)");
        window.location.href = '/login';
        return true;
    }

    // 403 means the token is valid but lacks the role — nearly always an
    // impersonation session that was never exited. Say so, and offer the way
    // back, instead of surfacing a bare "failed".
    if (res.status === 403) {
        if (isImpersonating()) {
            if (confirm("Вы находитесь в режиме магазина, поэтому изменения в админке недоступны.\nВернуться в админку?")) {
                exitImpersonation();
                window.location.reload();
            }
        } else {
            localStorage.removeItem(TOKEN_KEY);
            alert("Недостаточно прав для этого действия. Войдите как администратор.\n(Admin sifatida kiring.)");
            window.location.href = '/login';
        }
        return true;
    }
    return false;
}

function adminLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('houz_role');
    window.location.href = '/login';
}

function adminGuard() {
    if (!localStorage.getItem(TOKEN_KEY)) {
        window.location.href = '/login';
        return false;
    }
    if (currentRole() === 'admin') return true;

    // Holding a vendor token on /admin: restore the parked admin session if
    // there is one, otherwise send them somewhere their token works.
    if (exitImpersonation()) {
        window.location.reload();
        return false;
    }
    window.location.href = currentRole() ? '/dashboard' : '/login';
    return false;
}

window.adminLogout = adminLogout;
window.handle401 = handle401;
window.tokenPayload = tokenPayload;
window.currentRole = currentRole;
window.isImpersonating = isImpersonating;
window.exitImpersonation = exitImpersonation;
window.adminGuard = adminGuard;

// Auto-init on login page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('/login')) {
        initLoginPage();
    }
});
