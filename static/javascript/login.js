// Faculty role selection
document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    const toggleStudentPassword = document.getElementById('toggleStudentPassword');
    const toggleFacultyPassword = document.getElementById('toggleFacultyPassword');
    const studentPassword = document.getElementById('student-password');
    const facultyPassword = document.getElementById('faculty-password');
    
    if (toggleStudentPassword && studentPassword) {
        toggleStudentPassword.addEventListener('click', function() {
            const type = studentPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            studentPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    if (toggleFacultyPassword && facultyPassword) {
        toggleFacultyPassword.addEventListener('click', function() {
            const type = facultyPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            facultyPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Faculty role selection
    const roleCards = document.querySelectorAll('.role-card');
    const facultyRoleInput = document.getElementById('faculty-role');
    
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            roleCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Update the hidden input value
            const selectedRole = this.getAttribute('data-role');
            facultyRoleInput.value = selectedRole;
            
            console.log('Selected role:', selectedRole);
        });
    });
    
    // Make first role card active by default
    if (roleCards.length > 0 && facultyRoleInput) {
        roleCards[0].classList.add('active');
        facultyRoleInput.value = roleCards[0].getAttribute('data-role');
    }
});