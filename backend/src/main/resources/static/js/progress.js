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

// Helper to get YYYY-MM-DD in local time
function getLocalDateString(d = new Date()) {
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// Set default date to today
function setDefaultDate() {
    const dateInput = document.getElementById('date');
    dateInput.value = getLocalDateString();
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

        tableBody.innerHTML = '';
        result.data.forEach(p => {
            const tr = document.createElement('tr');

            const dateTd = document.createElement('td');
            dateTd.textContent = (typeof p.date === 'string' && p.date.length === 10)
                ? p.date
                : getLocalDateString(p.date);
            tr.appendChild(dateTd);

            const weightTd = document.createElement('td');
            weightTd.textContent = p.weight;
            tr.appendChild(weightTd);

            const workoutTd = document.createElement('td');
            const workoutBadge = document.createElement('span');
            workoutBadge.className = p.workoutCompleted ? 'badge badge-success' : 'badge badge-danger';
            workoutBadge.textContent = p.workoutCompleted ? 'Yes' : 'No';
            workoutTd.appendChild(workoutBadge);
            tr.appendChild(workoutTd);

            const waterTd = document.createElement('td');
            waterTd.textContent = p.waterIntake != null ? p.waterIntake : 0;
            tr.appendChild(waterTd);

            const notesTd = document.createElement('td');
            notesTd.textContent = p.notes || '--';
            tr.appendChild(notesTd);

            const actionsTd = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-primary';
            editBtn.textContent = 'Edit';
            editBtn.style.marginRight = '5px';
            editBtn.addEventListener('click', () => editProgress(p));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteProgress(p.id));

            actionsTd.appendChild(editBtn);
            actionsTd.appendChild(deleteBtn);
            tr.appendChild(actionsTd);

            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Edit progress — populate form with existing data
function editProgress(p) {
    document.getElementById('edit-id').value = p.id;

    let dateVal = '';
    if (p.date) {
        if (typeof p.date === 'string' && p.date.length === 10) {
            dateVal = p.date;
        } else {
            dateVal = getLocalDateString(p.date);
        }
    }
    document.getElementById('date').value = dateVal || getLocalDateString();
    document.getElementById('weight').value = p.weight;
    document.getElementById('workoutCompleted').value = p.workoutCompleted ? 'true' : 'false';
    document.getElementById('waterIntake').value = p.waterIntake != null ? p.waterIntake : 0;
    document.getElementById('notes').value = p.notes || '';

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
