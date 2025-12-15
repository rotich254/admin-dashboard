// Check authentication
checkAuthAndRedirect();

let currentPage = 1;
let totalPages = 1;
let searchTerm = '';

document.addEventListener('DOMContentLoaded', function () {
    displayUserInfo();
    initLogoutButtons();
    loadSubscribers();

    // Search input with debounce
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', function (e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchTerm = e.target.value;
            currentPage = 1;
            loadSubscribers();
        }, 500);
    });
});

async function loadSubscribers() {
    try {
        const url = `/subscribers/?page=${currentPage}&search=${searchTerm}`;
        const response = await apiGet(url);
        const data = await response.json();

        displaySubscribers(data.subscribers);
        updatePagination(data.page, data.pages, data.total);
    } catch (error) {
        console.error('Error loading subscribers:', error);
        document.getElementById('subscribers-table').innerHTML =
            '<tr><td colspan="3" class="text-center text-danger">Error loading subscribers</td></tr>';
    }
}

function displaySubscribers(subscribers) {
    const tbody = document.getElementById('subscribers-table');

    if (!subscribers || subscribers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No subscribers found</td></tr>';
        return;
    }

    tbody.innerHTML = subscribers.map(sub => `
        <tr>
            <td>${sub.email}</td>
            <td>${formatDate(sub.subscribed_at)}</td>
            <td>
                ${sub.is_active ?
            '<span class="badge bg-success">Active</span>' :
            '<span class="badge bg-secondary">Inactive</span>'}
            </td>
        </tr>
    `).join('');
}

function updatePagination(page, pages, total) {
    currentPage = page;
    totalPages = pages;

    document.getElementById('current-page').textContent = page;
    document.getElementById('total-pages').textContent = pages;
    document.getElementById('total-count').textContent = total;

    document.getElementById('prev-btn').disabled = page === 1;
    document.getElementById('next-btn').disabled = page === pages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadSubscribers();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadSubscribers();
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
