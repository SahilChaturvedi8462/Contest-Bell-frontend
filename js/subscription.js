// ===== LOADER =====
window.addEventListener('load', () => {
    document.getElementById('loader-overlay').classList.add('hide');
  });
  
  // ===== AUTH CHECK =====
  if (!requireAuth()) {
    throw new Error('Not authenticated');
  }
  
  // ===== ALL DIVISIONS PER PLATFORM =====
  const ALL_DIVISIONS = {
    CODEFORCES: ['DIV_1', 'DIV_2', 'DIV_1_2', 'DIV_3', 'DIV_4', 'EDUCATIONAL', 'GLOBAL', 'OTHER'],
    LEETCODE:   ['WEEKLY', 'BIWEEKLY', 'OTHER'],
    CODECHEF:   ['STARTERS', 'COOK_OFF', 'LUNCHTIME', 'LONG_CHALLENGE', 'OTHER'],
    ATCODER:    ['BEGINNER', 'REGULAR', 'GRAND', 'HEURISTIC', 'OTHER'],
    HACKERRANK: ['WEEKLY', 'OTHER']
  };
  
  // ===== STATE =====
  // Stores current subscriptions from backend
  // { CODEFORCES: { active: true, divisions: ['DIV_1', 'DIV_2'] }, ... }
  let currentSubscriptions = {};
  
  // ===== HELPERS =====
  function getToken() { return localStorage.getItem('token'); }
  
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    };
  }
  
  // ===== LOAD EXISTING SUBSCRIPTIONS =====
  async function loadSubscriptions() {
    try {
      const response = await fetch(`${BASE_URL}/subscription`, {
        method: 'GET',
        headers: authHeaders()
      });
  
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error('Failed');
  
      const data = await response.json();
  
      // Build state object from array
      data.forEach(sub => {
        currentSubscriptions[sub.platform] = {
          active:    sub.active,
          divisions: sub.divisions || []
        };
      });
  
      // Pre-fill UI based on existing subscriptions
      prefillUI();
  
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  }
  
  // ===== PRE-FILL UI =====
  function prefillUI() {
    Object.keys(currentSubscriptions).forEach(platform => {
      const sub     = currentSubscriptions[platform];
      const toggle  = document.getElementById(`toggle-${platform}`);
      const divsDiv = document.getElementById(`divisions-${platform}`);
      const card    = document.getElementById(`card-${platform}`);
  
      if (!toggle) return;
  
      if (sub.active) {
        // Turn toggle on
        toggle.checked = true;
        divsDiv.hidden = false;
        card.classList.add('active');
        divsDiv.querySelectorAll('input[type="checkbox"]')
               .forEach(cb => cb.disabled = false);
               
        // Check the right division checkboxes
        const checkboxes = divsDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
          if (sub.divisions.includes(cb.value)) {
            cb.checked = true;
          }
        });
      }
    });
  }
  
  // ===== TOGGLE HANDLERS =====
  document.querySelectorAll('.toggle input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const platform = toggle.dataset.platform;
      const divsDiv  = document.getElementById(`divisions-${platform}`);
      const card     = document.getElementById(`card-${platform}`);
  
      if (toggle.checked) {
        divsDiv.hidden = false;
        card.classList.add('active');
        divsDiv.querySelectorAll('input[type="checkbox"]')
               .forEach(cb => cb.disabled = false);
      } else {
        divsDiv.hidden = true;
        card.classList.remove('active');
        divsDiv.querySelectorAll('input[type="checkbox"]')
               .forEach(cb => { cb.checked = false; cb.disabled = true; });
      }
    });
  });
  
  // ===== GET SELECTED DIVISIONS =====
  function getSelectedDivisions(platform) {
    const divsDiv   = document.getElementById(`divisions-${platform}`);
    const checked   = [...divsDiv.querySelectorAll('input[type="checkbox"]:checked')]
                      .map(cb => cb.value);
  
    // If nothing selected send all divisions for that platform
    return checked.length > 0 ? checked : ALL_DIVISIONS[platform];
  }
  
  // ===== SAVE SUBSCRIPTIONS =====
  document.getElementById('save-btn').addEventListener('click', async () => {
    const saveBtn = document.getElementById('save-btn');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled    = true;
  
    document.getElementById('save-success').hidden = true;
    document.getElementById('save-error').hidden   = true;
  
    const platforms = ['CODEFORCES', 'LEETCODE', 'CODECHEF', 'ATCODER', 'HACKERRANK'];
  
    try {
      for (const platform of platforms) {
        const toggle     = document.getElementById(`toggle-${platform}`);
        const isEnabled  = toggle.checked;
        const wasEnabled = currentSubscriptions[platform]?.active || false;
  
        if (isEnabled && !wasEnabled) {
          // New subscription — POST subscribe
          await fetch(`${BASE_URL}/subscription/subscribe`, {
            method:  'POST',
            headers: authHeaders(),
            body:    JSON.stringify({
              platform,
              divisions: getSelectedDivisions(platform)
            })
          });
  
        } else if (isEnabled && wasEnabled) {
          // Already subscribed — PUT update
          await fetch(`${BASE_URL}/subscription/update`, {
            method:  'PUT',
            headers: authHeaders(),
            body:    JSON.stringify({
              platform,
              divisions: getSelectedDivisions(platform)
            })
          });
  
        } else if (!isEnabled && wasEnabled) {
          // Toggled off — POST unsubscribe
          await fetch(`${BASE_URL}/subscription/unsubscribe/${platform}`, {
            method:  'POST',
            headers: authHeaders()
          });
        }
        // if !isEnabled && !wasEnabled — do nothing
      }
  
      // Reload subscriptions to sync state
      currentSubscriptions = {};
      await loadSubscriptions();
  
      document.getElementById('save-success').hidden = false;
  
    } catch (error) {
      document.getElementById('save-error').hidden = false;
    }
  
    saveBtn.textContent = 'Save Subscriptions';
    saveBtn.disabled    = false;
  });
  
  // ===== INIT =====
  loadSubscriptions();