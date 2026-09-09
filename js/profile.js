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

      updateCalendarUI(data.calenderConnected);
  
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

  function updateCalendarUI(connected) {

    const statusIcon = document.getElementById('calendar-status-icon');
    const statusTitle = document.getElementById('calendar-status-title');
    const statusText = document.getElementById('calendar-status-text');

    const actionBtn = document.getElementById('calendar-action-btn');
    const actionIcon = document.getElementById('calendar-action-icon');
    const actionText = document.getElementById('calendar-action-text');

    if (connected) {

        statusIcon.textContent = 'cloud_done';
        statusTitle.textContent = 'Connected';
        statusText.textContent = 'Your Google Calendar is connected and ready.';

        actionIcon.textContent = 'link_off';
        actionText.textContent = 'Disconnect Google Calendar';

        actionBtn.classList.remove('btn-primary');
        actionBtn.classList.add('calendar-disconnect');
        

    } else {

        statusIcon.textContent = 'cloud_off';
        statusTitle.textContent = 'Not Connected';
        statusText.textContent = 'Connect your Google Calendar to automatically add contests.';

        actionIcon.textContent = 'event_available';
        actionText.textContent = 'Connect Google Calendar';

        actionBtn.classList.remove('calendar-disconnect');
        actionBtn.classList.add('btn-primary');
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
  // ===== GOOGLE CALENDAR ACTION =====
document.getElementById('calendar-action-btn').addEventListener('click', async () => {

  const button = document.getElementById('calendar-action-btn');

  const connected = button.classList.contains('calendar-disconnect');

  // ===== DISCONNECT =====
  if (connected) {

      const confirmed = confirm(
          'Are you sure you want to disconnect Google Calendar?'
      );

      if (!confirmed) {
          return;
      }

      button.disabled = true;
      document.getElementById('calendar-action-text').textContent =
          'Disconnecting...';

      try {
          const response = await fetch(
              `${BASE_URL}/api/calendar/disconnect`,
              {
                  method: 'DELETE',
                  headers: authHeaders()
              }
          );

          if (response.status === 401) {
              logout();
              return;
          }

          if (!response.ok) {
              throw new Error('Failed to disconnect Google Calendar');
          }

          // Update UI
          updateCalendarUI(false);

      } catch (error) {

          console.error('Calendar disconnection failed:', error);

          // Restore connected state
          updateCalendarUI(true);

          alert(
              'Could not disconnect Google Calendar. Please try again.'
          );

      } finally {
          button.disabled = false;
      }

      return;
  }

  // ===== CONNECT =====

  button.disabled = true;
  document.getElementById('calendar-action-text').textContent =
      'Connecting...';

  try {

      const response = await fetch(
          `${BASE_URL}/api/calendar/connect`,
          {
              method: 'GET',
              headers: authHeaders()
          }
      );

      if (response.status === 401) {
          logout();
          return;
      }

      if (!response.ok) {
          throw new Error(
              'Failed to start Google Calendar connection'
          );
      }

      const authUrl = await response.text();

      // Send user to Google's consent screen
      window.location.href = authUrl;

  } catch (error) {

      console.error('Calendar connection failed:', error);

      button.disabled = false;

      document.getElementById('calendar-action-text').textContent =
          'Connect Google Calendar';
  }
});
  // ===== INIT =====
  loadProfile();