// My Applications JavaScript - UPDATED VERSION

document.addEventListener('DOMContentLoaded', function() {
    initializeApplicationsPage();
    setupEventListeners();
    updateStatistics();
    initializeProgressBar();
    initializeStatusProgressBars(); // NEW: Initialize individual status progress bars
});

// NEW: Function to initialize individual status progress bars
function initializeStatusProgressBars() {
    const progressBars = document.querySelectorAll('.status-progress-bar');
    
    progressBars.forEach(bar => {
        const status = bar.getAttribute('data-status');
        const progress = getStatusProgressPercentage(status);
        
        // Set width and color class
        bar.style.width = `${progress}%`;
        bar.className = `progress-bar status-progress-bar ${getStatusProgressClass(status)}`;
    });
}

// NEW: Helper function to get progress percentage based on status
function getStatusProgressPercentage(status) {
    const progressMap = {
        'applied': 25,
        'under review': 50,
        'shortlisted': 75,
        'interview': 90,
        'selected': 100,
        'rejected': 100
    };
    
    return progressMap[status] || 25;
}

// NEW: Helper function to get progress bar color class based on status
function getStatusProgressClass(status) {
    const classMap = {
        'applied': 'bg-primary',
        'under review': 'bg-warning',
        'shortlisted': 'bg-info',
        'interview': 'bg-purple',
        'selected': 'bg-success',
        'rejected': 'bg-danger'
    };
    
    return classMap[status] || 'bg-primary';
}

// NEW: Helper function to get status icon class (for the badge)
function getStatusIconClass(status) {
    const iconMap = {
        'applied': 'fas fa-paper-plane',
        'under review': 'fas fa-search',
        'shortlisted': 'fas fa-star',
        'interview': 'fas fa-video',
        'selected': 'fas fa-trophy',
        'rejected': 'fas fa-times-circle'
    };
    
    return iconMap[status] || 'fas fa-paper-plane';
}

// Rest of the existing functions remain the same...
function initializeApplicationsPage() {
    console.log('My Applications page initialized');
    
    // Add animation delay to application items
    const applicationItems = document.querySelectorAll('.application-item');
    applicationItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('applicationSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }
    
    // Sort functionality
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', handleSort);
    }
    
    // View details buttons
    const viewButtons = document.querySelectorAll('.view-details-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewDetails);
    });
    
    // Withdraw buttons
    const withdrawButtons = document.querySelectorAll('.withdraw-btn');
    withdrawButtons.forEach(btn => {
        btn.addEventListener('click', handleWithdraw);
    });
    
    // Prepare buttons
    const prepareButtons = document.querySelectorAll('.prepare-btn');
    prepareButtons.forEach(btn => {
        btn.addEventListener('click', handlePrepare);
    });
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const applicationItems = document.querySelectorAll('.application-item');
    
    applicationItems.forEach(item => {
        const company = item.getAttribute('data-company');
        const role = item.getAttribute('data-role');
        
        const matches = company.includes(searchTerm) || role.includes(searchTerm);
        
        if (matches || searchTerm === '') {
            item.style.display = 'block';
            highlightText(item, searchTerm);
        } else {
            item.style.display = 'none';
        }
    });
    
    updateStatistics();
}

