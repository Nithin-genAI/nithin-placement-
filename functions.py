import pandas as pd
import os
import sqlite3
import bcrypt
from datetime import datetime

# ==================== PASSWORD SECURITY ====================

def hash_password(password):
    """Hash a password for storing."""
    try:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    except Exception as e:
        print(f"Password hashing error: {e}")
        return None

def check_password(password, hashed):
    """Check if provided password matches the hashed password."""
    try:
        if isinstance(hashed, str):
            hashed = hashed.encode('utf-8')
        return bcrypt.checkpw(password.encode('utf-8'), hashed)
    except Exception as e:
        print(f"Password check error: {e}")
        return False

# ==================== DATABASE SETUP ====================

def init_db():
    """Initialize the database with required tables."""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        
        # Users table with role types
        c.execute('''CREATE TABLE IF NOT EXISTS users
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      email TEXT UNIQUE, 
                      password TEXT, 
                      role TEXT,
                      name TEXT, 
                      department TEXT, 
                      is_approved BOOLEAN DEFAULT FALSE,
                      mobile TEXT, 
                      year TEXT, 
                      cgpa TEXT)''')
        
        # Placement drives table
        c.execute('''CREATE TABLE IF NOT EXISTS drives
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      company_name TEXT, 
                      role TEXT, 
                      eligibility TEXT, 
                      created_by INTEGER)''')
        
        # Applications table
        c.execute('''CREATE TABLE IF NOT EXISTS applications
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      student_id INTEGER, 
                      drive_id INTEGER, 
                      status TEXT DEFAULT 'applied', 
                      resume_path TEXT)''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully")
        
    except Exception as e:
        print(f"❌ Database initialization error: {e}")

# Initialize database on import
init_db()

# ==================== USER MANAGEMENT ====================

def save_student_data(stu_email, stu_password, stu_r_password, stu_name, stu_l_name, stu_mobile, stu_dept, stu_year, stu_gender, current_cgpa, year_admission):
    """Save student registration data."""
    try:
        full_name = f"{stu_name} {stu_l_name}"
        hashed_pwd = hash_password(stu_password)
        
        if not hashed_pwd:
            return "Password hashing failed"
        
        if stu_password != stu_r_password:
            return "Passwords do not match"
        
        # Validate CGPA
        try:
            cgpa_value = float(current_cgpa)
            if cgpa_value < 1 or cgpa_value > 10:
                return "CGPA must be between 1 and 10"
        except (ValueError, TypeError):
            return "Invalid CGPA format"
        
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        
        # Check if email exists
        existing_user = c.execute('SELECT id FROM users WHERE email = ?', (stu_email,)).fetchone()
        if existing_user:
            conn.close()
            return "Email already exists"
        
        # Insert new student
        c.execute('''INSERT INTO users (email, password, role, name, department, mobile, year, cgpa, is_approved)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                  (stu_email, hashed_pwd, 'student', full_name, stu_dept, stu_mobile, stu_year, str(cgpa_value), False))
        conn.commit()
        conn.close()
        
        # Excel backup
        _save_student_excel_backup(stu_name, stu_l_name, stu_email, stu_mobile, stu_password, stu_dept, stu_year, current_cgpa)
        
        return "Success"
        
    except sqlite3.IntegrityError:
        return "Email already exists"
    except Exception as e:
        print(f"Student save error: {e}")
        return f"Registration failed: {str(e)}"

