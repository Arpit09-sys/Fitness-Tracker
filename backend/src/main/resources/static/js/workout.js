// ========== Workout Page ==========

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

// Load workouts into the table
async function loadWorkouts() {
    if (!checkAuth()) return;

    try {
        const result = await apiCall('/workout');
        const tableBody = document.getElementById('workout-table');

        if (!result.data || result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No workouts logged yet. Add your first workout above!</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        result.data.forEach(w => {
            const tr = document.createElement('tr');

            const dateTd = document.createElement('td');
            dateTd.textContent = (typeof w.date === 'string' && w.date.length === 10)
                ? w.date
                : (w.date ? new Date(w.date).toLocaleDateString() : '--');
            tr.appendChild(dateTd);

            const nameTd = document.createElement('td');
            nameTd.textContent = w.name;
            tr.appendChild(nameTd);

            const durationTd = document.createElement('td');
            durationTd.textContent = w.duration;
            tr.appendChild(durationTd);

            const notesTd = document.createElement('td');
            notesTd.textContent = w.notes || '--';
            tr.appendChild(notesTd);

            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading workouts:', error);
    }
}

// Handle workout form submission
document.getElementById('workout-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const duration = document.getElementById('duration').value;
    const notes = document.getElementById('notes').value.trim();

    if (!name || !duration) {
        showAlert('Workout name and duration are required');
        return;
    }

    try {
        await apiCall('/workout', 'POST', { name, duration: Number(duration), notes });
        showAlert('Workout added successfully!', 'success');

        // Reset form
        document.getElementById('workout-form').reset();

        // Reload workouts
        loadWorkouts();
    } catch (error) {
        showAlert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', loadWorkouts);
