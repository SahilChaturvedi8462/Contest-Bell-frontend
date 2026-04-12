// ===== LOADER =====
window.addEventListener('load', () => {
    document.getElementById('loader-overlay').classList.add('hide');
  });
  
  // ===== REGISTER FORM =====
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const timeZone = document.getElementById('timezone').value || null;
  
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
  
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, timeZone })
      });
  
      const data = await response.text();
  
      if (response.ok) {
        // Hide form and show success message
        document.getElementById('register-form').hidden = true;
        
        const authCard = document.querySelector('.auth-card');
        
        const successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.innerHTML = `
          <p>✅ Account created successfully!</p>
          <p>We sent a verification email to <strong>${email}</strong>. 
          Please verify your email before logging in.</p>
          <br/>
          <a href="login.html" class="btn-primary btn-full">Go to Login</a>
        `;
        authCard.appendChild(successDiv);
  
      } else {
        // Show error below button
        let errorMsg = document.getElementById('register-error');
        if (!errorMsg) {
          errorMsg = document.createElement('p');
          errorMsg.id = 'register-error';
          errorMsg.style.color = '#ff5f57';
          errorMsg.style.fontSize = '0.9rem';
          errorMsg.style.marginTop = '0.75rem';
          errorMsg.style.textAlign = 'center';
          submitBtn.insertAdjacentElement('afterend', errorMsg);
        }
        errorMsg.textContent = `❌ ${data}`;
  
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
      }
  
    } catch (error) {
      let errorMsg = document.getElementById('register-error');
      if (!errorMsg) {
        errorMsg = document.createElement('p');
        errorMsg.id = 'register-error';
        errorMsg.style.color = '#ff5f57';
        errorMsg.style.fontSize = '0.9rem';
        errorMsg.style.marginTop = '0.75rem';
        errorMsg.style.textAlign = 'center';
        submitBtn.insertAdjacentElement('afterend', errorMsg);
      }
      errorMsg.textContent = '❌ Could not connect to server. Please try again.';
  
      submitBtn.textContent = 'Create Account';
      submitBtn.disabled = false;
    }
  });