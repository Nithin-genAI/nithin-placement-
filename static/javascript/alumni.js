// static/js/alumni.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Alumni Portal loaded - Initializing functionality...');
    
    // Initialize all alumni functionality
    initAlumniPortal();
});

function initAlumniPortal() {
    // 1. Password visibility toggle
    initPasswordToggle();
    
    // 2. Excel data loading and display
    initAlumniDirectory();
    
    // 3. Form validation
    initFormValidation();
    
    // 4. Modal handlers
    initModalHandlers();
    
    // 5. Auto-hide alerts
    initAutoHideAlerts();
    
    // 6. Carousel controls
    initTestimonialCarousel();
    
    // 7. File upload validation
    initFileUploadValidation();
}

// 1. Password Toggle Functionality
function initPasswordToggle() {
    const toggleButtons = document.querySelectorAll('#togglePassword, .password-toggle-btn');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.closest('.input-group').querySelector('input[type="password"], input[type="text"]');
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.textContent = type === 'password' ? 'Show' : 'Hide';
            this.classList.toggle('active');
        });
    });
}

// 2. Alumni Directory - Excel Data Loading
function initAlumniDirectory() {
    displayExcelContent();
    
    // Refresh data every 30 seconds (optional)
    setInterval(displayExcelContent, 30000);
}

async function displayExcelContent() {
    const excelTable = document.getElementById('excel-table');
    if (!excelTable) return;
    
    try {
        excelTable.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Loading alumni directory...</p></div>';
        
        const response = await fetch("/static/alumni_avail_data.xlsx");
        if (!response.ok) {
            throw new Error('Alumni data file not found');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to HTML table
        const tableHTML = XLSX.utils.sheet_to_html(sheet);
        excelTable.innerHTML = tableHTML;
        
        // Enhance the table with styling and functionality
        enhanceAlumniTable();
        
    } catch (error) {
        console.error('Error loading alumni data:', error);
        showAlumniDirectoryError();
    }
}

function enhanceAlumniTable() {
    const table = document.querySelector('#excel-table table');
    if (!table) return;
    
    // Add Bootstrap classes and enhance functionality
    table.className = 'table table-striped table-bordered table-hover align-middle';
    
    // Add responsive wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    
    // Add table header styling
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.style.backgroundColor = '#2c3e50';
        header.style.color = 'white';
        header.style.position = 'sticky';
        header.style.top = '0';
        header.style.zIndex = '10';
    });
    
    // Add search functionality
    addTableSearch();
    
    // Add row selection and connection features
    addRowSelection();
    
    // Add export functionality
    addExportButtons();
}

