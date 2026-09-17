// ========== Profile Page ==========

const API_URL = '/api';

function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alert-box');
    if (alertBox) {
        alertBox.innerHTML = '<div class="alert alert-' + type + '">' + message + '</div>';
        setTimeout(() => { alertBox.innerHTML = ''; }, 4000);
    }
}

function checkAuth() {
    const userName = localStorage.getItem('userName');
    if (!userName) {
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

async function logout() {
    try {
        await fetch(API_URL + '/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (e) {
        console.error('Logout error:', e);
    }
    localStorage.removeItem('userName');
    window.location.href = '/index.html';
}

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const config = { method, headers, credentials: 'same-origin' };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(API_URL + endpoint, config);
    const data = await response.json();

    if (response.status === 401) {
        localStorage.removeItem('userName');
        window.location.href = '/index.html';
        throw new Error(data.error || 'Please log in to continue');
    }

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// Load profile data
async function loadProfile() {
    if (!checkAuth()) return;

    try {
        const result = await apiCall('/profile');
        const user = result.data;

        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('age').value = user.age || '';
        document.getElementById('gender').value = user.gender || '';
        document.getElementById('height').value = user.height || '';
        document.getElementById('weight').value = user.weight || '';
        document.getElementById('activityLevel').value = user.activityLevel || 'sedentary';
        document.getElementById('goal').value = user.goal || 'maintain';
    } catch (error) {
        showAlert(error.message);
    }
}

// Update profile
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value ? Number(document.getElementById('age').value) : null,
        gender: document.getElementById('gender').value || null,
        height: document.getElementById('height').value ? Number(document.getElementById('height').value) : null,
        weight: document.getElementById('weight').value ? Number(document.getElementById('weight').value) : null,
        activityLevel: document.getElementById('activityLevel').value,
        goal: document.getElementById('goal').value
    };

    try {
        await apiCall('/profile', 'PUT', payload);
        localStorage.setItem('userName', payload.name);
        showAlert('Profile updated successfully!', 'success');
    } catch (error) {
        showAlert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', loadProfile);
