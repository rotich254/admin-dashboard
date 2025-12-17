// Notification badges for sidebar navigation
// This file should be included on all pages to show unread counts

async function updateNotificationBadges() {
    try {
        // Update messages badge
        await updateMessagesBadge();

        // Update subscribers badge (new subscribers today)
        await updateSubscribersBadge();
    } catch (error) {
        console.error('Error updating notification badges:', error);
    }
}

async function updateMessagesBadge() {
    try {
        const response = await apiGet('/messages/');
        const data = await response.json();

        const badge = document.getElementById('messages-badge');
        if (badge && data.unread_count > 0) {
            badge.textContent = data.unread_count > 99 ? '99+' : data.unread_count;
            badge.style.display = 'inline-block';
        } else if (badge) {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching messages count:', error);
    }
}

async function updateSubscribersBadge() {
    try {
        const response = await apiGet('/subscribers/stats/');
        const data = await response.json();

        const badge = document.getElementById('subscribers-badge');
        // Show badge for new subscribers today
        if (badge && data.new_today > 0) {
            badge.textContent = data.new_today > 99 ? '99+' : data.new_today;
            badge.style.display = 'inline-block';
        } else if (badge) {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching subscribers count:', error);
    }
}

// Update badges when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Only update if user is authenticated
    if (typeof isAuthenticated === 'function' && isAuthenticated()) {
        updateNotificationBadges();

        // Refresh badges every 30 seconds
        setInterval(updateNotificationBadges, 30000);
    }
});
