// static/js/hod_dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('HOD Dashboard loaded');
    
    // Student search functionality
    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
        studentSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#studentsTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Student approval functionality
    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const studentId = this.getAttribute('data-student-id');
            const studentRow = this.closest('tr');
            const studentName = studentRow.querySelector('td:first-child').textContent;
            
            if (confirm(`Approve student: ${studentName}?`)) {
                fetch(`/hod/approve_student/${studentId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        studentRow.querySelector('.badge').className = 'badge bg-success';
                        studentRow.querySelector('.badge').textContent = 'Approved';
                        this.remove();
                        showNotification('Student approved successfully!', 'success');
                    } else {
                        showNotification('Error approving student', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Error approving student', 'error');
                });
            }
        });
    });
    
    // View student details
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const studentId = this.getAttribute('data-student-id');
            // Implement student details view
            console.log(`View student details: ${studentId}`);
        });
    });
    
    function showNotification(message, type = 'info') {
        // Create and show notification
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-info';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }
});