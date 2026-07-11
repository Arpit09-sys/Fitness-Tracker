// ========== Auth Helper Functions ==========

const API_URL = '/api';

// Show alert message
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alert-box');
    if (!alertBox) return;
    alertBox.innerHTML = '<div class="alert alert-' + type + '">' + message + '</div>';
    setTimeout(() => { alertBox.innerHTML = ''; }, 4000);
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/index.html';
}

// API call helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    const config = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(API_URL + endpoint, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// ========== Login Form ==========
const loginForm = document.getElementById('login-form');
if (loginForm) {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('token')) {
        window.location.href = '/dashboard.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await apiCall('/auth/login', 'POST', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            window.location.href = '/dashboard.html';
        } catch (error) {
            showAlert(error.message);
        }
    });
}

// ========== Register Form ==========
const registerForm = document.getElementById('register-form');
if (registerForm) {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('token')) {
        window.location.href = '/dashboard.html';
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            age: document.getElementById('age').value || null,
            gender: document.getElementById('gender').value || null,
            height: document.getElementById('height').value || null,
            weight: document.getElementById('weight').value || null,
            activityLevel: document.getElementById('activityLevel').value,
            goal: document.getElementById('goal').value
        };

        try {
            const data = await apiCall('/auth/signup', 'POST', payload);
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.name);
            window.location.href = '/dashboard.html';
        } catch (error) {
            showAlert(error.message);
        }
    });
}
