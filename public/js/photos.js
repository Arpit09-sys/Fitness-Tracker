// ========== Photos Page ==========

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

// Load photos gallery
async function loadPhotos() {
    if (!checkAuth()) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL + '/photos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Failed to load photos');

        const gallery = document.getElementById('photo-gallery');

        if (!result.data || result.data.length === 0) {
            gallery.innerHTML = '<div class="empty-state"><p>No photos uploaded yet. Upload your first progress photos above!</p></div>';
            return;
        }

        let html = '';
        result.data.forEach(photo => {
            const date = new Date(photo.uploadDate).toLocaleDateString();

            html += '<div class="card photo-card">';
            html += '<h4>Uploaded on ' + date + '</h4>';
            html += '<div class="photo-row">';

            if (photo.frontPhoto) {
                html += '<div class="photo-item">';
                html += '<p class="photo-label">Front View</p>';
                html += '<img src="' + photo.frontPhoto + '" alt="Front photo" class="progress-photo">';
                html += '</div>';
            }

            if (photo.sidePhoto) {
                html += '<div class="photo-item">';
                html += '<p class="photo-label">Side View</p>';
                html += '<img src="' + photo.sidePhoto + '" alt="Side photo" class="progress-photo">';
                html += '</div>';
            }

            html += '</div>';
            html += '</div>';
        });

        gallery.innerHTML = html;
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

// Handle photo upload form
document.getElementById('photo-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const frontPhotoInput = document.getElementById('frontPhoto');
    const sidePhotoInput = document.getElementById('sidePhoto');

    const frontFile = frontPhotoInput.files[0];
    const sideFile = sidePhotoInput.files[0];

    if (!frontFile && !sideFile) {
        showAlert('Please select at least one photo to upload');
        return;
    }

    const formData = new FormData();
    if (frontFile) formData.append('frontPhoto', frontFile);
    if (sideFile) formData.append('sidePhoto', sideFile);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_URL + '/photos', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || 'Upload failed');

        showAlert('Photos uploaded successfully!', 'success');

        // Reset form
        document.getElementById('photo-form').reset();

        // Reload gallery
        loadPhotos();
    } catch (error) {
        showAlert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', loadPhotos);
