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

        // Store selected message for reply
        selectedMessage = message;

        // Display message with Reply button
        document.getElementById('message-detail').innerHTML = `
            <div>
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5>${message.email}</h5>
                        <small class="text-muted">${formatDate(message.created_at)}</small>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="openReplyModal()">
                        <i class="bi bi-reply me-1"></i>Reply
                    </button>
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

// Reply modal instance
let replyModal = null;

// Initialize reply modal when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    const modalEl = document.getElementById('replyModal');
    if (modalEl) {
        replyModal = new bootstrap.Modal(modalEl);
    }
});

// Open reply modal with pre-filled data
function openReplyModal() {
    if (!selectedMessage) {
        console.error('No message selected');
        return;
    }

    // Pre-fill the form
    document.getElementById('reply-to').value = selectedMessage.email;
    document.getElementById('reply-subject').value = `Re: Message from ${selectedMessage.email}`;
    document.getElementById('reply-content').value = '';
    document.getElementById('reply-alert-container').innerHTML = '';

    // Show the modal
    if (replyModal) {
        replyModal.show();
    }
}

// Send reply to the message sender
async function sendReply(event) {
    event.preventDefault();

    if (!selectedMessage) {
        console.error('No message selected');
        return;
    }

    const toEmail = document.getElementById('reply-to').value;
    const subject = document.getElementById('reply-subject').value;
    const content = document.getElementById('reply-content').value;
    const sendBtn = document.getElementById('send-reply-btn');
    const alertContainer = document.getElementById('reply-alert-container');

    // Disable button and show loading
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

    try {
        const response = await apiPost(`/messages/${selectedMessage.id}/reply/`, {
            to_email: toEmail,
            subject: subject,
            content: content
        });

        const data = await response.json();

        if (response.ok) {
            // Success
            alertContainer.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="bi bi-check-circle me-2"></i>
                    Reply sent successfully!
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;

            // Close modal after a short delay
            setTimeout(() => {
                if (replyModal) {
                    replyModal.hide();
                }
                // Clear the form
                document.getElementById('reply-content').value = '';
            }, 1500);
        } else {
            // Error from server
            alertContainer.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${data.message || 'Failed to send reply'}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error sending reply:', error);
        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error sending reply. Please try again.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    } finally {
        // Re-enable button
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="bi bi-send me-1"></i>Send Reply';
    }
}
