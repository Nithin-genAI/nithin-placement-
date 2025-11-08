// Approve Students JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    updateStatistics();
});

function initializePage() {
    console.log('Student Approval Portal initialized');
    
    // Add loading states to buttons
    const approveButtons = document.querySelectorAll('.approve-btn');
    approveButtons.forEach(btn => {
        btn.addEventListener('click', handleApproveClick);
    });
    
    // View buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewClick);
    });
    
    // Bulk actions
    document.getElementById('approveAllBtn')?.addEventListener('click', handleApproveAll);
    document.getElementById('refreshBtn')?.addEventListener('click', handleRefresh);
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search students...';
    searchInput.className = 'form-control mb-3';
    searchInput.addEventListener('input', handleSearch);
    
    const tableHeader = document.querySelector('.card-header');
    if (tableHeader) {
        tableHeader.parentNode.insertBefore(searchInput, tableHeader.nextSibling);
    }
}

function handleApproveClick(event) {
    const button = event.currentTarget;
    const studentId = button.getAttribute('data-student-id');
    const studentName = button.getAttribute('data-student-name');
    
    if (!studentId) return;
    
    // Show confirmation
    if (confirm(`Are you sure you want to approve ${studentName}?`)) {
        approveStudent(studentId, button);
    }
}

function approveStudent(studentId, button) {
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Approving...';
    button.disabled = true;
    button.classList.add('loading');
    
    // Simulate API call - replace with actual fetch
    setTimeout(() => {
        window.location.href = `/approve/${studentId}`;
    }, 1000);
}

function handleViewClick(event) {
    const button = event.currentTarget;
    const studentId = button.getAttribute('data-student-id');
    
    // Load student details (simulated)
    loadStudentDetails(studentId);
}

function loadStudentDetails(studentId) {
    // In a real implementation, you would fetch student details from the server
    const studentDetails = `
        <div class="row">
            <div class="col-md-6">
                <h6>Personal Information</h6>
                <p><strong>Name:</strong> John Doe</p>
                <p><strong>Email:</strong> john.doe@example.com</p>
                <p><strong>Mobile:</strong> +1234567890</p>
            </div>
            <div class="col-md-6">
                <h6>Academic Information</h6>
                <p><strong>Department:</strong> Computer Science</p>
                <p><strong>Year:</strong> Third Year</p>
                <p><strong>CGPA:</strong> 8.5/10</p>
                <p><strong>Admission Year:</strong> 2022</p>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <h6>Registration Date</h6>
                <p>${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    document.getElementById('studentDetails').innerHTML = studentDetails;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('studentModal'));
    modal.show();
}

function handleApproveAll() {
    const pendingCount = document.querySelectorAll('.student-row').length;
    
    if (pendingCount === 0) {
        alert('No pending approvals to process.');
        return;
    }
    
    if (confirm(`Are you sure you want to approve all ${pendingCount} pending students?`)) {
        // Show loading state for all buttons
        const approveButtons = document.querySelectorAll('.approve-btn');
        approveButtons.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Approving...';
            btn.disabled = true;
        });
        
        // In real implementation, you would make a bulk approve API call
        alert(`Approved ${pendingCount} students successfully!`);
        window.location.reload();
    }
}

function handleRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('.student-row');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function updateStatistics() {
    const pendingCount = document.querySelectorAll('.student-row').length;
    const departments = new Set();
    
    // Count departments
    document.querySelectorAll('.department-badge').forEach(badge => {
        if (badge.textContent && badge.textContent !== 'Not specified') {
            departments.add(badge.textContent.trim());
        }
    });
    
    // Update counts (these would come from the server in real implementation)
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('dept-count').textContent = departments.size;
    
    // Simulate some approved and total counts
    const approvedCount = Math.floor(Math.random() * 50) + 10;
    const totalCount = pendingCount + approvedCount;
    const approvalPercentage = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
    
    document.getElementById('approved-count').textContent = approvedCount;
    document.getElementById('total-count').textContent = totalCount;
    
    // Update progress bar
    const progressBar = document.getElementById('approvalProgress');
    if (progressBar) {
        progressBar.style.width = `${approvalPercentage}%`;
        progressBar.textContent = `${approvalPercentage}% Approved`;
    }
}

// Export functions for global access (if needed)
window.approveStudents = {
    approveStudent,
    loadStudentDetails,
    updateStatistics
};