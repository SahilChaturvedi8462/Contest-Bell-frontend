// ===== LOADER =====
window.addEventListener('load', () => {
  document.getElementById('loader-overlay').classList.add('hide');
});

// ===== CHECK URL PARAMS ON LANDING =====
// Show messages if redirected from email verification
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get('verified') === 'true') {
    showBanner('✅ Email verified successfully! You can now log in.', 'success');
  }

  if (params.get('error') === 'invalid-token') {
    showBanner('❌ Verification link is invalid or expired. Please request a new one.', 'error');
  }
});

// ===== BANNER HELPER =====
function showBanner(message, type) {
  // Remove any existing banners first
  document.querySelectorAll('.auth-banner').forEach(b => b.remove());

  const banner = document.createElement('p');
  banner.style.opacity = '1';
  banner.style.transition = 'opacity 0.5s ease';
  banner.textContent = message;
  banner.style.textAlign = 'center';
  banner.style.padding = '0.75rem 1rem';
  banner.style.borderRadius = '8px';
  banner.style.fontSize = '0.9rem';
  banner.style.marginBottom = '1.25rem';

  if (type === 'success') {
    banner.style.backgroundColor = 'rgba(40, 200, 64, 0.1)';
    banner.style.border = '1px solid rgba(40, 200, 64, 0.3)';
    banner.style.color = '#28c840';
  } else {
    banner.style.backgroundColor = 'rgba(255, 95, 87, 0.1)';
    banner.style.border = '1px solid rgba(255, 95, 87, 0.3)';
    banner.style.color = '#ff5f57';
  }

  const form = document.getElementById('login-form');
  form.insertAdjacentElement('beforebegin', banner);

  // Auto remove after 4 seconds
  setTimeout(() => {
    banner.style.opacity = '0';
    setTimeout(() => banner.remove(), 500);
  }, 2000);
}

// ===== LOGIN FORM =====
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Logging In...';
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.text();

    if (response.ok) {
      // Store JWT token in localStorage
      localStorage.setItem('token', data);
      localStorage.setItem('userEmail', email);

      // Redirect to dashboard
      window.location.href = 'dashboard.html';

    } else {
      showBanner(`❌ ${data}`, 'error');
      submitBtn.textContent = 'Log In';
      submitBtn.disabled = false;
    }

  } catch (error) {
    showBanner('❌ Could not connect to server. Please try again.', 'error');
    submitBtn.textContent = 'Log In';
    submitBtn.disabled = false;
  }
});

// ===== RESEND VERIFICATION =====
document.getElementById('resend-verification-btn').addEventListener('click', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();

  if (!email) {
    showBanner('❌ Please enter your email address first.', 'error');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/resend-verification?email=${encodeURIComponent(email)}`, {
      method: 'POST'
    });

    if (response.ok) {
      showBanner('✅ Verification email sent! Please check your inbox.', 'success');
    } else {
      const data = await response.text();
      showBanner(`❌ ${data}`, 'error');
    }

  } catch (error) {
    showBanner('❌ Could not connect to server. Please try again.', 'error');
  }
});