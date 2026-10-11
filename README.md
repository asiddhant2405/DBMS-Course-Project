# Online Course Learning Progress Management System
### B.Tech 2nd Year — Database Management Systems (DBMS) Laboratory Course Project

---

## 🎓 Student & Submission Details
- **Student 1:** **Siddhant Agarwal** | Roll No: `25WU0102262` | Section: `AIML Whales` | B.Tech CSE (AI & ML)
- **Student 2:** **Manthena Naga Sri Rohan** | Roll No: `25WU0102151` | Section: `AIML Panthers` | B.Tech CSE (AI & ML)
- **Course:** Database Management Systems (DBMS) Lab
- **Database Engine:** MySQL Server 9.7 (Database: `learningprogressdb`)
- **Web App Stack:** React 18 (Vite, TypeScript, TailwindCSS) + Node.js (Express, `mysql2`)

---

## 📌 Project Overview
The **Online Course Learning Progress Management System** is a full-stack, enterprise-grade academic database management application. It models, governs, and analyzes the entire lifecycle of modern online education: student cohorts, instructors, course offerings, syllabus modules, multi-format assessments, student registrations, granular learning progress, and assessment grades.

Every user interaction in the frontend is connected directly to a real MySQL database. The system strictly adheres to **Boyce-Codd Normal Form (BCNF)**, guarantees referential integrity through declarative foreign key constraints (`ON DELETE RESTRICT`), and prevents anomalies through composite uniqueness and domain check constraints.

---

## 🚀 Key Features
1. **Real MySQL Integration:** Direct connection to MySQL 9.7 using an asynchronous `mysql2/promise` connection pool. Zero mock APIs, localStorage, or in-memory arrays.
2. **Normalized 8-Table Schema:** `STUDENT`, `INSTRUCTOR`, `COURSE`, `MODULE`, `ASSESSMENT`, `ENROLLMENT`, `PROGRESS`, and `RESULT`.
3. **Deterministic Seed Dataset:** Exactly 30 student records, exactly 14 first-year students, and Dr. Alan Turing teaching exactly 2 courses (`Intro to Python` and `Database Systems`).
4. **Full CRUD Operations:** Interactive Create, Read, Update, and Delete operations with intuitive dropdown selectors for all foreign-key relationships.
5. **Referential Integrity Protection:** Prevents deletion of records referenced by child tables, displaying informative conflict dialogs.
6. **SQL Query Lab:** Interactive query runner executing all 7 presentation queries with millisecond execution profiling and tabular results.
7. **Real-Time Analytics Dashboard:** Aggregate KPI metric cards, Recharts department distribution, cohort breakdowns, and recent activity feeds.
8. **Faculty Live Evaluation Assistant:** Guided 4-step workflow designed specifically for faculty evaluation:
   - **Step A:** INSERT new Student #31.
   - **Step B:** VIEW Student #31 in live database.
   - **Step C:** DELETE Student #31 cleanly.
   - **Step D:** Attempt DELETE on Student #1 to prove foreign-key `RESTRICT` protection.
9. **Database Overview & Schema Introspection:** Live table row counters, dynamic data dictionary from `information_schema.COLUMNS`, and relational architecture map.

---

