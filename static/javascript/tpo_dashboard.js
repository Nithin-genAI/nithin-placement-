// static/js/tpo_dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('TPO Dashboard loaded');
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Real-time updates for stats
    function updateStats() {
        fetch('/api/tpo/stats')
            .then(response => response.json())
            .then(data => {
                // Update stats cards
                document.querySelector('.total-students h3').textContent = data.total_students;
                document.querySelector('.pending-approvals h3').textContent = data.pending_approvals;
                // Add more stat updates as needed
            })
            .catch(error => console.error('Error updating stats:', error));
    }
    
    // Update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Quick action handlers
    document.querySelectorAll('.action-buttons .btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const action = this.textContent.trim();
            console.log(`TPO action: ${action}`);
            // Add specific action handlers here
        });
    });
});