function handleFilter(event) {
    const filterValue = event.target.value.toLowerCase();
    const applicationItems = document.querySelectorAll('.application-item');
    
    applicationItems.forEach(item => {
        const status = item.getAttribute('data-status');
        
        if (filterValue === '' || status.includes(filterValue)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    updateStatistics();
}

function handleSort(event) {
    const sortValue = event.target.value;
    const container = document.getElementById('applicationsList');
    const items = Array.from(container.getElementsByClassName('application-item'));
    
    items.sort((a, b) => {
        switch (sortValue) {
            case 'oldest':
                return new Date(a.getAttribute('data-date')) - new Date(b.getAttribute('data-date'));
            case 'company':
                return a.getAttribute('data-company').localeCompare(b.getAttribute('data-company'));
            case 'status':
                return a.getAttribute('data-status').localeCompare(b.getAttribute('data-status'));
            default: // newest
                return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));
        }
    });
    
    // Re-append sorted items
    items.forEach(item => container.appendChild(item));
}

function handleViewDetails(event) {
    const card = event.currentTarget.closest('.application-card');
    const company = card.querySelector('.company-name').textContent;
    const role = card.querySelector('.role-name').textContent;
    const status = card.querySelector('.status-text').textContent;
    const date = card.querySelector('.application-date').textContent;
    
    const details = `
        <div class="application-detail-view">
            <div class="row">
                <div class="col-md-6">
                    <h6>Application Information</h6>
                    <p><strong>Company:</strong> ${company}</p>
                    <p><strong>Role:</strong> ${role}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${status.toLowerCase().replace(' ', '-')}">${status}</span></p>
                    <p><strong>Applied Date:</strong> ${date}</p>
                </div>
                <div class="col-md-6">
                    <h6>Next Steps</h6>
                    <p>${getNextSteps(status)}</p>
                    <div class="mt-3">
                        <button class="btn btn-primary btn-sm">
                            <i class="fas fa-download me-1"></i> Download Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('applicationDetails').innerHTML = details;
    
    const modal = new bootstrap.Modal(document.getElementById('applicationModal'));
    modal.show();
}

function handleWithdraw(event) {
    const button = event.currentTarget;
    const applicationId = button.getAttribute('data-application-id');
    const company = button.getAttribute('data-company');
    
    if (confirm(`Are you sure you want to withdraw your application from ${company}?`)) {
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Withdrawing...';
        button.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            const card = button.closest('.application-card');
            card.style.opacity = '0.6';
            card.style.pointerEvents = 'none';
            
            showToast(`Application withdrawn from ${company}`, 'info');
        }, 1000);
    }
}

function handlePrepare(event) {
    const button = event.currentTarget;
    const card = button.closest('.application-card');
    const company = card.querySelector('.company-name').textContent;
    const role = card.querySelector('.role-name').textContent;
    
    showToast(`Opening preparation materials for ${company} - ${role}`, 'success');
    
    // In real implementation, redirect to preparation page
    setTimeout(() => {
        window.open('/preparation-materials', '_blank');
    }, 500);
}

function updateStatistics() {
    const totalApplications = document.querySelectorAll('.application-item').length;
    const visibleApplications = document.querySelectorAll('.application-item[style="display: block"]').length;
    
    // Count by status
    const statusCounts = {
        'applied': 0,
        'under review': 0,
        'shortlisted': 0,
        'interview': 0,
        'selected': 0,
        'rejected': 0
    };
    
    document.querySelectorAll('.application-item[style="display: block"]').forEach(item => {
        const status = item.getAttribute('data-status');
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });
    
    // Update counts
    document.getElementById('pending-count').textContent = 
        statusCounts['applied'] + statusCounts['under review'];
    document.getElementById('selected-count').textContent = statusCounts['shortlisted'];
    document.getElementById('interview-count').textContent = statusCounts['interview'];
}

function initializeProgressBar() {
    const totalApplications = document.querySelectorAll('.application-item').length;
    const shortlisted = document.querySelectorAll('.application-item[data-status="shortlisted"]').length;
    const interview = document.querySelectorAll('.application-item[data-status="interview"]').length;
    const selected = document.querySelectorAll('.application-item[data-status="selected"]').length;
    
    const progress = ((shortlisted + interview + selected) / totalApplications) * 100 || 0;
    
    const progressBar = document.getElementById('applicationProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}% Success Rate`;
    }
}

function highlightText(element, searchTerm) {
    if (!searchTerm) return;
    
    const textElements = element.querySelectorAll('.company-name, .role-name');
    
    textElements.forEach(el => {
        const originalText = el.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const highlightedText = originalText.replace(regex, '<span class="highlight">$1</span>');
        el.innerHTML = highlightedText;
    });
}

function getNextSteps(status) {
    const steps = {
        'applied': 'Your application has been submitted. The company will review it and get back to you soon.',
        'under review': 'Your application is currently being reviewed. Expect to hear back within 1-2 weeks.',
        'shortlisted': 'Congratulations! You have been shortlisted. Prepare for the next round of interviews.',
        'interview': 'You have been invited for an interview. Check your email for details and prepare well.',
        'selected': 'Congratulations! You have been selected. Wait for the offer letter and further instructions.',
        'rejected': 'Thank you for applying. Keep trying with other companies and improve your skills.'
    };
    
    return steps[status.toLowerCase()] || 'Check your application status regularly for updates.';
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

// Add this CSS class for purple progress bars
const style = document.createElement('style');
style.textContent = `
    .bg-purple { background-color: #6f42c1 !important; }
    .highlight { background: yellow; padding: 0.1rem 0.2rem; border-radius: 3px; }
`;
document.head.appendChild(style);