## 📁 Repository Structure
```
DBMS/
├── Presentation-I/                        # Problem Statement & Conceptual Modeling
│   ├── README.md                          # Objectives, Scope & Conceptual ER
│   └── Presentation-I_Online_Course...pdf # Reference Slide Deck
├── Presentation-II/                       # Schema Design, Normalization & Relational Mapping
│   ├── README.md                          # FDs, 1NF, 2NF, 3NF, BCNF Proofs
│   ├── schema.sql                         # Complete DDL Schema definition
│   ├── seed.sql                           # Deterministic 30-student seed script
│   ├── verification.sql                   # SQL integrity test suite
│   └── Presentation-II_Online_Course...pdf# Reference Slide Deck
├── Presentation-III/                      # UI Implementation & Faculty Demo
│   ├── README.md                          # Full-stack architecture & Demo Guide
│   └── screenshots/                       # High-resolution screenshots & WebP video
├── Project-Report/                        # Complete 16-Section Project Report
│   └── PROJECT_REPORT.md                  # Comprehensive academic report
├── database/                              # Authoritative Database Scripts
│   ├── schema.sql                         # DDL Table Creation
│   ├── seed.sql                           # Deterministic Seed Data
│   ├── reset_and_seed.sql                 # Reset and Repopulate Script
│   └── verification.sql                   # Automated Verification Queries
├── backend/                               # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js                   # MySQL Connection Pool
│   │   ├── controllers/                   # CRUD & Specialized Controllers
│   │   ├── routes/                        # Express API Routes
│   │   ├── middleware/                    # Centralized Error & CORS Middleware
│   │   └── server.js                      # Application Entry Point
│   ├── .env                               # Environment Configuration
│   └── package.json
├── frontend/                              # React + Vite + TypeScript Client
│   ├── src/
│   │   ├── components/                    # Layout, Modals, Navbar, Sidebar
│   │   ├── pages/                         # Dashboard, 8 CRUD pages, QueryLab, Demo
│   │   ├── services/api.ts                # Axios REST Client
│   │   ├── App.tsx                        # Client-side Routing
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── screenshots/                           # System Verification Screenshots
│   ├── 01_dashboard_analytics.png
│   ├── 02_students_directory.png
│   ├── 03_query_lab_query1_year1.png
│   ├── 04_query_lab_query2_alan_turing.png
│   ├── 05_database_overview_schema.png
│   ├── 06_demo_step_a_form.png
│   ├── 07_demo_step_a_inserted.png
│   ├── 08_demo_step_b_queried.png
│   ├── 09_demo_step_c_deleted.png
│   ├── 10_demo_step_d_fk_conflict.png
│   └── ui_system_demo.webp
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack
- **Database Engine:** MySQL Server 9.7 (InnoDB Storage Engine)
- **Backend API:** Node.js v20, Express.js 4.x, `mysql2/promise`, `dotenv`, `cors`
- **Frontend App:** React 18, Vite 6, TypeScript 5, TailwindCSS 3.4, React Router 6, Recharts 2, Lucide Icons
- **Operating Environment:** Windows 11 / Linux / macOS

---

## ⚙️ Prerequisites & Setup Instructions

### 1. Prerequisites
- **Node.js** (v18.x or v20.x LTS)
- **MySQL Server** (v8.x or v9.x) running locally on port `3306`
- **MySQL Workbench** or MySQL CLI

### 2. Database Initialization
Open PowerShell or your terminal and execute the SQL scripts against your MySQL instance:
```bash
# Using MySQL Command Line Client (replace password with your root password)
mysql -u root -p -e "source database/schema.sql;"
mysql -u root -p -e "source database/seed.sql;"
mysql -u root -p -e "source database/verification.sql;"
```
*Note for this workstation:* MySQL password is set to `87654321`.

### 3. Backend Setup
```bash
cd backend
npm install
# Configure backend/.env (already configured):
# PORT=5000
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=learningprogressdb

# Start backend server
node src/server.js
```
The backend starts at `http://localhost:5000`. You should see:
```
Server running on port 5000
Testing MySQL connection...
MySQL Database connected successfully to learningprogressdb!
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 3000
```
Open `http://localhost:3000` in your web browser. The application will connect automatically to the backend API.

---

## 📊 Presentation Benchmark SQL Queries

The application features a dedicated **SQL Query Lab** (`http://localhost:3000/query-lab`) that executes the following predefined queries against MySQL:

| # | Query Purpose | SQL Statement | Expected & Verified Result |
| :--- | :--- | :--- | :--- |
| **Q1** | **First-Year Students** | `SELECT Name, Department, Year FROM STUDENT WHERE Year = 1;` | **Exactly 14 students** returned. |
| **Q2** | **Instructor-Course JOIN** | `SELECT i.Name AS Instructor_Name, c.Course_Name, c.Category FROM INSTRUCTOR i JOIN COURSE c ON i.Instructor_ID = c.Instructor_ID;` | **Dr. Alan Turing** teaches **exactly 2 courses** (`Intro to Python`, `Database Systems`). |
| **Q3** | **Student Enrollments** | `SELECT s.Name, s.Department, c.Course_Name, e.Enrollment_Date FROM ENROLLMENT e JOIN STUDENT s ON e.Student_ID = s.Student_ID JOIN COURSE c ON e.Course_ID = c.Course_ID;` | 30 course registrations listed. |
| **Q4** | **Learning Progress** | `SELECT s.Name, c.Course_Name, m.Module_Name, p.Status, p.Completion_Percentage FROM PROGRESS p JOIN STUDENT s ON p.Student_ID = s.Student_ID JOIN MODULE m ON p.Module_ID = m.Module_ID JOIN COURSE c ON m.Course_ID = c.Course_ID;` | Granular module completion statuses. |
| **Q5** | **Assessment Scores** | `SELECT s.Name, a.Title, a.Type, r.Score, a.Max_Marks FROM RESULT r JOIN STUDENT s ON r.Student_ID = s.Student_ID JOIN ASSESSMENT a ON r.Assessment_ID = a.Assessment_ID;` | Score and percentage calculation. |
| **Q6** | **Department Breakdown** | `SELECT Department, COUNT(*) AS Total_Students FROM STUDENT GROUP BY Department ORDER BY Total_Students DESC;` | Computer Science: 13, IT: 10, Electronics: 7. |
| **Q7** | **Course Completion** | `SELECT c.Course_Name, COUNT(p.Progress_ID) AS Total_Modules_Tracked, ROUND(AVG(p.Completion_Percentage), 2) AS Avg_Completion_Percentage FROM COURSE c JOIN MODULE m ON c.Course_ID = m.Course_ID LEFT JOIN PROGRESS p ON m.Module_ID = p.Module_ID GROUP BY c.Course_ID, c.Course_Name;` | Course-level average completion percentage. |

