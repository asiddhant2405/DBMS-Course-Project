# Online Course Learning Progress Management System

**Developed by Siddhant Agarwal (25WU0102262)**  
*Database Management Systems (DBMS) Course Project*

---

## 📌 Project Overview
A full-stack database web application prototype demonstrating relational data management for an online course platform. The system connects to a live **MySQL 9.7** database (`OnlineLearningSystem`) and delivers a warm, minimalist user interface built with **Flask**, **HTML5**, and custom **CSS3**.

---

## 🎨 Design System & Aesthetic
- **Background**: Soft warm cream (`#FAF9F6`)
- **Accent Color**: Terracotta (`#E2725B`), Amber (`#D97706`), and Sage (`#4D7C5B`)
- **Typography**: Modern sans-serif via Google Fonts (*Inter*)
- **Containers**: Smooth rounded corners (`border-radius: 8px` / `12px`), subtle elevation shadows, and ample whitespace
- **Branding**: Persistent navbar and footer bearing the project title and author credit: **"Developed by Siddhant Agarwal (25WU0102262)"**

---

## 🚀 Key Functional Modules
1. **Live Metric Cards**:
   - Total Students registered (Live count)
   - Active Courses count
   - Faculty Instructors count
   - Active Enrollments count
2. **Student Directory (View Records)**:
   - Scrollable HTML table with sticky headers.
   - Real-time client-side search/filter by Name, Email, or Department.
   - Clean department tags (`CS`, `IT`, `ECE`) and year badges.
3. **Student Registration (Insert Records)**:
   - Modern input form to register a new student with validation: Full Name, University Email, Department, Year of Study, and Phone Number.
   - Commits directly into MySQL table `STUDENT`.
4. **Student Removal (Delete Records)**:
   - Dedicated Delete button on every table row.
   - Interactive confirmation dialog to prevent accidental deletion.
   - Leverages `ON DELETE CASCADE` foreign keys across `ENROLLMENT`, `PROGRESS`, and `RESULT` tables.
5. **Relational Data Section (`COURSE` & `INSTRUCTOR`)**:
   - Course cards displaying curriculum level, category, module count, and linked Faculty Instructor via foreign key (`Course.Instructor_ID → Instructor.Instructor_ID`).
   - Faculty Instructor directory with specialization, email, and courses assigned.

---

## 🗄️ Database Schema (`OnlineLearningSystem`)
- **INSTRUCTOR**: `Instructor_ID` (PK), `Name`, `Email`, `Specialization`, `Phone`
- **STUDENT**: `Student_ID` (PK), `Name`, `Email`, `Department`, `Year`, `Phone`
- **COURSE**: `Course_ID` (PK), `Course_Name`, `Description`, `Duration`, `Category`, `Level`, `Instructor_ID` (FK)
- **MODULE**: `Module_ID` (PK), `Module_Name`, `Description`, `Sequence_No`, `Course_ID` (FK)
- **ASSESSMENT**: `Assessment_ID` (PK), `Assessment_Name`, `Assessment_Type`, `Max_Marks`, `Module_ID` (FK)
- **ENROLLMENT**: `Enrollment_ID` (PK), `Enroll_Date`, `Status`, `Completion_Date`, `Student_ID` (FK), `Course_ID` (FK)
- **PROGRESS**: `Progress_ID` (PK), `Progress_Date`, `Completion_Percent`, `Status`, `Time_Spent`, `Student_ID` (FK), `Module_ID` (FK)
- **RESULT**: `Result_ID` (PK), `Score`, `Attempt_No`, `Result_Date`, `Student_ID` (FK), `Assessment_ID` (FK)

---

## 🛠️ How to Run Locally

### 1. Requirements
Ensure Python and MySQL are installed. Dependencies:
```bash
pip install flask mysql-connector-python
```

### 2. Database Initialization
```bash
python -c "
import mysql.connector

with open('init_db.sql', 'r') as f:
    sql_script = f.read()

conn = mysql.connector.connect(host='127.0.0.1', user='root', password='YOUR_PASSWORD')
cursor = conn.cursor()
for stmt in [s.strip() for s in sql_script.split(';') if s.strip()]:
    cursor.execute(stmt)
conn.commit()
conn.close()
"
```

### 3. Launch Flask Server
```bash
python app.py
```
Open **`http://127.0.0.1:5000`** in any web browser.
