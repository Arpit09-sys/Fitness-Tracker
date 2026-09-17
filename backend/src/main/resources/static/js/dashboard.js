// ========== Dashboard Page ==========

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

// Format goal text
function formatGoal(goal) {
    const goals = { lose: 'Lose Weight', gain: 'Gain Muscle', maintain: 'Maintain' };
    return goals[goal] || goal || '--';
}

// Load dashboard data
async function loadDashboard() {
    if (!checkAuth()) return;

    try {
        const result = await apiCall('/dashboard');
        const d = result.data;

        // Welcome message
        const name = (d.user && d.user.name) || localStorage.getItem('userName') || 'User';
        document.getElementById('welcome-msg').textContent = 'Welcome back, ' + name + '!';

        // Stats
        document.getElementById('stat-weight').textContent = (d.user && d.user.weight) || '--';
        document.getElementById('stat-height').textContent = (d.user && d.user.height) || '--';
        document.getElementById('stat-bmi').textContent = d.bmi || '--';
        document.getElementById('stat-goal').textContent = formatGoal(d.user && d.user.goal);

        // BMI section
        if (d.bmi) {
            document.getElementById('bmi-text').textContent = 'Your BMI is ' + d.bmi;
            document.getElementById('bmi-category').textContent = 'Category: ' + d.bmiCategory;
            document.getElementById('bmi-bar').style.display = 'block';
            document.getElementById('bmi-labels').style.display = 'flex';

            // Position BMI indicator (BMI range 15-40 mapped to 0-100%)
            const position = Math.min(Math.max(((d.bmi - 15) / 25) * 100, 0), 100);
            document.getElementById('bmi-indicator').style.left = position + '%';
        }

        // Calorie section
        const calorieInfo = document.getElementById('calorie-info');
        if (d.bmr && d.dailyCalories) {
            calorieInfo.innerHTML = '';

            const bmrP = document.createElement('p');
            bmrP.style.marginBottom = '8px';
            const bmrStrong = document.createElement('strong');
            bmrStrong.textContent = 'BMR (Base Metabolic Rate): ';
            bmrP.appendChild(bmrStrong);
            bmrP.appendChild(document.createTextNode(d.bmr + ' cal/day'));
            calorieInfo.appendChild(bmrP);

            const calP = document.createElement('p');
            const calStrong = document.createElement('strong');
            calStrong.textContent = 'Estimated Daily Need: ';
            calP.appendChild(calStrong);
            const calSpan = document.createElement('span');
            calSpan.style.fontSize = '20px';
            calSpan.style.color = 'var(--primary)';
            calSpan.style.fontWeight = '700';
            calSpan.textContent = d.dailyCalories;
            calP.appendChild(calSpan);
            calP.appendChild(document.createTextNode(' cal/day'));
            calorieInfo.appendChild(calP);

            const actP = document.createElement('p');
            actP.className = 'text-muted';
            actP.style.fontSize = '13px';
            actP.style.marginTop = '8px';
            actP.textContent = 'Based on your activity level: ' + ((d.user && d.user.activityLevel) || 'sedentary');
            calorieInfo.appendChild(actP);
        } else if (d.user && d.user.gender === 'Other') {
            calorieInfo.innerHTML = '';
            const p = document.createElement('p');
            p.className = 'text-muted';
            p.textContent = 'BMR and daily calorie calculations are not available for gender selection "Other".';
            calorieInfo.appendChild(p);
        }

        // Water section
        if (d.waterGoal) {
            let todayWater = 0;
            if (d.recentProgress && d.recentProgress.length > 0) {
                const today = getLocalDateString();
                const todayEntry = d.recentProgress.find(p => {
                    const pDate = (typeof p.date === 'string')
                        ? (p.date.length === 10 ? p.date : p.date.split('T')[0])
                        : getLocalDateString(p.date);
                    return pDate === today;
                });
                if (todayEntry) todayWater = todayEntry.waterIntake || 0;
            }
            const remaining = Math.max(d.waterGoal - todayWater, 0);
            const percentage = Math.min((todayWater / d.waterGoal) * 100, 100);

            const waterInfo = document.getElementById('water-info');
            waterInfo.innerHTML = '';

            const recP = document.createElement('p');
            const recStrong = document.createElement('strong');
            recStrong.textContent = 'Recommended: ';
            recP.appendChild(recStrong);
            recP.appendChild(document.createTextNode(d.waterGoal + ' ml'));
            waterInfo.appendChild(recP);

            const todayP = document.createElement('p');
            const todayStrong = document.createElement('strong');
            todayStrong.textContent = "Today's Intake: ";
            todayP.appendChild(todayStrong);
            todayP.appendChild(document.createTextNode(todayWater + ' ml'));
            waterInfo.appendChild(todayP);

            const barDiv = document.createElement('div');
            barDiv.className = 'water-bar';
            const fillDiv = document.createElement('div');
            fillDiv.className = 'water-fill';
            fillDiv.style.width = percentage + '%';
            barDiv.appendChild(fillDiv);
            waterInfo.appendChild(barDiv);

            const remP = document.createElement('p');
            remP.className = 'text-muted';
            remP.style.fontSize = '13px';
            const remStrong = document.createElement('strong');
            remStrong.textContent = 'Remaining: ';
            remP.appendChild(remStrong);
            remP.appendChild(document.createTextNode(remaining + ' ml'));
            waterInfo.appendChild(remP);
        }

        // Recent progress
        if (d.recentProgress && d.recentProgress.length > 0) {
            const container = document.getElementById('recent-progress');
            container.innerHTML = '';

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Date</th><th>Weight</th><th>Workout</th></tr>';
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            d.recentProgress.forEach(p => {
                const tr = document.createElement('tr');

                const dateTd = document.createElement('td');
                dateTd.textContent = (typeof p.date === 'string' && p.date.length === 10)
                    ? p.date
                    : getLocalDateString(p.date);
                tr.appendChild(dateTd);

                const weightTd = document.createElement('td');
                weightTd.textContent = p.weight + ' kg';
                tr.appendChild(weightTd);

                const workoutTd = document.createElement('td');
                const badge = document.createElement('span');
                badge.className = p.workoutCompleted ? 'badge badge-success' : 'badge badge-danger';
                badge.textContent = p.workoutCompleted ? 'Yes' : 'No';
                workoutTd.appendChild(badge);
                tr.appendChild(workoutTd);

                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);
        }

    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
