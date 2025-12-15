// Theme Switcher
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme from localStorage or system preference
function initTheme() {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else {
        // Default to dark theme
        html.setAttribute('data-theme', 'dark');
    }
}

// Call on page load
initTheme();
