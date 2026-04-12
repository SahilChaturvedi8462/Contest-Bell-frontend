// ===== LOADER =====
window.addEventListener('load', () => {
    document.getElementById('loader-overlay').classList.add('hide');
  });
  
  // ===== AUTH CHECK =====
  if (!requireAuth()) {
    throw new Error('Not authenticated');
  }
  
  // ===== PLATFORM DISPLAY NAMES =====
  const PLATFORM_NAMES = {
    CODEFORCES: 'Codeforces',
    LEETCODE:   'LeetCode',
    CODECHEF:   'CodeChef',
    ATCODER:    'AtCoder',
    HACKERRANK: 'HackerRank'
  };
  
  // ===== DIVISION DISPLAY NAMES =====
  const DIVISION_NAMES = {
    DIV_1:          'Div. 1',
    DIV_2:          'Div. 2',
    DIV_1_2:        'Div. 1+2',
    DIV_3:          'Div. 3',
    DIV_4:          'Div. 4',
    EDUCATIONAL:    'Educational',
    GLOBAL:         'Global',
    WEEKLY:         'Weekly',
    BIWEEKLY:       'Biweekly',
    STARTERS:       'Starters',
    COOK_OFF:       'Cook-Off',
    LUNCHTIME:      'Lunchtime',
    LONG_CHALLENGE: 'Long Challenge',
    BEGINNER:       'Beginner',
    REGULAR:        'Regular',
    GRAND:          'Grand',
    HEURISTIC:      'Heuristic',
    OTHER:          'Other'
  };
  
  // ===== STATE =====
  let allContests = [];
  let activeFilter = 'ALL';
  
  // ===== HELPERS =====
  function show(id) { document.getElementById(id).style.display = 'flex'; }
  function hide(id) { document.getElementById(id).style.display = 'none'; }
  
  // ===== FETCH CONTESTS =====
  async function fetchContests() {
    show('loading-state');
    hide('error-state');
    hide('empty-state');
    hide('contest-list');
  
    try {
      const response = await fetch(`${BASE_URL}/contests/upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        }
      });
  
      if (response.status === 401) { logout(); return; }
      if (!response.ok) throw new Error('Failed');
  
      allContests = await response.json();
      hide('loading-state');
  
      if (allContests.length === 0) {
        show('empty-state');
      } else {
        show('contest-list');
        renderContests(allContests);
      }
  
    } catch (error) {
      hide('loading-state');
      show('error-state');
    }
  }
  
  // ===== RENDER CONTESTS =====
  function renderContests(contests) {
    const list = document.getElementById('contest-list');
    list.innerHTML = '';
  
    const filtered = activeFilter === 'ALL'
      ? contests
      : contests.filter(c => c.platform === activeFilter);
  
    if (filtered.length === 0) {
      list.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding: 3rem 0;">
        No contests found for this platform.
      </p>`;
      return;
    }
  
    filtered.forEach(contest => {
      const card = document.createElement('div');
      card.classList.add('contest-card');
      card.dataset.platform = contest.platform;
  
      const startTime = new Date(contest.startTimeUtc + 'Z');
      const localTime = startTime.toLocaleString(undefined, {
        weekday: 'short',
        day:     'numeric',
        month:   'short',
        year:    'numeric',
        hour:    '2-digit',
        minute:  '2-digit'
      });
  
      const duration   = formatDuration(contest.durationSeconds);
      const phase      = contest.phase === 'CODING' ? 'RUNNING' : contest.phase;
      const phaseLabel = phase === 'RUNNING' ? 'Live Now' : 'Upcoming';
      const divLabel   = DIVISION_NAMES[contest.division] || contest.division;
      const platLabel  = PLATFORM_NAMES[contest.platform] || contest.platform;
  
      card.innerHTML = `
        <div class="contest-card-left">
          <span class="platform-badge ${contest.platform}">${platLabel}</span>
          <span class="division-badge">${divLabel}</span>
        </div>
        <div class="contest-card-mid">
          <h3 class="contest-name">${contest.name}</h3>
          <p class="contest-time">🕐 ${localTime}</p>
          <p class="contest-duration">⏱ Duration: ${duration}</p>
        </div>
        <div class="contest-card-right">
          <span class="phase-badge ${phase}">${phaseLabel}</span>
          <a href="${contest.contestUrl}" target="_blank" class="btn-secondary">
            View Contest
          </a>
        </div>
      `;
  
      list.appendChild(card);
    });
  }
  
  // ===== FORMAT DURATION =====
  function formatDuration(seconds) {
    if (!seconds) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  
  // ===== FILTER BUTTONS =====
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderContests(allContests);
    });
  });
  
  // ===== RETRY BUTTON =====
  document.getElementById('retry-btn').addEventListener('click', fetchContests);
  
  // ===== INIT =====
  fetchContests();