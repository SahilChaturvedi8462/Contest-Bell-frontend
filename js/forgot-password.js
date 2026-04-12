// ===== LOADER =====
window.addEventListener('load', () => {
  document.getElementById('loader-overlay').classList.add('hide');
});

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('error') === 'invalid-token') {
    showError('❌ Reset link is invalid or expired. Please request a new one.');
  }
});

// ===== FORGOT PASSWORD FORM =====
document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${BASE_URL}/auth/forget-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      // Hide form and show success message
      document.getElementById('forgot-password-form').hidden = true;
      document.getElementById('success-message').hidden = false;

    } else {
      const data = await response.text();
      showError(`❌ ${data}`);
      submitBtn.textContent = 'Send Reset Link';
      submitBtn.disabled = false;
    }

  } catch (error) {
    showError('❌ Could not connect to server. Please try again.');
    submitBtn.textContent = 'Send Reset Link';
    submitBtn.disabled = false;
  }
});

// ===== ERROR HELPER =====
function showError(message) {
  let errorMsg = document.getElementById('forgot-error');
  if (!errorMsg) {
    errorMsg = document.createElement('p');
    errorMsg.id = 'forgot-error';
    errorMsg.style.color = '#ff5f57';
    errorMsg.style.fontSize = '0.9rem';
    errorMsg.style.marginTop = '0.75rem';
    errorMsg.style.textAlign = 'center';
    document.getElementById('forgot-password-form')
      .querySelector('button')
      .insertAdjacentElement('afterend', errorMsg);
  }
  errorMsg.textContent = message;
}