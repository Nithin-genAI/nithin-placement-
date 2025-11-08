// static/js/student_dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Student Dashboard loaded');
    
    // Drive filtering
    const driveFilter = document.getElementById('driveFilter');
    if (driveFilter) {
        driveFilter.addEventListener('change', function(e) {
            const filterValue = e.target.value;
            const driveCards = document.querySelectorAll('.drive-card');
            
            driveCards.forEach(card => {
                switch(filterValue) {
                    case 'all':
                        card.style.display = '';
                        break;
                    case 'eligible':
                        card.style.display = card.classList.contains('eligible') ? '' : 'none';
                        break;
                    case 'applied':
                        card.style.display = card.classList.contains('applied') ? '' : 'none';
                        break;
                }
            });
        });
    }
    
    // Apply for drive
    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const driveId = this.getAttribute('data-drive-id');
            const driveCard = this.closest('.drive-card');
            const companyName = driveCard.querySelector('.drive-company').textContent;
            const role = driveCard.querySelector('.drive-role').textContent;
            
            if (confirm(`Apply for ${role} at ${companyName}?`)) {
                // Show loading state
                this.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Applying...';
                this.disabled = true;
                
                fetch('/student/apply_drive', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        drive_id: driveId
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Update UI
                        driveCard.classList.add('applied');
                        this.outerHTML = '<span class="badge bg-info">Applied</span>';
                        showNotification('Application submitted successfully!', 'success');
                        
                        // Update application status section
                        updateApplicationStatus();
                    } else {
                        showNotification(data.message || 'Error applying for drive', 'error');
                        this.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Apply Now';
                        this.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Error applying for drive', 'error');
                    this.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Apply Now';
                    this.disabled = false;
                });
            }
        });
    });
    
    // View drive details
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const driveId = this.getAttribute('data-drive-id');
            showDriveDetails(driveId);
        });
    });
    
    function showDriveDetails(driveId) {
        fetch(`/student/drive_details/${driveId}`)
            .then(response => response.json())
            .then(data => {
                const modalContent = document.getElementById('driveDetailsContent');
                modalContent.innerHTML = `
                    <h6>${data.company_name} - ${data.role}</h6>
                    <p><strong>Eligibility Criteria:</strong></p>
                    <p>${data.eligibility}</p>
                    <p><strong>Job Description:</strong></p>
                    <p>${data.description || 'No additional details provided.'}</p>
                    <p><strong>Location:</strong> ${data.location || 'Not specified'}</p>
                    <p><strong>Package:</strong> ${data.package || 'Not specified'}</p>
                    <p><strong>Drive Date:</strong> ${data.drive_date || 'Not specified'}</p>
                `;
                
                const modal = new bootstrap.Modal(document.getElementById('driveDetailsModal'));
                modal.show();
            })
            .catch(error => {
                console.error('Error loading drive details:', error);
                showNotification('Error loading drive details', 'error');
            });
    }
    
    function updateApplicationStatus() {
        // Refresh application status section
        fetch('/student/application_status')
            .then(response => response.json())
            .then(data => {
                // Update the application status timeline
                const statusContainer = document.querySelector('.status-timeline');
                // Implementation to update status timeline
            })
            .catch(error => console.error('Error updating application status:', error));
    }
    
    function showNotification(message, type = 'info') {
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-info';
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }
});