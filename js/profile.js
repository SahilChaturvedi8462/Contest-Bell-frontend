// ===== LOADER =====
window.addEventListener('load', () => {
    document.getElementById('loader-overlay').classList.add('hide');
  });
  
  // ===== AUTH CHECK =====
  if (!requireAuth()) {
    throw new Error('Not authenticated');
  }
  
  // ===== AUTH HEADERS =====
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    };
  }
  
  // ===== LOAD PROFILE =====
  async function loadProfile() {
    try {
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: 'GET',
        headers: authHeaders()
      });
  
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error('Failed');
  
      const data = await response.json();
  
      // Fill read only fields
      document.getElementById('profile-name').textContent     = data.name || '—';
      document.getElementById('profile-email').textContent    = data.email || '—';
      document.getElementById('profile-timezone').textContent = data.timeZone || 'Asia/Kolkata';
      document.getElementById('profile-verified').textContent = data.emailVerified
        ? '✅ Verified'
        : '❌ Not Verified';
  
      // Pre-fill update form with current values
      document.getElementById('name').value = data.name || '';
  
      // Pre-select current timezone in dropdown
      const timezoneSelect = document.getElementById('timezone');
      if (data.timeZone) {
        for (let option of timezoneSelect.options) {
          if (option.value === data.timeZone) {
            option.selected = true;
            break;
          }
        }
      }
  
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }
  
  // ===== UPDATE PROFILE FORM =====
  document.getElementById('update-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const name     = document.getElementById('name').value.trim();
    const timezone = document.getElementById('timezone').value || null;
  
    if (!name) {
      showMessage('update-error', '❌ Name is required.');
      return;
    }
  
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled    = true;
  
    document.getElementById('update-success').hidden = true;
    document.getElementById('update-error').hidden   = true;
  
    try {
      const response = await fetch(`${BASE_URL}/user/update-profile`, {
        method:  'PUT',
        headers: authHeaders(),
        body:    JSON.stringify({ name, timezone })
      });
  
      if (response.status === 401) { logout(); return; }
  
      if (response.ok) {
        document.getElementById('update-success').hidden = false;
        // Reload profile to reflect changes in read only section
        await loadProfile();
      } else {
        const data = await response.text();
        document.getElementById('update-error').hidden = false;
        document.getElementById('update-error').textContent = `❌ ${data}`;
      }
  
    } catch (error) {
      document.getElementById('update-error').hidden = false;
      document.getElementById('update-error').textContent = '❌ Could not connect to server.';
    }
  
    submitBtn.textContent = 'Update Profile';
    submitBtn.disabled    = false;
  });
  
  // ===== SHOW MESSAGE HELPER =====
  function showMessage(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.hidden = false;
  }
  
  // ===== INIT =====
  loadProfile();