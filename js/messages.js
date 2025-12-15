// Check authentication
checkAuthAndRedirect();

let selectedMessage = null;

document.addEventListener('DOMContentLoaded', function () {
    displayUserInfo();
    initLogoutButtons();
    loadMessages();
});

async function loadMessages() {
    try {
        const response = await apiGet('/messages/');
        const data = await response.json();

        displayMessages(data.messages);
        document.getElementById('unread-count').textContent = data.unread_count || 0;
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById('messages-list').innerHTML =
            '<div class="alert alert-danger">Error loading messages</div>';
    }
}

function displayMessages(messages) {
    const container = document.getElementById('messages-list');

    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="text-center text-muted">No messages</div>';
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="message-item ${!msg.is_read ? 'unread' : ''}" onclick="viewMessage(${msg.id})">
            <div class="d-flex align-items-start gap-3 p-3 border-bottom" style="cursor: pointer;">
                <i class="bi bi-${msg.is_read ? 'envelope-open' : 'envelope-fill'} fs-5"></i>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <strong>${msg.email}</strong>
                        ${!msg.is_read ? '<span class="badge bg-primary">New</span>' : ''}
                    </div>
                    <p class="text-muted mb-0 small">${truncate(msg.message, 60)}</p>
                    <small class="text-muted">${formatDate(msg.created_at)}</small>
                </div>
            </div>
        </div>
    `).join('');
}

async function viewMessage(messageId) {
    try {
        const response = await apiGet('/messages/');
        const data = await response.json();
        const message = data.messages.find(m => m.id === messageId);

        if (!message) return;

        // Display message
        document.getElementById('message-detail').innerHTML = `
            <div>
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5>${message.email}</h5>
                        <small class="text-muted">${formatDate(message.created_at)}</small>
                    </div>
                </div>
                <hr>
                <p style="white-space: pre-wrap;">${message.message}</p>
            </div>
        `;

        // Mark as read if unread
        if (!message.is_read) {
            await markAsRead(messageId);
        }
    } catch (error) {
        console.error('Error viewing message:', error);
    }
}

async function markAsRead(messageId) {
    try {
        await apiPost(`/messages/${messageId}/read/`, {});
        loadMessages(); // Reload to update unread count
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function truncate(str, length) {
    return str.length > length ? str.substring(0, length) + '...' : str;
}

// Load messages when page loads
loadMessages();
