import os
from decimal import Decimal
from datetime import date, datetime
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'online-learning-secret-key-2026')

# Database Configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', '127.0.0.1'),
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', '87654321'),
    'database': os.environ.get('DB_NAME', 'OnlineLearningSystem'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'autocommit': True
}

# Enable SSL for cloud MySQL providers (Aiven, TiDB, PlanetScale, etc.)
if os.environ.get('DB_SSL', '').lower() in ('true', '1', 'yes'):
    DB_CONFIG['ssl_disabled'] = False
    ca_path = os.environ.get('DB_SSL_CA', '')
    if ca_path:
        DB_CONFIG['ssl_ca'] = ca_path

def get_db_connection():
    """Establish and return a connection to MySQL database."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Database connection error: {e}")
        return None

def init_database():
    """Initialize the database from init_db.sql if tables don't exist yet.
    
    This runs on first deployment so the cloud database gets seeded
    with schema and sample data automatically.
    """
    # First connect WITHOUT specifying a database to create it if needed
    init_config = {k: v for k, v in DB_CONFIG.items() if k != 'database'}
    try:
        conn = mysql.connector.connect(**init_config)
        cursor = conn.cursor()
        db_name = DB_CONFIG.get('database', 'OnlineLearningSystem')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
        cursor.execute(f"USE `{db_name}`")

        # Check if STUDENT table already exists (i.e. DB is already seeded)
        cursor.execute("SHOW TABLES LIKE 'STUDENT'")
        if cursor.fetchone():
            print("[init_database] Tables already exist — skipping seed.")
            cursor.close()
            conn.close()
            return

        # Run init_db.sql to create tables and seed data
        sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'init_db.sql')
        if not os.path.exists(sql_path):
            print(f"[init_database] init_db.sql not found at {sql_path}")
            cursor.close()
            conn.close()
            return

        print(f"[init_database] Seeding database from {sql_path}...")
        with open(sql_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Split by semicolons and execute each statement
        statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        for stmt in statements:
            # Skip CREATE DATABASE and USE statements (already handled above)
            upper = stmt.upper().lstrip()
            if upper.startswith('CREATE DATABASE') or upper.startswith('USE '):
                continue
            try:
                cursor.execute(stmt)
            except Error as stmt_err:
                print(f"[init_database] Warning on statement: {stmt_err}")

        conn.commit()
        print("[init_database] Database seeded successfully!")
        cursor.close()
        conn.close()
    except Error as e:
        print(f"[init_database] Error: {e}")

def clean_row(row):
    """Recursively serialize Decimal, Date, and DateTime objects for JSON responses."""
    if not row:
        return row
    cleaned = {}
    for key, val in row.items():
        if isinstance(val, Decimal):
            cleaned[key] = float(val)
        elif isinstance(val, (date, datetime)):
            cleaned[key] = val.isoformat()
        else:
            cleaned[key] = val
    return cleaned

@app.route('/')
def index():
    """Main dashboard displaying Students, Courses, Instructors, and System Stats."""
    conn = get_db_connection()
    if not conn:
        flash("Could not connect to the database. Please verify MySQL service is running.", "error")
        return render_template('index.html', students=[], courses=[], instructors=[], stats={})

    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Fetch Students with quick aggregate summary (Enrolled Course count, avg progress)
        cursor.execute("""
            SELECT 
                s.*,
                (SELECT COUNT(*) FROM ENROLLMENT e WHERE e.Student_ID = s.Student_ID) AS Enrolled_Count,
                (SELECT ROUND(AVG(p.Completion_Percent), 1) FROM PROGRESS p WHERE p.Student_ID = s.Student_ID) AS Avg_Progress,
                (SELECT COUNT(*) FROM RESULT r WHERE r.Student_ID = s.Student_ID) AS Result_Count
            FROM STUDENT s
            ORDER BY s.Student_ID DESC
        """)
        students = cursor.fetchall()

        # 2. Fetch Courses joined with Instructor information
        cursor.execute("""
            SELECT 
                c.Course_ID, 
                c.Course_Name, 
                c.Description, 
                c.Duration, 
                c.Category, 
                c.Level,
                c.Instructor_ID,
                i.Name AS Instructor_Name,
                i.Specialization AS Instructor_Specialization,
                (SELECT COUNT(*) FROM MODULE m WHERE m.Course_ID = c.Course_ID) AS Module_Count,
                (SELECT COUNT(*) FROM ENROLLMENT e WHERE e.Course_ID = c.Course_ID) AS Enrolled_Count
            FROM COURSE c
            LEFT JOIN INSTRUCTOR i ON c.Instructor_ID = i.Instructor_ID
            ORDER BY c.Course_ID ASC
        """)
        courses = cursor.fetchall()

        # 3. Fetch Instructors
        cursor.execute("""
            SELECT 
                i.*,
                (SELECT COUNT(*) FROM COURSE c WHERE c.Instructor_ID = i.Instructor_ID) AS Course_Count
            FROM INSTRUCTOR i
            ORDER BY i.Instructor_ID ASC
        """)
        instructors = cursor.fetchall()

        # 4. Fetch Aggregate Metrics
        cursor.execute("SELECT COUNT(*) AS total_students FROM STUDENT")
        total_students = cursor.fetchone()['total_students']

        cursor.execute("SELECT COUNT(*) AS total_courses FROM COURSE")
        total_courses = cursor.fetchone()['total_courses']

        cursor.execute("SELECT COUNT(*) AS total_instructors FROM INSTRUCTOR")
        total_instructors = cursor.fetchone()['total_instructors']

        cursor.execute("SELECT COUNT(*) AS active_enrollments FROM ENROLLMENT WHERE Status = 'Active'")
        active_enrollments = cursor.fetchone()['active_enrollments']

        cursor.execute("SELECT ROUND(AVG(Completion_Percent), 1) AS avg_progress FROM PROGRESS")
        avg_progress_row = cursor.fetchone()
        avg_progress = float(avg_progress_row['avg_progress']) if avg_progress_row and avg_progress_row['avg_progress'] is not None else 0.0

        stats = {
            'total_students': total_students,
            'total_courses': total_courses,
            'total_instructors': total_instructors,
            'active_enrollments': active_enrollments,
            'avg_progress': avg_progress
        }

        return render_template(
            'index.html',
            students=students,
            courses=courses,
            instructors=instructors,
            stats=stats
        )
    except Error as e:
        flash(f"Error executing database query: {e}", "error")
        return render_template('index.html', students=[], courses=[], instructors=[], stats={})
    finally:
        cursor.close()
        conn.close()

@app.route('/students/add', methods=['POST'])
def add_student():
    """Insert a new student into the STUDENT table and optionally enroll in an introductory course."""
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    department = request.form.get('department', '').strip()
    year_str = request.form.get('year', '').strip()
    phone = request.form.get('phone', '').strip()
    course_id_str = request.form.get('course_id', '').strip()

    # Form Validation
    if not name or not email or not department or not year_str or not phone:
        flash("All fields are required to register a student.", "warning")
        return redirect(url_for('index'))

    try:
        year = int(year_str)
        if year < 1 or year > 5:
            flash("Year must be a number between 1 and 5.", "warning")
            return redirect(url_for('index'))
    except ValueError:
        flash("Invalid Year format. Please enter a valid number.", "warning")
        return redirect(url_for('index'))

    conn = get_db_connection()
    if not conn:
        flash("Database connection unavailable.", "error")
        return redirect(url_for('index'))

    cursor = conn.cursor(dictionary=True)
    try:
        # Guarantee that new student ID is ALWAYS one more than the student with the greatest ID number
        cursor.execute("SELECT COALESCE(MAX(Student_ID), 0) + 1 AS next_id FROM STUDENT")
        max_row = cursor.fetchone()
        next_student_id = max_row['next_id'] if isinstance(max_row, dict) else max_row[0]

        query = """
            INSERT INTO STUDENT (Student_ID, Name, Email, Department, Year, Phone)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (next_student_id, name, email, department, year, phone))
        new_student_id = next_student_id

        # Keep MySQL AUTO_INCREMENT aligned with greatest ID + 1
        cursor.execute(f"ALTER TABLE STUDENT AUTO_INCREMENT = {new_student_id + 1}")

        # Optional initial course enrollment
        if course_id_str:
            try:
                course_id = int(course_id_str)
                cursor.execute("""
                    INSERT INTO ENROLLMENT (Enroll_Date, Status, Completion_Date, Student_ID, Course_ID)
                    VALUES (CURDATE(), 'Active', NULL, %s, %s)
                """, (new_student_id, course_id))

                # Find first module for course to initialize progress tracking
                cursor.execute("""
                    SELECT Module_ID FROM MODULE WHERE Course_ID = %s ORDER BY Sequence_No ASC LIMIT 1
                """, (course_id,))
                mod_row = cursor.fetchone()
                if mod_row:
                    first_mod_id = mod_row['Module_ID'] if isinstance(mod_row, dict) else mod_row[0]
                    cursor.execute("""
                        INSERT INTO PROGRESS (Progress_Date, Completion_Percent, Status, Time_Spent, Student_ID, Module_ID)
                        VALUES (CURDATE(), 0.00, 'In Progress', 0, %s, %s)
                    """, (new_student_id, first_mod_id))
            except Exception as enroll_err:
                print(f"Auto-enrollment error: {enroll_err}")

        conn.commit()
        flash(f"Student '{name}' was successfully registered as Student #{new_student_id}!", "success")
    except mysql.connector.IntegrityError as ie:
        if ie.errno == 1062:
            flash(f"A student with email '{email}' already exists.", "warning")
        else:
            flash(f"Database constraint error: {ie.msg}", "error")
    except Error as e:
        flash(f"Failed to add student: {e}", "error")
    finally:
        cursor.close()
        conn.close()

    return redirect(url_for('index'))

