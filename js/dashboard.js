// Check authentication
checkAuthAndRedirect();

// Load statistics on page load
document.addEventListener('DOMContentLoaded', function () {
    displayUserInfo();
    initLogoutButtons();
    loadStatistics();
});

// Fetch and display statistics
async function loadStatistics() {
    try {
        const response = await apiGet('/subscribers/stats/');
        const data = await response.json();

        document.getElementById('total-subscribers').textContent = data.total_subscribers || 0;
        document.getElementById('new-today').textContent = data.new_today || 0;
        document.getElementById('new-week').textContent = data.new_this_week || 0;
    } catch (error) {
        console.error('Error loading statistics:', error);
        // If error due to auth, user will be redirected by apiGet
    }
}