function addTableSearch() {
    const excelTable = document.getElementById('excel-table');
    const table = excelTable.querySelector('table');
    
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'mb-3';
    searchContainer.innerHTML = `
        <div class="input-group">
            <span class="input-group-text">
                <i class="fas fa-search"></i>
            </span>
            <input type="text" class="form-control" id="alumniSearch" placeholder="Search alumni by name, company, position...">
            <button class="btn btn-outline-secondary" type="button" id="clearSearch">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    excelTable.parentNode.insertBefore(searchContainer, excelTable);
    
    // Search functionality
    const searchInput = document.getElementById('alumniSearch');
    const clearButton = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
    
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => row.style.display = '');
    });
}

function addRowSelection() {
    const table = document.querySelector('#excel-table table');
    if (!table) return;
    
    // Add selection column if not present
    const headers = table.querySelector('thead tr');
    if (!headers.querySelector('th:first-child').textContent.includes('Select')) {
        const selectHeader = document.createElement('th');
        selectHeader.innerHTML = '<input type="checkbox" id="selectAll">';
        selectHeader.style.width = '50px';
        headers.insertBefore(selectHeader, headers.firstChild);
        
        // Add checkboxes to each row
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const selectCell = document.createElement('td');
            selectCell.innerHTML = '<input type="checkbox" class="alumni-select">';
            row.insertBefore(selectCell, row.firstChild);
        });
        
        // Select all functionality
        document.getElementById('selectAll').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.alumni-select');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        // Individual checkbox functionality
        document.querySelectorAll('.alumni-select').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectAllCheckbox);
        });
    }
}

function updateSelectAllCheckbox() {
    const checkboxes = document.querySelectorAll('.alumni-select');
    const selectAll = document.getElementById('selectAll');
    const checkedCount = document.querySelectorAll('.alumni-select:checked').length;
    
    selectAll.checked = checkedCount === checkboxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
}

function addExportButtons() {
    const section2container = document.querySelector('.section2container .container');
    const existingExportBtn = document.getElementById('exportAlumniBtn');
    
    if (!existingExportBtn) {
        const exportContainer = document.createElement('div');
        exportContainer.className = 'text-center mt-3';
        exportContainer.innerHTML = `
            <button class="btn btn-outline-success me-2" id="exportAlumniBtn">
                <i class="fas fa-download me-2"></i>Export to Excel
            </button>
            <button class="btn btn-outline-info" id="printAlumniBtn">
                <i class="fas fa-print me-2"></i>Print Directory
            </button>
        `;
        
        section2container.querySelector('.text-center').parentNode.insertBefore(exportContainer, section2container.querySelector('.text-center').nextSibling);
        
        // Export functionality
        document.getElementById('exportAlumniBtn').addEventListener('click', exportAlumniData);
        document.getElementById('printAlumniBtn').addEventListener('click', printAlumniDirectory);
    }
}

function exportAlumniData() {
    try {
        const table = document.querySelector('#excel-table table');
        const workbook = XLSX.utils.table_to_book(table);
        XLSX.writeFile(workbook, 'nithin_college_alumni_directory.xlsx');
        showToast('Alumni directory exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Error exporting alumni data', 'error');
    }
}

function printAlumniDirectory() {
    const table = document.querySelector('#excel-table table');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Nithin College Alumni Directory</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f8f9fa; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <h2>Nithin College Alumni Directory</h2>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
                ${table.outerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function showAlumniDirectoryError() {
    const excelTable = document.getElementById('excel-table');
    excelTable.innerHTML = `
        <div class="alert alert-warning text-center">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <h5>Alumni Directory Coming Soon</h5>
            <p class="mb-3">Our alumni directory will be available once alumni register and mark themselves as available for connections.</p>
            <button class="btn btn-primary" onclick="displayExcelContent()">
                <i class="fas fa-refresh me-2"></i>Try Again
            </button>
        </div>
    `;
}

// 3. Form Validation
function initFormValidation() {
    // Registration form validation
    const registerForm = document.querySelector('#registerModal form');
    if (registerForm) {
        registerForm.addEventListener('submit', validateRegistrationForm);
    }
    
    // Connection form validation
    const connectForm = document.querySelector('#connectModal form');
    if (connectForm) {
        connectForm.addEventListener('submit', validateConnectionForm);
    }
    
    // Real-time validation
    initRealTimeValidation();
}

function validateRegistrationForm(e) {
    const form = e.target;
    const password = form.querySelector('#password');
    const graduationYear = form.querySelector('#graduationYear');
    
    let isValid = true;
    
    // Password validation
    if (password.value.length < 8) {
        showFieldError(password, 'Password must be at least 8 characters long');
        isValid = false;
    }
    
    // Graduation year validation
    const currentYear = new Date().getFullYear();
    const gradYear = parseInt(graduationYear.value);
    if (gradYear < 2000 || gradYear > currentYear) {
        showFieldError(graduationYear, `Please enter a valid graduation year (2000-${currentYear})`);
        isValid = false;
    }
    
    if (!isValid) {
        e.preventDefault();
        showToast('Please fix the errors before submitting', 'error');
    }
}

function validateConnectionForm(e) {
    const form = e.target;
    const email = form.querySelector('#studentEmail');
    const message = form.querySelector('#message');
    const resume = form.querySelector('#resume');
    
    let isValid = true;
    
    // Email validation
    if (!isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Message length validation
    if (message.value.length < 10) {
        showFieldError(message, 'Please write a more detailed message (minimum 10 characters)');
        isValid = false;
    }
    
    // File validation
    if (resume.files.length > 0) {
        const file = resume.files[0];
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
            showFieldError(resume, 'Please upload a PDF, DOC, or DOCX file');
            isValid = false;
        }
        
        if (file.size > maxSize) {
            showFieldError(resume, 'File size must be less than 5MB');
            isValid = false;
        }
    }
    
    if (!isValid) {
        e.preventDefault();
        showToast('Please fix the errors before sending', 'error');
    }
}

function initRealTimeValidation() {
    // Email validation
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                showFieldError(this, 'Please enter a valid email address');
            } else {
                clearFieldError(this);
            }
        });
    });
    
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
}

function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('password-strength');
    if (!strengthBar) {
        const passwordGroup = document.getElementById('password').closest('.mb-3');
        const bar = document.createElement('div');
        bar.id = 'password-strength';
        bar.className = 'password-strength mt-2';
        bar.innerHTML = `
            <div class="progress" style="height: 5px;">
                <div class="progress-bar" role="progressbar" style="width: 0%"></div>
            </div>
            <small class="strength-text"></small>
        `;
        passwordGroup.appendChild(bar);
    }
    
    const progressBar = document.querySelector('#password-strength .progress-bar');
    const strengthText = document.querySelector('#password-strength .strength-text');
    
    let strength = 0;
    let color = 'bg-danger';
    let text = 'Very Weak';
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        color = 'bg-success';
        text = 'Strong';
    } else if (strength >= 50) {
        color = 'bg-warning';
        text = 'Medium';
    } else if (strength >= 25) {
        color = 'bg-info';
        text = 'Weak';
    }
    
    progressBar.style.width = strength + '%';
    progressBar.className = `progress-bar ${color}`;
    strengthText.textContent = `Password Strength: ${text}`;
    strengthText.className = `strength-text text-${color.replace('bg-', '')}`;
}

// 4. Modal Handlers
function initModalHandlers() {
    // Clear form when modal is hidden
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('hidden.bs.modal', function() {
            const forms = this.querySelectorAll('form');
            forms.forEach(form => {
                form.reset();
                clearAllFieldErrors(form);
            });
        });
    });
    
    // Show connection modal with selected alumni
    document.querySelector('.btn-primary[data-bs-target="#connectModal"]').addEventListener('click', function() {
        const selectedAlumni = getSelectedAlumni();
        if (selectedAlumni.length > 0) {
            updateConnectionForm(selectedAlumni);
        }
    });
}

function getSelectedAlumni() {
    const selected = [];
    document.querySelectorAll('.alumni-select:checked').forEach(checkbox => {
        const row = checkbox.closest('tr');
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) {
            selected.push({
                name: cells[1]?.textContent || 'Alumni',
                email: cells[2]?.textContent || '',
                position: cells[3]?.textContent || ''
            });
        }
    });
    return selected;
}

function updateConnectionForm(alumniList) {
    const messageTextarea = document.getElementById('message');
    if (messageTextarea && alumniList.length > 0) {
        let baseMessage = messageTextarea.value;
        if (!baseMessage.includes('I would like to connect with')) {
            const alumniNames = alumniList.map(a => a.name).join(', ');
            messageTextarea.value = `Dear ${alumniNames},\n\nI would like to connect with you regarding...\n\n` + baseMessage;
        }
    }
}

// 5. Alert Management
function initAutoHideAlerts() {
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
}

// 6. Testimonial Carousel Enhancement
function initTestimonialCarousel() {
    const carousel = document.getElementById('testimonialCarousel');
    if (carousel) {
        // Auto-advance every 8 seconds
        setInterval(() => {
            const bsCarousel = bootstrap.Carousel.getInstance(carousel);
            if (bsCarousel) {
                bsCarousel.next();
            }
        }, 8000);
        
        // Pause on hover
        carousel.addEventListener('mouseenter', function() {
            const bsCarousel = bootstrap.Carousel.getInstance(carousel);
            if (bsCarousel) {
                bsCarousel.pause();
            }
        });
        
        carousel.addEventListener('mouseleave', function() {
            const bsCarousel = bootstrap.Carousel.getInstance(carousel);
            if (bsCarousel) {
                bsCarousel.cycle();
            }
        });
    }
}

// 7. File Upload Validation
function initFileUploadValidation() {
    const resumeInput = document.getElementById('resume');
    if (resumeInput) {
        resumeInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                validateResumeFile(file);
            }
        });
    }
}

function validateResumeFile(file) {
    const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        showFieldError(document.getElementById('resume'), 'Please select a PDF, DOC, or DOCX file');
        document.getElementById('resume').value = '';
        return false;
    }
    
    if (file.size > maxSize) {
        showFieldError(document.getElementById('resume'), 'File size must be less than 5MB');
        document.getElementById('resume').value = '';
        return false;
    }
    
    clearFieldError(document.getElementById('resume'));
    showToast('File validated successfully!', 'success');
    return true;
}

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    const formGroup = field.closest('.mb-3') || field.closest('.form-group');
    if (!formGroup) return;
    
    formGroup.classList.add('error');
    
    let errorElement = formGroup.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error text-danger small mt-1';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    field.classList.add('is-invalid');
}

function clearFieldError(field) {
    const formGroup = field.closest('.mb-3') || field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        field.classList.remove('is-invalid');
        
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

function clearAllFieldErrors(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach(field => clearFieldError(field));
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toastId = 'toast-' + Date.now();
    const bgColor = type === 'success' ? 'bg-success' : 
                   type === 'error' ? 'bg-danger' : 
                   type === 'warning' ? 'bg-warning' : 'bg-info';
    
    const toastHTML = `
        <div id="${toastId}" class="toast ${bgColor} text-white" role="alert">
            <div class="toast-body">
                <i class="fas fa-${getToastIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Navigation function
function showHome() {
    window.location.href = "/";
}

// Add CSS for additional styles
const alumniStyles = `
    .password-strength .progress {
        height: 5px;
    }
    
    .field-error {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .is-invalid {
        border-color: #dc3545 !important;
    }
    
    .mb-3.error .form-control {
        border-color: #dc3545;
    }
    
    .table-hover tbody tr:hover {
        background-color: rgba(52, 152, 219, 0.1);
        cursor: pointer;
    }
    
    .alumni-select:checked {
        background-color: #3498db;
        border-color: #3498db;
    }
    
    #excel-table {
        max-height: 500px;
        overflow-y: auto;
    }
    
    .testimonial-slide {
        transition: transform 0.3s ease;
    }
    
    .testimonial-slide:hover {
        transform: translateY(-5px);
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = alumniStyles;
document.head.appendChild(styleSheet);