@app.route('/students/delete/<int:student_id>', methods=['POST'])
def delete_student(student_id):
    """Delete a student by Student_ID from the STUDENT table and cascade related records."""
    is_ajax = request.headers.get('Accept') == 'application/json' or request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest'

    conn = get_db_connection()
    if not conn:
        if is_ajax:
            return jsonify({'success': False, 'error': 'Database connection unavailable.'}), 500
        flash("Database connection unavailable.", "error")
        return redirect(url_for('index'))

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT Name FROM STUDENT WHERE Student_ID = %s", (student_id,))
        student = cursor.fetchone()

        if not student:
            if is_ajax:
                return jsonify({'success': False, 'error': f'Student ID #{student_id} not found.'}), 404
            flash(f"Student ID #{student_id} not found.", "warning")
            return redirect(url_for('index'))

        student_name = student['Name']

        # Foreign keys have ON DELETE CASCADE in ENROLLMENT, PROGRESS, RESULT
        cursor.execute("DELETE FROM STUDENT WHERE Student_ID = %s", (student_id,))
        conn.commit()

        # Recalculate remaining student count & avg progress for real-time KPI updates
        cursor.execute("SELECT COUNT(*) AS total_students FROM STUDENT")
        total_students = cursor.fetchone()['total_students']

        cursor.execute("SELECT ROUND(AVG(Completion_Percent), 1) AS avg_progress FROM PROGRESS")
        avg_row = cursor.fetchone()
        avg_prog = float(avg_row['avg_progress']) if avg_row and avg_row['avg_progress'] is not None else 0.0

        # Resynchronize table AUTO_INCREMENT to MAX(Student_ID) + 1
        cursor.execute("SELECT COALESCE(MAX(Student_ID), 0) + 1 AS next_id FROM STUDENT")
        max_row = cursor.fetchone()
        next_avail_id = max_row['next_id'] if isinstance(max_row, dict) else max_row[0]
        cursor.execute(f"ALTER TABLE STUDENT AUTO_INCREMENT = {next_avail_id}")

        if is_ajax:
            return jsonify({
                'success': True,
                'message': f"Student '{student_name}' (ID: #{student_id}) was successfully deleted from database.",
                'student_id': student_id,
                'student_name': student_name,
                'total_students': total_students,
                'avg_progress': avg_prog
            })

        flash(f"Student '{student_name}' (ID: #{student_id}) was successfully deleted.", "success")
    except Error as e:
        if is_ajax:
            return jsonify({'success': False, 'error': f"Failed to delete student: {e}"}), 500
        flash(f"Failed to delete student: {e}", "error")
    finally:
        cursor.close()
        conn.close()

    return redirect(url_for('index'))

