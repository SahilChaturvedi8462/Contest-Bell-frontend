const BASE_URL = "http://localhost:8080";

// ===== AUTH HELPER =====
function getToken() {
    return localStorage.getItem('token');
  }
  
  function requireAuth() {
    const token = getToken();
    if (!token) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
  
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
  }