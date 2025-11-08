from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify, send_file
import sqlite3
import os
import pandas as pd
from werkzeug.utils import secure_filename
from functions import *

app = Flask(__name__)
app.secret_key = 'nithin_college_placement_secret_key_2024'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('Documents', exist_ok=True)
os.makedirs('static', exist_ok=True)

# Initialize database
init_db()

# ==================== ROUTES ====================
@app.errorhandler(404)
def not_found(e):
    """Ignore 404 errors for static files"""
    if request.path.startswith('/static') or 'images' in request.path:
        return "", 404
    return redirect('/')

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page for all users"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role', 'student')
        
        # Simple hardcoded login for testing
        if email and password:
            session['user_id'] = 1
            session['email'] = email
            session['role'] = role
            session['name'] = f'Test {role.upper()}'
            session['department'] = 'COMPUTER SCIENCE ENGINEERING'
            
            if role == 'student':
                return redirect('/student_dashboard')
            elif role == 'hod':
                return redirect('/hod_dashboard')
            elif role == 'tpo':
                return redirect('/tpo_dashboard')
            elif role == 'faculty':
                return redirect('/faculty_dashboard')
        else:
            flash('Please enter email and password', 'error')
    
    return render_template('login.html', form_data={})

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registration page"""
    if request.method == 'POST':
        role = request.form.get('role', 'student')
        
        if role == 'student':
            result = save_student_data(
                stu_email=request.form.get('stu_email'),
                stu_password=request.form.get('stu_password'),
                stu_r_password=request.form.get('stu_r_password'),
                stu_name=request.form.get('stu_name'),
                stu_l_name=request.form.get('stu_l_name'),
                stu_mobile=request.form.get('stu_mobile'),
                stu_dept=request.form.get('stu_dept'),
                stu_year=request.form.get('stu_year'),
                stu_gender=request.form.get('stu_gender', ''),
                current_cgpa=request.form.get('current_cgpa'),
                year_admission=request.form.get('year_admission', '2024')
            )
        elif role == 'faculty':
            result = save_faculty_data(
                fac_email=request.form.get('fac_email'),
                fac_password=request.form.get('fac_password'),
                fac_r_password=request.form.get('fac_r_password'),
                fac_name=request.form.get('fac_name'),
                fac_l_name=request.form.get('fac_l_name'),
                fac_mobile=request.form.get('fac_mobile'),
                fac_dept=request.form.get('fac_dept')
            )
        elif role == 'hod':
            result = save_hod_data(
                hod_email=request.form.get('hod_email'),
                hod_password=request.form.get('hod_password'),
                hod_r_password=request.form.get('hod_r_password'),
                hod_name=request.form.get('hod_name'),
                hod_mobile=request.form.get('hod_mobile'),
                hod_department=request.form.get('hod_department')
            )
        elif role == 'tpo':
            result = save_tpo_data(
                tpo_email=request.form.get('tpo_email'),
                tpo_password=request.form.get('tpo_password'),
                tpo_r_password=request.form.get('tpo_r_password'),
                tpo_name=request.form.get('tpo_name'),
                tpo_mobile=request.form.get('tpo_mobile')
            )
        else:
            result = "Invalid role selected"
        
        if result == "Success":
            flash('Registration successful! Please login.', 'success')
            return redirect('/login')
        else:
            flash(result, 'error')
            return render_template('register.html', form_data=request.form)
    
    return render_template('register.html', form_data={})

# ==================== DASHBOARD ROUTES ====================

@app.route('/student_dashboard')
def student_dashboard():
    """Student dashboard"""
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect('/login')
    
    # Get applications and drives
    applications = get_student_applications(session['user_id'])
    drives = get_all_drives()
    
    # Prepare data for template
    student_stats = {
        'applied_drives': len(applications),
        'shortlisted': len([app for app in applications if app[3] == 'shortlisted']),
        'interviews': len([app for app in applications if app[3] == 'interview']),
        'offers': len([app for app in applications if app[3] == 'selected'])
    }
    
    available_drives = []
    for drive in drives:
        available_drives.append({
            'id': drive[0],
            'company_name': drive[1],
            'role': drive[2],
            'eligibility': drive[3],
            'applied': any(app[2] == drive[0] for app in applications),
            'eligible': check_eligibility(session.get('cgpa', '0'), drive[3])
        })
    
    application_status = []
    for app in applications:
        application_status.append({
            'id': app[0],
            'company_name': app[6] if len(app) > 6 else 'Unknown',
            'role': app[7] if len(app) > 7 else 'Unknown',
            'status': app[3],
            'applied_date': app[5] if len(app) > 5 else 'Unknown'
        })
    
    return render_template('inner_student.html',
                         student_stats=student_stats,
                         available_drives=available_drives,
                         application_status=application_status)

@app.route('/faculty_dashboard')
def faculty_dashboard():
    """Faculty dashboard"""
    if 'user_id' not in session or session.get('role') != 'faculty':
        return redirect('/login')
    
    dept_students = get_department_students(session['department'])
    dept_stats = get_department_stats(session['department'])
    
    students = []
    for student in dept_students:
        students.append({
            'id': student[0],
            'name': student[4],
            'email': student[1],
            'year': student[8],
            'cgpa': student[9],
            'is_approved': student[6]
        })
    
    return render_template('inner_faculty.html',
                         dept_students=students,
                         dept_stats=dept_stats,
                         pending_students=len([s for s in dept_students if not s[6]]))

@app.route('/hod_dashboard')
def hod_dashboard():
    """HOD dashboard"""
    if 'user_id' not in session or session.get('role') != 'hod':
        return redirect('/login')
    
    dept_stats = get_department_stats(session['department'])
    department_students = get_department_students(session['department'])
    
    students = []
    for student in department_students:
        students.append({
            'id': student[0],
            'name': student[4],
            'email': student[1],
            'year': student[8],
            'cgpa': student[9],
            'is_approved': student[6]
        })
    
    return render_template('hod_dashboard.html',
                         dept_stats=dept_stats,
                         department_students=students,
                         pending_students=len([s for s in department_students if not s[6]]))

@app.route('/tpo_dashboard')
def tpo_dashboard():
    """TPO dashboard"""
    if 'user_id' not in session or session.get('role') != 'tpo':
        return redirect('/login')
    
    # Get all statistics
    student_stats = get_student_stats()
    drives = get_all_drives()
    faculty = get_all_faculty()
    dept_stats = get_all_department_stats()
    
    # Format recent drives
    recent_drives = []
    for drive in drives[:5]:
        recent_drives.append({
            'company_name': drive[1],
            'role': drive[2],
            'eligibility': drive[3]
        })
    
    return render_template('tpo_dashboard.html',
                         total_students=student_stats['total_students'],
                         total_drives=len(drives),
                         pending_approvals=student_stats['pending_approvals'],
                         total_faculty=len(faculty),
                         recent_drives=recent_drives,
                         dept_stats=dept_stats)

# ==================== APPLICATION ROUTES ====================

@app.route('/apply_drive', methods=['POST'])
def apply_drive():
    """Student applies for placement drive"""
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect('/login')
    
    drive_id = request.form.get('drive_id')
    flash(f'Successfully applied to drive {drive_id}!', 'success')
    return redirect('/student_dashboard')

@app.route('/approve_student', methods=['POST'])
def approve_student():
    """Approve a student"""
    if 'user_id' not in session or session.get('role') not in ['hod', 'tpo']:
        return redirect('/login')
    
    student_id = request.form.get('student_id')
    flash(f'Student {student_id} approved successfully!', 'success')
    return redirect('/hod_dashboard')

@app.route('/create_drive', methods=['POST'])
def create_drive():
    """Create new placement drive"""
    if 'user_id' not in session or session.get('role') != 'tpo':
        return redirect('/login')
    
    company = request.form.get('company_name')
    flash(f'Drive for {company} created successfully!', 'success')
    return redirect('/tpo_dashboard')

# ==================== APPROVAL ROUTES ====================

@app.route('/approve_students')
def approve_students():
    """Approve pending students"""
    if 'user_id' not in session or session.get('role') not in ['hod', 'tpo']:
        return redirect('/login')
    
    if session['role'] == 'hod':
        pending_students = get_pending_students_by_department(session['department'])
    else:
        pending_students = get_pending_students()
    
    students = []
    for student in pending_students:
        students.append({
            'id': student[0],
            'name': student[4],
            'email': student[1],
            'department': student[5],
            'year': student[8],
            'cgpa': student[9]
        })
    
    return render_template('approve_students.html', pending_students=students)

# ==================== DRIVE MANAGEMENT ====================

@app.route('/tpo/manage_drives')
def manage_drives():
    """TPO manages drives"""
    if 'user_id' not in session or session.get('role') != 'tpo':
        return redirect('/login')
    
    drives = get_all_drives()
    
    drive_list = []
    for drive in drives:
        drive_list.append({
            'id': drive[0],
            'company_name': drive[1],
            'role': drive[2],
            'eligibility': drive[3]
        })
    
    return render_template('manage_drives.html', drives=drive_list)

# ==================== ALUMNI ROUTES ====================

@app.route('/alumni')
def alumni():
    """Alumni portal"""
    return render_template('inner_alumni.html')

@app.route('/alumni_registration', methods=['POST'])
def alumni_registration():
    """Alumni registration"""
    try:
        al_name = request.form.get('al_name')
        al_email = request.form.get('al_email')
        al_pass = request.form.get('al_pass')
        al_g_year = request.form.get('al_g_year')
        
        if save_alumni_data(al_name, al_email, al_pass, al_g_year):
            flash('Alumni registration successful!', 'success')
        else:
            flash('Error in alumni registration', 'error')
            
    except Exception as e:
        flash(f'Registration error: {str(e)}', 'error')
    
    return redirect('/alumni')

@app.route('/alumni_login', methods=['POST'])
def alumni_login():
    """Alumni login"""
    try:
        al_mail = request.form.get('al_mail')
        al_password = request.form.get('al_password')
        
        if al_mail and al_password:
            session['alumni_email'] = al_mail
            session['alumni_logged_in'] = True
            flash('Alumni login successful!', 'success')
        else:
            flash('Invalid credentials', 'error')
            
    except Exception as e:
        flash(f'Login error: {str(e)}', 'error')
    
    return redirect('/alumni')

# ==================== UTILITY ROUTES ====================

@app.route('/logout')
def logout():
    """Logout user"""
    session.clear()
    flash('You have been logged out successfully', 'info')
    return redirect('/login')

@app.route('/profile')
def profile():
    """User profile"""
    if 'user_id' not in session:
        return redirect('/login')
    return render_template('profile.html')

# ==================== HELPER FUNCTIONS ====================

def check_eligibility(student_cgpa, eligibility_criteria):
    """Check if student is eligible for drive"""
    try:
        if student_cgpa and eligibility_criteria:
            import re
            cgpa_match = re.search(r'(\d+\.?\d*)', eligibility_criteria)
            if cgpa_match:
                min_cgpa = float(cgpa_match.group(1))
                return float(student_cgpa) >= min_cgpa
        return True
    except:
        return True

def get_student_notifications(student_id):
    """Get student notifications"""
    return [
        {'message': 'Welcome to Placement Portal!', 'icon': 'bell', 'important': True, 'time': 'Just now'}
    ]

def get_all_faculty():
    """Get all faculty members"""
    conn = sqlite3.connect('placement.db')
    c = conn.cursor()
    faculty = c.execute('SELECT * FROM users WHERE role IN ("faculty", "hod", "tpo")').fetchall()
    conn.close()
    return faculty

def get_pending_students_by_department(department):
    """Get pending students by department"""
    conn = sqlite3.connect('placement.db')
    c = conn.cursor()
    students = c.execute('SELECT * FROM users WHERE role = "student" AND is_approved = 0 AND department = ?', 
                        (department,)).fetchall()
    conn.close()
    return students

def get_department_students(department):
    """Get students by department"""
    conn = sqlite3.connect('placement.db')
    c = conn.cursor()
    students = c.execute('SELECT * FROM users WHERE role = "student" AND department = ?', 
                        (department,)).fetchall()
    conn.close()
    return students

def get_all_department_stats():
    """Get department statistics"""
    conn = sqlite3.connect('placement.db')
    c = conn.cursor()
    depts = c.execute('SELECT DISTINCT department FROM users WHERE role = "student"').fetchall()
    stats = []
    for dept in depts:
        if dept[0]:
            count = c.execute('SELECT COUNT(*) FROM users WHERE role = "student" AND department = ?', 
                            (dept[0],)).fetchone()[0]
            stats.append({'department': dept[0], 'count': count})
    conn.close()
    return stats

def approve_student_db(student_id):
    """Approve student in database"""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        c.execute('UPDATE users SET is_approved = 1 WHERE id = ?', (student_id,))
        conn.commit()
        conn.close()
        return True
    except:
        return False

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)