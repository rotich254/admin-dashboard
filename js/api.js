// API Request Wrapper
// Handles authenticated API requests with automatic token refresh

const API_BASE_URL = 'https://newsletter-api-tlzp.onrender.com/api';

/**
 * Make an authenticated API request
 * Automatically adds Authorization header and handles token refresh
 */
async function apiRequest(endpoint, options = {}) {
    // Get access token
    const accessToken = getAccessToken();

    if (!accessToken) {
        window.location.href = 'login.html';
        throw new Error('No access token');
    }

    // Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers
    };

    // Make the request
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        // If unauthorized, try to refresh token
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();

            if (refreshed) {
                // Retry the request with new token
                const newAccessToken = getAccessToken();
                headers['Authorization'] = `Bearer ${newAccessToken}`;

                const retryResponse = await fetch(url, {
                    ...options,
                    headers
                });

                return retryResponse;
            } else {
                // Refresh failed, redirect to login
                window.location.href = 'login.html';
                throw new Error('Session expired');
            }
        }

        return response;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

/**
 * Convenience method for GET requests
 */
async function apiGet(endpoint) {
    return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Convenience method for POST requests
 */
async function apiPost(endpoint, data) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Convenience method for PUT requests
 */
async function apiPut(endpoint, data) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Convenience method for DELETE requests
 */
async function apiDelete(endpoint) {
    return apiRequest(endpoint, { method: 'DELETE' });
}
