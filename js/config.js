// const BASE_URL = "https://contest-bell.onrender.com";
// js/config.js
const BASE_URL = "http://localhost:8080";
// ===== AUTH HELPERS =====
function getToken() {
  return localStorage.getItem('token');
}

function isTokenExpired() {
  const token = getToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
  } catch (e) {
    return true;
  }
}

function requireAuth() {
  const token = getToken();
  if (!token || isTokenExpired()) {
    logout();
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  window.location.href = 'login.html';
}