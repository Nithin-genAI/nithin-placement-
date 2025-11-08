import sqlite3
def init_db():
    """Initialize the database with role-based tables."""
    try:
        conn = sqlite3.connect('placement.db')
        c = conn.cursor()
        
        # Users table with role types
        c.execute('''CREATE TABLE IF NOT EXISTS users
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      email TEXT UNIQUE, 
                      password TEXT, 
                      role TEXT CHECK(role IN ('tpo', 'hod', 'student')),
                      user_type TEXT DEFAULT 'student',
                      name TEXT, 
                      department TEXT, 
                      is_approved BOOLEAN DEFAULT FALSE,
                      mobile TEXT, 
                      year TEXT, 
                      cgpa TEXT,
                      created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')
        
        # Departments table for HOD management
        c.execute('''CREATE TABLE IF NOT EXISTS departments
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      name TEXT UNIQUE,
                      hod_id INTEGER,
                      total_students INTEGER DEFAULT 0,
                      FOREIGN KEY (hod_id) REFERENCES users (id))''')
        
        # Placement drives table
        c.execute('''CREATE TABLE IF NOT EXISTS drives
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      company_name TEXT, 
                      role TEXT, 
                      eligibility TEXT, 
                      description TEXT,
                      deadline DATE, 
                      created_by INTEGER,
                      status TEXT DEFAULT 'active',
                      created_date DATETIME DEFAULT CURRENT_TIMESTAMP)''')
        
        # Applications table with rounds
        c.execute('''CREATE TABLE IF NOT EXISTS applications
                     (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                      student_id INTEGER, 
                      drive_id INTEGER, 
                      status TEXT DEFAULT 'applied',
                      current_round INTEGER DEFAULT 1,
                      resume_path TEXT,
                      applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (student_id) REFERENCES users (id),
                      FOREIGN KEY (drive_id) REFERENCES drives (id))''')
        
        # Recruitment rounds table
        c.execute('''CREATE TABLE IF NOT EXISTS recruitment_rounds
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      drive_id INTEGER,
                      round_number INTEGER,
                      round_name TEXT,
                      round_date DATE,
                      status TEXT DEFAULT 'scheduled',
                      FOREIGN KEY (drive_id) REFERENCES drives (id))''')
        
        # Offer letters table
        c.execute('''CREATE TABLE IF NOT EXISTS offer_letters
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      application_id INTEGER,
                      student_id INTEGER,
                      drive_id INTEGER,
                      file_path TEXT,
                      offer_date DATE,
                      status TEXT DEFAULT 'sent',
                      FOREIGN KEY (application_id) REFERENCES applications (id),
                      FOREIGN KEY (student_id) REFERENCES users (id),
                      FOREIGN KEY (drive_id) REFERENCES drives (id))''')
        
        # Insert default departments
        departments = [
            'COMPUTER SCIENCE ENGINEERING',
            'ELECTRONICS & TELECOMMUNICATION ENGINEERING', 
            'MECHANICAL ENGINEERING',
            'ARTIFICIAL INTELLIGENCE',
            'CIVIL ENGINEERING'
        ]
        
        for dept in departments:
            c.execute('INSERT OR IGNORE INTO departments (name) VALUES (?)', (dept,))
        
        conn.commit()
        conn.close()
        print("✅ Role-based database initialized successfully")
        
    except Exception as e:
        print(f"❌ Database initialization error: {e}")