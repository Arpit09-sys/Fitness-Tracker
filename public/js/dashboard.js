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
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/index.html'; return false; }
    return true;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/index.html';
}

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    const response = await fetch(API_URL + endpoint, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong');
    return data;
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
        const name = localStorage.getItem('userName') || 'User';
        document.getElementById('welcome-msg').textContent = 'Welcome back, ' + name + '!';

        // Stats
        document.getElementById('stat-weight').textContent = d.user.weight || '--';
        document.getElementById('stat-height').textContent = d.user.height || '--';
        document.getElementById('stat-bmi').textContent = d.bmi || '--';
        document.getElementById('stat-goal').textContent = formatGoal(d.user.goal);

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
        if (d.bmr && d.dailyCalories) {
            document.getElementById('calorie-info').innerHTML =
                '<p style="margin-bottom: 8px;"><strong>BMR (Base Metabolic Rate):</strong> ' + d.bmr + ' cal/day</p>' +
                '<p><strong>Estimated Daily Need:</strong> <span style="font-size: 20px; color: var(--primary); font-weight: 700;">' + d.dailyCalories + '</span> cal/day</p>' +
                '<p class="text-muted mt-1" style="font-size: 13px;">Based on your activity level: ' + (d.user.activityLevel || 'sedentary') + '</p>';
        }

        // Water section
        if (d.waterGoal) {
            // Get today's water intake from recent progress
            let todayWater = 0;
            if (d.recentProgress && d.recentProgress.length > 0) {
                const today = new Date().toDateString();
                const todayEntry = d.recentProgress.find(p => new Date(p.date).toDateString() === today);
                if (todayEntry) todayWater = todayEntry.waterIntake || 0;
            }
            const remaining = Math.max(d.waterGoal - todayWater, 0);
            const percentage = Math.min((todayWater / d.waterGoal) * 100, 100);

            document.getElementById('water-info').innerHTML =
                '<p><strong>Recommended:</strong> ' + d.waterGoal + ' ml</p>' +
                '<p><strong>Today\'s Intake:</strong> ' + todayWater + ' ml</p>' +
                '<div class="water-bar"><div class="water-fill" style="width: ' + percentage + '%;"></div></div>' +
                '<p class="text-muted" style="font-size: 13px;"><strong>Remaining:</strong> ' + remaining + ' ml</p>';
        }

        // Recent progress
        if (d.recentProgress && d.recentProgress.length > 0) {
            let html = '<table><thead><tr><th>Date</th><th>Weight</th><th>Workout</th></tr></thead><tbody>';
            d.recentProgress.forEach(p => {
                const date = new Date(p.date).toLocaleDateString();
                const workout = p.workoutCompleted
                    ? '<span class="badge badge-success">Yes</span>'
                    : '<span class="badge badge-danger">No</span>';
                html += '<tr><td>' + date + '</td><td>' + p.weight + ' kg</td><td>' + workout + '</td></tr>';
            });
            html += '</tbody></table>';
            document.getElementById('recent-progress').innerHTML = html;
        }

    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
