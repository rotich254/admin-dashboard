// Check authentication
checkAuthAndRedirect();

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    displayUserInfo();
    initLogoutButtons();
});

async function sendNewsletter(event) {
    event.preventDefault();

    const subject = document.getElementById('subject').value;
    const content = document.getElementById('content').value;
    const sendBtn = document.getElementById('send-btn');
    const alertContainer = document.getElementById('alert-container');

    // Disable button
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

    try {
        const response = await apiPost('/newsletter/send/', { subject, content });
        const data = await response.json();

        if (response.ok) {
            // Success
            alertContainer.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="bi bi-check-circle me-2"></i>
                    Newsletter sent successfully to ${data.recipients_count} subscribers!
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            clearForm();
        } else {
            // Error
            alertContainer.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${data.message || 'Failed to send newsletter'}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error sending newsletter:', error);
        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error sending newsletter. Please try again.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    } finally {
        // Re-enable button
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="bi bi-send"></i> Send Newsletter';
    }
}

function clearForm() {
    document.getElementById('subject').value = '';
    document.getElementById('content').value = '';
    document.getElementById('alert-container').innerHTML = '';
}
