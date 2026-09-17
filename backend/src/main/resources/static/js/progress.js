// ========== Progress Page ==========

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

// Set default date to today
function setDefaultDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

// Load progress entries into the table
async function loadProgress() {
    if (!checkAuth()) return;

    try {
        const result = await apiCall('/progress');
        const tableBody = document.getElementById('progress-table');

        if (!result.data || result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No progress entries yet. Start tracking above!</td></tr>';
            return;
        }

        let html = '';
        result.data.forEach(p => {
            const entryId = p.id;
            const date = (typeof p.date === 'string' && p.date.length === 10)
                ? p.date
                : new Date(p.date).toLocaleDateString();

            const workout = p.workoutCompleted
                ? '<span class="badge badge-success">Yes</span>'
                : '<span class="badge badge-danger">No</span>';

            const safeNotes = (p.notes || '').replace(/'/g, "\\'");

            html += '<tr>' +
                '<td>' + date + '</td>' +
                '<td>' + p.weight + '</td>' +
                '<td>' + workout + '</td>' +
                '<td>' + (p.waterIntake || 0) + '</td>' +
                '<td>' + (p.notes || '--') + '</td>' +
                '<td>' +
                    '<button class="btn btn-sm btn-primary" onclick="editProgress(\'' + entryId + '\', \'' + (p.date || '') + '\', ' + p.weight + ', ' + p.workoutCompleted + ', ' + (p.waterIntake || 0) + ', \'' + safeNotes + '\')">Edit</button> ' +
                    '<button class="btn btn-sm btn-danger" onclick="deleteProgress(\'' + entryId + '\')">Delete</button>' +
                '</td>' +
                '</tr>';
        });
        tableBody.innerHTML = html;
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Edit progress — populate form with existing data
function editProgress(id, date, weight, workoutCompleted, waterIntake, notes) {
    document.getElementById('edit-id').value = id;

    let dateVal = '';
    if (date) {
        if (typeof date === 'string' && date.length === 10) {
            dateVal = date;
        } else {
            dateVal = new Date(date).toISOString().split('T')[0];
        }
    }
    document.getElementById('date').value = dateVal || new Date().toISOString().split('T')[0];
    document.getElementById('weight').value = weight;
    document.getElementById('workoutCompleted').value = workoutCompleted ? 'true' : 'false';
    document.getElementById('waterIntake').value = waterIntake;
    document.getElementById('notes').value = notes;

    document.getElementById('form-title').textContent = 'Edit Progress Entry';
    document.getElementById('submit-btn').textContent = 'Update Entry';
    document.getElementById('cancel-btn').classList.remove('hidden');
}

// Cancel edit mode
function cancelEdit() {
    document.getElementById('edit-id').value = '';
    document.getElementById('progress-form').reset();
    setDefaultDate();

    document.getElementById('form-title').textContent = 'Add Daily Progress';
    document.getElementById('submit-btn').textContent = 'Add Entry';
    document.getElementById('cancel-btn').classList.add('hidden');
}

// Delete progress entry
async function deleteProgress(id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
        await apiCall('/progress/' + id, 'DELETE');
        showAlert('Entry deleted successfully!', 'success');
        loadProgress();
    } catch (error) {
        showAlert(error.message);
    }
}

// Handle progress form submission (add or update)
document.getElementById('progress-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = document.getElementById('edit-id').value;
    const payload = {
        date: document.getElementById('date').value,
        weight: Number(document.getElementById('weight').value),
        workoutCompleted: document.getElementById('workoutCompleted').value === 'true',
        waterIntake: Number(document.getElementById('waterIntake').value) || 0,
        notes: document.getElementById('notes').value.trim()
    };

    if (!payload.weight) {
        showAlert('Weight is required');
        return;
    }

    try {
        if (editId) {
            // Update existing entry
            await apiCall('/progress/' + editId, 'PUT', payload);
            showAlert('Entry updated successfully!', 'success');
            cancelEdit();
        } else {
            // Add new entry
            await apiCall('/progress', 'POST', payload);
            showAlert('Entry added successfully!', 'success');
            document.getElementById('progress-form').reset();
            setDefaultDate();
        }

        loadProgress();
    } catch (error) {
        showAlert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDate();
    loadProgress();
});
