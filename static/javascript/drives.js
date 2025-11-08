// Drives Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeDrivesPage();
    setupEventListeners();
    updateStatistics();
});

function initializeDrivesPage() {
    console.log('Drives page initialized');
    
    // Add animation delay to drive items
    const driveItems = document.querySelectorAll('.drive-item');
    driveItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('driveSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Role filter
    const roleFilter = document.getElementById('roleFilter');
    if (roleFilter) {
        roleFilter.addEventListener('change', handleFilter);
    }
    
    // Save buttons
    const saveButtons = document.querySelectorAll('.save-btn');
    saveButtons.forEach(btn => {
        btn.addEventListener('click', handleSaveDrive);
    });
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', handleLoadMore);
    }
    
    // Apply button success feedback
    const applyButtons = document.querySelectorAll('.apply-btn');
    applyButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Only show modal if it's not already applied
            if (!this.classList.contains('applied')) {
                e.preventDefault();
                showApplicationSuccess(this.href);
            }
        });
    });
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const driveItems = document.querySelectorAll('.drive-item');
    
    driveItems.forEach(item => {
        const company = item.getAttribute('data-company');
        const role = item.getAttribute('data-role');
        const eligibility = item.getAttribute('data-eligibility');
        
        const matches = company.includes(searchTerm) || 
                       role.includes(searchTerm) || 
                       eligibility.includes(searchTerm);
        
        if (matches || searchTerm === '') {
            item.style.display = 'block';
            
            // Highlight matching text
            highlightText(item, searchTerm);
        } else {
            item.style.display = 'none';
        }
    });
    
    updateVisibleCount();
}

function handleFilter(event) {
    const filterValue = event.target.value.toLowerCase();
    const driveItems = document.querySelectorAll('.drive-item');
    
    driveItems.forEach(item => {
        const role = item.getAttribute('data-role');
        
        if (filterValue === '' || role.includes(filterValue)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    updateVisibleCount();
}

function handleSaveDrive(event) {
    const button = event.currentTarget;
    const driveId = button.getAttribute('data-drive-id');
    
    button.classList.toggle('saved');
    button.innerHTML = button.classList.contains('saved') ? 
        '<i class="fas fa-bookmark"></i>' : 
        '<i class="far fa-bookmark"></i>';
    
    // Show feedback
    const message = button.classList.contains('saved') ? 
        'Drive saved to bookmarks' : 'Drive removed from bookmarks';
    
    showToast(message, button.classList.contains('saved') ? 'success' : 'info');
}

function handleLoadMore() {
    const button = document.getElementById('loadMoreBtn');
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Loading...';
    button.disabled = true;
    
    // Simulate loading more drives
    setTimeout(() => {
        showToast('No more drives to load', 'info');
        button.style.display = 'none';
    }, 1500);
}

function showApplicationSuccess(redirectUrl) {
    const modal = new bootstrap.Modal(document.getElementById('applicationModal'));
    modal.show();
    
    // Redirect after modal is closed
    document.getElementById('applicationModal').addEventListener('hidden.bs.modal', function() {
        window.location.href = redirectUrl;
    });
}

function highlightText(element, searchTerm) {
    if (!searchTerm) return;
    
    const textElements = element.querySelectorAll('.company-name, .role-text, .eligibility-text');
    
    textElements.forEach(el => {
        const originalText = el.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlightedText = originalText.replace(regex, '<span class="highlight">$1</span>');
        el.innerHTML = highlightedText;
    });
}

function updateStatistics() {
    const totalDrives = document.querySelectorAll('.drive-item').length;
    const visibleDrives = document.querySelectorAll('.drive-item[style="display: block"]').length;
    
    // Update active roles count
    const uniqueRoles = new Set();
    document.querySelectorAll('.drive-item[style="display: block"]').forEach(item => {
        const role = item.getAttribute('data-role');
        if (role) uniqueRoles.add(role);
    });
    
    document.getElementById('active-roles').textContent = uniqueRoles.size;
    
    // Simulate new drives this week
    const newThisWeek = Math.min(5, Math.floor(totalDrives * 0.3));
    document.getElementById('new-this-week').textContent = newThisWeek;
}

function updateVisibleCount() {
    const visibleCount = document.querySelectorAll('.drive-item[style="display: block"]').length;
    const totalCount = document.querySelectorAll('.drive-item').length;
    
    // Update statistics
    updateStatistics();
    
    // Show/hide empty state
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    // Add to container
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    container.appendChild(toast);
    document.body.appendChild(container);
    
    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove after hide
    toast.addEventListener('hidden.bs.toast', function() {
        container.remove();
    });
}

// Export functions for global access
window.drivesManager = {
    searchDrives: handleSearch,
    filterDrives: handleFilter,
    updateStats: updateStatistics
};