@app.route('/api/students/<int:student_id>/details', methods=['GET'])
def api_student_details(student_id):
    """Comprehensive API returning full profile, enrollments, progress, and assessment results for a student."""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database unavailable'}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        # 1. Student Master Record
        cursor.execute("SELECT * FROM STUDENT WHERE Student_ID = %s", (student_id,))
        student = cursor.fetchone()
        if not student:
            return jsonify({'error': f'Student #{student_id} not found'}), 404

        # 2. Enrollments with Course & Instructor information
        cursor.execute("""
            SELECT 
                e.Enrollment_ID,
                e.Enroll_Date,
                e.Status AS Enrollment_Status,
                e.Completion_Date,
                c.Course_ID,
                c.Course_Name,
                c.Description AS Course_Description,
                c.Duration AS Course_Duration,
                c.Category AS Course_Category,
                c.Level AS Course_Level,
                i.Instructor_ID,
                i.Name AS Instructor_Name,
                i.Email AS Instructor_Email,
                i.Specialization AS Instructor_Specialization,
                i.Phone AS Instructor_Phone
            FROM ENROLLMENT e
            JOIN COURSE c ON e.Course_ID = c.Course_ID
            LEFT JOIN INSTRUCTOR i ON c.Instructor_ID = i.Instructor_ID
            WHERE e.Student_ID = %s
            ORDER BY e.Enroll_Date DESC
        """, (student_id,))
        enrollments = [clean_row(r) for r in cursor.fetchall()]

        # 3. Learning Progress with Module details
        cursor.execute("""
            SELECT 
                p.Progress_ID,
                p.Progress_Date,
                p.Completion_Percent,
                p.Status AS Progress_Status,
                p.Time_Spent,
                m.Module_ID,
                m.Module_Name,
                m.Description AS Module_Description,
                m.Sequence_No,
                c.Course_ID,
                c.Course_Name
            FROM PROGRESS p
            JOIN MODULE m ON p.Module_ID = m.Module_ID
            JOIN COURSE c ON m.Course_ID = c.Course_ID
            WHERE p.Student_ID = %s
            ORDER BY m.Sequence_No ASC, p.Progress_Date DESC
        """, (student_id,))
        progress_records = [clean_row(r) for r in cursor.fetchall()]

        # 4. Assessment Results
        cursor.execute("""
            SELECT 
                r.Result_ID,
                r.Score,
                r.Attempt_No,
                r.Result_Date,
                a.Assessment_ID,
                a.Assessment_Name,
                a.Assessment_Type,
                a.Max_Marks,
                m.Module_Name,
                c.Course_Name,
                ROUND((r.Score / a.Max_Marks) * 100, 1) AS Percentage,
                CASE 
                    WHEN (r.Score / a.Max_Marks) >= 0.50 THEN 'Pass'
                    ELSE 'Fail'
                END AS Performance_Grade
            FROM RESULT r
            JOIN ASSESSMENT a ON r.Assessment_ID = a.Assessment_ID
            JOIN MODULE m ON a.Module_ID = m.Module_ID
            JOIN COURSE c ON m.Course_ID = c.Course_ID
            WHERE r.Student_ID = %s
            ORDER BY r.Result_Date DESC, r.Attempt_No DESC
        """, (student_id,))
        results = [clean_row(r) for r in cursor.fetchall()]

        # 5. Aggregate Analytics
        total_time_mins = sum(p.get('Time_Spent', 0) for p in progress_records)
        avg_completion = (
            round(sum(p.get('Completion_Percent', 0) for p in progress_records) / len(progress_records), 1)
            if progress_records else 0.0
        )
        avg_score_pct = (
            round(sum(r.get('Percentage', 0) for r in results) / len(results), 1)
            if results else 0.0
        )

        completed_modules = sum(1 for p in progress_records if p.get('Completion_Percent', 0) >= 100.0 or p.get('Progress_Status') == 'Completed')

        summary = {
            'total_courses': len(enrollments),
            'total_modules': len(progress_records),
            'completed_modules': completed_modules,
            'total_time_spent_mins': total_time_mins,
            'total_time_spent_hrs': round(total_time_mins / 60.0, 1),
            'avg_completion_percent': avg_completion,
            'avg_score_percent': avg_score_pct,
            'total_assessments_taken': len(results)
        }

        return jsonify({
            'student': clean_row(student),
            'enrollments': enrollments,
            'progress': progress_records,
            'results': results,
            'summary': summary
        })
    finally:
        cursor.close()
        conn.close()

@app.route('/api/students', methods=['GET'])
def api_get_students():
    """REST API endpoint to get all students as JSON."""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database unavailable'}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM STUDENT ORDER BY Student_ID DESC")
        students = [clean_row(r) for r in cursor.fetchall()]
        return jsonify({'students': students, 'count': len(students)})
    finally:
        cursor.close()
        conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to test database connectivity."""
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'})
    return jsonify({'status': 'unhealthy', 'database': 'disconnected'}), 500

# Initialize database on startup (seeds tables from init_db.sql if they don't exist)
# This runs on both local dev and Render deployment
init_database()

if __name__ == '__main__':
    # Running Flask dev server on 127.0.0.1:5000
    app.run(host='127.0.0.1', port=5000, debug=True)

