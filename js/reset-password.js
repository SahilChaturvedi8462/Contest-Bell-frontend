// ===== LOADER =====
window.addEventListener('load', () => {
    document.getElementById('loader-overlay').classList.add('hide');
  });
  
  // ===== READ TOKEN FROM URL =====
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get('token');
  
  // If no token in URL show invalid message and hide form
  window.addEventListener('DOMContentLoaded', () => {
    if (!resetToken) {
      document.getElementById('reset-password-form').hidden = true;
      document.getElementById('invalid-token-message').hidden = false;
    }
  });
  
  // ===== RESET PASSWORD FORM =====
  document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
  
    // Check passwords match before hitting backend
    if (password !== confirmPassword) {
      document.getElementById('password-mismatch-error').hidden = false;
      return;
    } else {
      document.getElementById('password-mismatch-error').hidden = true;
    }
  
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Resetting...';
    submitBtn.disabled = true;
  
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword: password
        })
      });
  
      if (response.ok) {
        // Hide form show success
        document.getElementById('reset-password-form').hidden = true;
        document.getElementById('success-message').hidden = false;
  
      } else {
        const data = await response.text();
        showError(`❌ ${data}`);
        submitBtn.textContent = 'Reset Password';
        submitBtn.disabled = false;
      }
  
    } catch (error) {
      showError('❌ Could not connect to server. Please try again.');
      submitBtn.textContent = 'Reset Password';
      submitBtn.disabled = false;
    }
  });
  
  // ===== ERROR HELPER =====
  function showError(message) {
    let errorMsg = document.getElementById('reset-error');
    if (!errorMsg) {
      errorMsg = document.createElement('p');
      errorMsg.id = 'reset-error';
      errorMsg.style.color = '#ff5f57';
      errorMsg.style.fontSize = '0.9rem';
      errorMsg.style.marginTop = '0.75rem';
      errorMsg.style.textAlign = 'center';
      document.getElementById('reset-password-form')
              .querySelector('button')
              .insertAdjacentElement('afterend', errorMsg);
    }
    errorMsg.textContent = message;
  }