---

## 👨‍🏫 Live Faculty Evaluation Guide (`/demo`)
Navigate to the **Faculty Live Demo** tab (`http://localhost:3000/demo`) for a 4-step demonstration:

1. **Step A (INSERT):**
   - Click "Insert Demo Student".
   - Generates and inserts `Demonstration Student` (`Student_ID = 31`).
   - Verifies HTTP 201 Created and increments live student count to 31.
2. **Step B (VIEW):**
   - Fetches record #31 live from MySQL using `SELECT * FROM STUDENT WHERE Student_ID = 31`.
   - Confirms the record is physically present in the database.
3. **Step C (DELETE):**
   - Deletes record #31 using `DELETE FROM STUDENT WHERE Student_ID = 31`.
   - Succeeds because record #31 has no foreign key dependencies. Student count returns to 30.
4. **Step D (REFERENTIAL INTEGRITY RESTRICT):**
   - Attempts to delete seeded student `Aarav Sharma` (`Student_ID = 1`).
   - MySQL rejects the deletion with error code `ER_ROW_IS_REFERENCED_2` (Error 1451).
   - Backend returns HTTP 409 Conflict. The UI displays an informative alert explaining child dependencies in `ENROLLMENT`, `PROGRESS`, and `RESULT`.

---

## 📸 Screenshots & Visual Evidence

| Screen | Description | File Link |
| :--- | :--- | :--- |
| **Dashboard Analytics** | Live KPI counters, Recharts distributions, recent activity feed | [01_dashboard_analytics.png](./screenshots/01_dashboard_analytics.png) |
| **Students Directory** | Search, filter, pagination, details drawer, modal CRUD | [02_students_directory.png](./screenshots/02_students_directory.png) |
| **Query 1 (Year 1)** | 14 first-year students execution result matrix | [03_query_lab_query1_year1.png](./screenshots/03_query_lab_query1_year1.png) |
| **Query 2 (Alan Turing)** | Dr. Alan Turing 2 courses execution result | [04_query_lab_query2_alan_turing.png](./screenshots/04_query_lab_query2_alan_turing.png) |
| **Database Overview** | Live table row counters, data dictionary, schema diagram | [05_database_overview_schema.png](./screenshots/05_database_overview_schema.png) |
| **Faculty Demo Step A** | Insertion modal and success confirmation | [06_demo_step_a_form.png](./screenshots/06_demo_step_a_form.png), [07_demo_step_a_inserted.png](./screenshots/07_demo_step_a_inserted.png) |
| **Faculty Demo Step B** | Direct database query of newly inserted record | [08_demo_step_b_queried.png](./screenshots/08_demo_step_b_queried.png) |
| **Faculty Demo Step C** | Safe deletion of unreferenced record | [09_demo_step_c_deleted.png](./screenshots/09_demo_step_c_deleted.png) |
| **Faculty Demo Step D** | Foreign-key conflict modal protecting referential integrity | [10_demo_step_d_fk_conflict.png](./screenshots/10_demo_step_d_fk_conflict.png) |
| **Assessment Results (3NF)** | Normalized table eliminating transitive attributes (`Type`, `Module`) | [11_assessment_results_3nf.png](./screenshots/11_assessment_results_3nf.png) |
| **Assessment Results (Grouped)** | Normalized grouped view eliminating redundant student tuples | [12_assessment_results_normalized_grouped.png](./screenshots/12_assessment_results_normalized_grouped.png) |
| **Learning Progress (3NF)** | Normalized table removing transitive Course and derived Status | [13_learning_progress_3nf.png](./screenshots/13_learning_progress_3nf.png) |
| **Learning Progress (Grouped)**| Normalized grouped view eliminating repeated student tuples | [14_learning_progress_normalized_grouped.png](./screenshots/14_learning_progress_normalized_grouped.png) |
| **Students Directory (CRUD)** | Prominent Add and high-visibility red Delete buttons | [15_students_page_visible_crud.png](./screenshots/15_students_page_visible_crud.png) |
| **Full Session Video** | Interactive recording of entire web application | [ui_system_demo.webp](./screenshots/ui_system_demo.webp) |

---

## 🛡️ License & Academic Integrity
Developed by Siddhant Agarwal (`25WU0102262`, AIML Whales) & Manthena Naga Sri Rohan (`25WU0102151`, AIML Panthers) for the B.Tech 2nd-year Database Management Systems course. All demo data is entirely fictional.
