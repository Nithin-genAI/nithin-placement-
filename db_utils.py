import sqlite3
from datetime import datetime
import pandas as pd

class DBUtils:
    def __init__(self, db_path='placement_portal.db'):
        self.db_path = db_path
    
    def get_student_dashboard_data(self, student_id):
        """Get data for student dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get student basic info
        cursor.execute('''
            SELECT u.full_name, u.department, s.enrollment_number, s.current_year, 
                   s.btech_cgpa, s.placement_status, s.resume_path
            FROM users u 
            JOIN students s ON u.id = s.user_id 
            WHERE u.id = ?
        ''', (student_id,))
        student_info = cursor.fetchone()
        
        # Get registered drives
        cursor.execute('''
            SELECT pd.id, c.name, pd.job_role, pd.drive_date, dr.status, dr.current_round
            FROM drive_registrations dr
            JOIN placement_drives pd ON dr.drive_id = pd.id
            JOIN companies c ON pd.company_id = c.id
            WHERE dr.student_id = ?
            ORDER BY pd.drive_date DESC
        ''', (student_id,))
        registered_drives = cursor.fetchall()
        
        # Get upcoming drives
        cursor.execute('''
            SELECT pd.id, c.name, pd.job_role, pd.drive_date, pd.registration_deadline
            FROM placement_drives pd
            JOIN companies c ON pd.company_id = c.id
            WHERE pd.is_active = 1 AND pd.drive_date >= date('now')
            AND pd.id NOT IN (SELECT drive_id FROM drive_registrations WHERE student_id = ?)
            ORDER BY pd.drive_date
        ''', (student_id,))
        upcoming_drives = cursor.fetchall()
        
        conn.close()
        
        return {
            'student_info': student_info,
            'registered_drives': registered_drives,
            'upcoming_drives': upcoming_drives
        }
    
    def get_placement_officer_dashboard_data(self):
        """Get data for placement officer dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get statistics
        cursor.execute('SELECT COUNT(*) FROM placement_drives WHERE is_active = 1')
        active_drives = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM companies WHERE is_active = 1')
        total_companies = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM students WHERE is_placed = 1')
        placed_students = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM students')
        total_students = cursor.fetchone()[0]
        
        # Get recent drives
        cursor.execute('''
            SELECT c.name, pd.job_role, pd.drive_date, pd.current_applications, pd.status
            FROM placement_drives pd
            JOIN companies c ON pd.company_id = c.id
            ORDER BY pd.created_at DESC
            LIMIT 5
        ''')
        recent_drives = cursor.fetchall()
        
        conn.close()
        
        return {
            'stats': {
                'active_drives': active_drives,
                'total_companies': total_companies,
                'placed_students': placed_students,
                'total_students': total_students,
                'placement_percentage': (placed_students / total_students * 100) if total_students > 0 else 0
            },
            'recent_drives': recent_drives
        }
    
    def export_data_to_excel(self, data_type, filters=None):
        """Export data to Excel format"""
        conn = sqlite3.connect(self.db_path)
        
        if data_type == 'students':
            query = '''
                SELECT u.full_name, u.email, u.department, s.enrollment_number, 
                       s.current_year, s.btech_cgpa, s.placement_status
                FROM users u
                JOIN students s ON u.id = s.user_id
                WHERE u.role = 'student' AND u.is_approved = 1
            '''
            df = pd.read_sql_query(query, conn)
            filename = f"students_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        elif data_type == 'placement_drives':
            query = '''
                SELECT c.name as company_name, pd.job_role, pd.drive_date, 
                       pd.current_applications, pd.status
                FROM placement_drives pd
                JOIN companies c ON pd.company_id = c.id
            '''
            df = pd.read_sql_query(query, conn)
            filename = f"drives_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        
        conn.close()
        
        # Save to Excel
        df.to_excel(filename, index=False)
        return filename

# Create instance
db_utils = DBUtils()