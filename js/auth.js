// Authentication Utility Module
// Handles JWT token management and authentication state

const API_URL = 'https://newsletter-api-tlzp.onrender.com/api';

// Token Management
function setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
}

function getAccessToken() {
    return localStorage.getItem('access_token');
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Authentication State
function isAuthenticated() {
    return !!getAccessToken();
}

// Login Function
async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/admin/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            setTokens(data.access, data.refresh);
            setUser(data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// Logout Function
async function logout() {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();

    // Try to blacklist the token on the server
    if (refreshToken && accessToken) {
        try {
            await fetch(`${API_URL}/admin/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ refresh: refreshToken })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    clearTokens();
    window.location.href = 'login.html';
}

// Refresh Access Token
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/admin/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken })
        });

        const data = await response.json();

        if (response.ok) {
            setTokens(data.access, data.refresh || refreshToken);
            return true;
        } else {
            clearTokens();
            return false;
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        clearTokens();
        return false;
    }
}

// Navigation Guard - Check authentication and redirect if needed
function checkAuthAndRedirect() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Display user info in header
function displayUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userProfileElements = document.querySelectorAll('.user-profile span');
        userProfileElements.forEach(el => {
            el.textContent = user.username || 'Admin';
        });
    }
}

// Initialize logout buttons
function initLogoutButtons() {
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
}