def save_faculty_data(fac_email, fac_password, fac_r_password, fac_name, fac_l_name, fac_mobile, fac_dept):
    """Save faculty registration data."""
    try:
        full_name = f"{fac_name} {fac_l_name}"
        hashed_pwd = hash_password(fac_password)
        
        if not hashed_pwd:
            return "Password hashing failed"
        
        if fac_password != fac_r_password:
            return "Passwords do not match"
        
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        
        # Check if email already exists
        existing_user = c.execute('SELECT id FROM users WHERE email = ?', (fac_email,)).fetchone()
        if existing_user:
            conn.close()
            return "Email already exists"
        
        # Insert new faculty
        c.execute('''INSERT INTO users (email, password, role, name, department, mobile, is_approved)
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                  (fac_email, hashed_pwd, 'faculty', full_name, fac_dept, fac_mobile, True))
        conn.commit()
        conn.close()
        
        return "Success"
        
    except sqlite3.IntegrityError:
        return "Email already exists"
    except Exception as e:
        print(f"Faculty save error: {e}")
        return f"Registration failed: {str(e)}"

def save_tpo_data(tpo_email, tpo_password, tpo_r_password, tpo_name, tpo_mobile):
    """Save TPO registration data."""
    try:
        hashed_pwd = hash_password(tpo_password)
        
        if not hashed_pwd:
            return "Password hashing failed"
        
        if tpo_password != tpo_r_password:
            return "Passwords do not match"
        
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        
        # Check if TPO already exists
        existing_tpo = c.execute('SELECT id FROM users WHERE role = "tpo"').fetchone()
        if existing_tpo:
            conn.close()
            return "TPO already exists in system"
        
        # Insert TPO
        c.execute('''INSERT INTO users (email, password, role, name, mobile, is_approved)
                     VALUES (?, ?, ?, ?, ?, ?)''',
                  (tpo_email, hashed_pwd, 'tpo', tpo_name, tpo_mobile, True))
        conn.commit()
        conn.close()
        
        return "Success"
        
    except sqlite3.IntegrityError:
        return "Email already exists"
    except Exception as e:
        return f"TPO registration failed: {str(e)}"

def save_hod_data(hod_email, hod_password, hod_r_password, hod_name, hod_mobile, hod_department):
    """Save HOD registration data."""
    try:
        hashed_pwd = hash_password(hod_password)
        
        if not hashed_pwd:
            return "Password hashing failed"
        
        if hod_password != hod_r_password:
            return "Passwords do not match"
        
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        
        # Check if email exists
        existing_user = c.execute('SELECT id FROM users WHERE email = ?', (hod_email,)).fetchone()
        if existing_user:
            conn.close()
            return "Email already exists"
        
        # Check if HOD already exists for this department
        existing_hod = c.execute('SELECT id FROM users WHERE role = "hod" AND department = ?', (hod_department,)).fetchone()
        if existing_hod:
            conn.close()
            return f"HOD already exists for {hod_department}"
        
        # Insert HOD
        c.execute('''INSERT INTO users (email, password, role, name, department, mobile, is_approved)
                     VALUES (?, ?, ?, ?, ?, ?, ?)''',
                  (hod_email, hashed_pwd, 'hod', hod_name, hod_department, hod_mobile, True))
        
        conn.commit()
        conn.close()
        
        return "Success"
        
    except sqlite3.IntegrityError:
        return "Email already exists"
    except Exception as e:
        return f"HOD registration failed: {str(e)}"

def _save_student_excel_backup(stu_name, stu_l_name, stu_email, stu_mobile, stu_password, stu_dept, stu_year, current_cgpa):
    """Save student data to Excel backup."""
    try:
        os.makedirs('Documents', exist_ok=True)
        
        row = {
            'Name': stu_name, 
            'Last Name': stu_l_name, 
            'Email': stu_email, 
            'Mobile': stu_mobile,
            'Password': stu_password,
            'Department': stu_dept, 
            'Year': stu_year,
            'Current CGPA': current_cgpa,
            'Registration Date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        file_path = 'Documents/student_data.xlsx'
        if os.path.exists(file_path):
            df = pd.read_excel(file_path)
            df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
        else:
            df = pd.DataFrame([row])
        
        df.to_excel(file_path, index=False)
        
    except Exception as e:
        print(f"Student Excel backup error: {e}")

# ==================== DATA RETRIEVAL ====================

def get_user_by_email(email):
    """Get user by email."""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        user = c.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        conn.close()
        return user
    except Exception as e:
        print(f"Get user error: {e}")
        return None

def get_student_applications(student_id):
    """Get student applications."""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        applications = c.execute('''
            SELECT a.*, d.company_name, d.role 
            FROM applications a
            JOIN drives d ON a.drive_id = d.id
            WHERE a.student_id = ?
        ''', (student_id,)).fetchall()
        conn.close()
        return applications
    except Exception as e:
        print(f"Get student applications error: {e}")
        return []

def get_all_drives():
    """Get all placement drives."""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        drives = c.execute('SELECT * FROM drives').fetchall()
        conn.close()
        return drives
    except Exception as e:
        print(f"Get all drives error: {e}")
        return []

def get_pending_students():
    """Get pending students."""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        students = c.execute('SELECT * FROM users WHERE role = "student" AND is_approved = 0').fetchall()
        conn.close()
        return students
    except Exception as e:
        print(f"Get pending students error: {e}")
        return []

def get_student_stats():
    """Get student statistics."""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        
        total_students = c.execute('SELECT COUNT(*) FROM users WHERE role = "student"').fetchone()[0]
        approved_students = c.execute('SELECT COUNT(*) FROM users WHERE role = "student" AND is_approved = 1').fetchone()[0]
        
        conn.close()
        
        return {
            'total_students': total_students,
            'approved_students': approved_students,
            'pending_approvals': total_students - approved_students
        }
        
    except Exception as e:
        print(f"Student stats error: {e}")
        return {
            'total_students': 0,
            'approved_students': 0,
            'pending_approvals': 0
        }

def get_department_stats(department):
    """Get department statistics."""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        
        dept_students = c.execute('SELECT COUNT(*) FROM users WHERE role = "student" AND department = ?', (department,)).fetchone()[0]
        dept_applications = c.execute('''
            SELECT COUNT(*) FROM applications a
            JOIN users u ON a.student_id = u.id
            WHERE u.department = ?
        ''', (department,)).fetchone()[0]
        
        conn.close()
        
        return {
            'dept_students': dept_students,
            'dept_applications': dept_applications,
            'approval_rate': 100  # Simplified for now
        }
        
    except Exception as e:
        print(f"Department stats error: {e}")
        return {
            'dept_students': 0,
            'dept_applications': 0,
            'approval_rate': 0
        }

# ==================== NOTIFICATION SYSTEM ====================

def send_drive_notification(student_email, student_name, company_name, role, notification_type):
    """Send drive notification."""
    try:
        if notification_type == "application":
            subject = f"Application Submitted - {company_name}"
            body = f"""
Dear {student_name},

Your application for {role} at {company_name} has been submitted successfully.

Best regards,
Nithin College Placement Cell
            """
        else:
            subject = f"Notification - {company_name}"
            body = f"""
Dear {student_name},

{company_name}

{role}

Best regards,
Nithin College Placement Cell
            """
        
        print(f"📧 NOTIFICATION: {subject}")
        print(f"To: {student_email}")
        print(f"Body: {body}")
        
        return True
        
    except Exception as e:
        print(f"Drive notification error: {e}")
        return False

# ==================== ALUMNI MANAGEMENT ====================

def save_alumni_data(al_name, al_email, al_password, al_pass_year):
    """Save alumni data."""
    try:
        os.makedirs('Documents', exist_ok=True)
        
        row = {
            'Name': al_name, 
            'Email': al_email, 
            'Password': al_password, 
            'Passout Year': al_pass_year,
            'Registration Date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        file_path = 'Documents/alumni_data.xlsx'
        if os.path.exists(file_path):
            df = pd.read_excel(file_path)
            df = pd.concat([df, pd.DataFrame([row])], ignore_index=True)
        else:
            df = pd.DataFrame([row])
        
        df.to_excel(file_path, index=False)
        return True
        
    except Exception as e:
        print(f"Alumni save error: {e}")
        return False

print("✅ functions.py loaded successfully")