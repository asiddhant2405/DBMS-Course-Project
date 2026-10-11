# Presentation II: Schema Architecture, Normalization & Relational Mapping
## Online Course Learning Progress Management System

**Course:** B.Tech 2nd Year — Database Management Systems (DBMS) Lab Project  
**Team Members:**
- **Siddhant Agarwal** | Roll No: `25WU0102262` | Section: `AIML Whales`
- **Manthena Naga Sri Rohan** | Roll No: `25WU0102151` | Section: `AIML Panthers`

---

### 1. Relational Schema Architecture

The relational database `learningprogressdb` consists of eight fully normalized tables implemented under MySQL 9.7 with InnoDB storage engine ensuring ACID compliance and foreign-key enforcement.

```
STUDENT(Student_ID [PK], Name, Email, Department, Year)
INSTRUCTOR(Instructor_ID [PK], Name, Email, Department)
COURSE(Course_ID [PK], Course_Name, Category, Instructor_ID [FK])
MODULE(Module_ID [PK], Course_ID [FK], Module_Name, Duration_Hours, Sequence_Order)
ASSESSMENT(Assessment_ID [PK], Module_ID [FK], Title, Type, Max_Marks)
ENROLLMENT(Enrollment_ID [PK], Student_ID [FK], Course_ID [FK], Enrollment_Date)
PROGRESS(Progress_ID [PK], Student_ID [FK], Module_ID [FK], Status, Completion_Percentage, Last_Accessed)
RESULT(Result_ID [PK], Student_ID [FK], Assessment_ID [FK], Score, Attempt_Date)
```

---

### 2. Functional Dependencies (FDs) & Normalization Proofs

#### A. Functional Dependencies Identified

1. **`STUDENT`**:
   - `Student_ID -> {Name, Email, Department, Year}`
   - `Email -> {Student_ID, Name, Department, Year}` (Alternate Key)
   - *Primary Key:* `Student_ID`

2. **`INSTRUCTOR`**:
   - `Instructor_ID -> {Name, Email, Department}`
   - `Email -> {Instructor_ID, Name, Department}` (Alternate Key)
   - *Primary Key:* `Instructor_ID`

3. **`COURSE`**:
   - `Course_ID -> {Course_Name, Category, Instructor_ID}`
   - *Primary Key:* `Course_ID`

4. **`MODULE`**:
   - `Module_ID -> {Course_ID, Module_Name, Duration_Hours, Sequence_Order}`
   - `{Course_ID, Sequence_Order} -> Module_ID` (Candidate Key)
   - *Primary Key:* `Module_ID`

5. **`ASSESSMENT`**:
   - `Assessment_ID -> {Module_ID, Title, Type, Max_Marks}`
   - *Primary Key:* `Assessment_ID`

6. **`ENROLLMENT`**:
   - `Enrollment_ID -> {Student_ID, Course_ID, Enrollment_Date}`
   - `{Student_ID, Course_ID} -> {Enrollment_ID, Enrollment_Date}` (Unique Constraint)
   - *Primary Key:* `Enrollment_ID`

7. **`PROGRESS`**:
   - `Progress_ID -> {Student_ID, Module_ID, Status, Completion_Percentage, Last_Accessed}`
   - `{Student_ID, Module_ID} -> {Progress_ID, Status, Completion_Percentage, Last_Accessed}` (Unique Constraint)
   - *Primary Key:* `Progress_ID`

8. **`RESULT`**:
   - `Result_ID -> {Student_ID, Assessment_ID, Score, Attempt_Date}`
   - `{Student_ID, Assessment_ID} -> {Result_ID, Score, Attempt_Date}` (Unique Constraint)
   - *Primary Key:* `Result_ID`

---

#### B. Normal Form Evaluations

1. **First Normal Form (1NF)**:
   - **Criterion:** All attribute domains contain only atomic (indivisible) values. No multi-valued attributes or repeating groups exist.
   - **Proof:** Every column in all 8 tables stores a single scalar value (e.g., individual `Name`, single `Email`, discrete `Score`). Repeating course enrollments or assessment attempts are resolved into separate tuples in associative tables (`ENROLLMENT`, `RESULT`). Hence, the schema satisfies **1NF**.

2. **Second Normal Form (2NF)**:
   - **Criterion:** Schema is in 1NF and no non-prime attribute is partially dependent on any candidate key (no partial functional dependency).
   - **Proof:** In all eight tables, surrogate single-attribute primary keys (`Student_ID`, `Course_ID`, `Enrollment_ID`, etc.) are established. For compound candidate keys (e.g., `{Student_ID, Course_ID}` in `ENROLLMENT`), all non-key attributes (`Enrollment_Date`) depend on the whole composite key, not a proper subset. Thus, there are zero partial dependencies. Hence, the schema satisfies **2NF**.

3. **Third Normal Form (3NF)**:
   - **Criterion:** Schema is in 2NF and no non-prime attribute is transitively dependent on the primary key ($X \rightarrow Y$ and $Y \rightarrow Z$).
   - **Proof:** In every functional dependency $X \rightarrow Y$ in our schema, either $X$ is a superkey, or $Y$ is a prime attribute. For example, `Instructor_Name` is not stored in `COURSE`; only `Instructor_ID` is referenced. Similarly, `Course_Name` is not duplicated in `MODULE`, and `Module_Name` is not stored in `ASSESSMENT`. No transitive dependencies exist across non-key attributes. Hence, the schema satisfies **3NF**.

4. **Boyce-Codd Normal Form (BCNF)**:
   - **Criterion:** For every non-trivial functional dependency $X \rightarrow Y$, the determinant $X$ must be a superkey.
   - **Proof:** Reviewing all identified non-trivial dependencies across the eight entities:
     - In `STUDENT`: `Student_ID` is a superkey; `Email` is an alternate superkey.
     - In `INSTRUCTOR`: `Instructor_ID` is a superkey; `Email` is an alternate superkey.
     - In `COURSE`: `Course_ID` is a superkey.
     - In `MODULE`: `Module_ID` and `{Course_ID, Sequence_Order}` are both superkeys.
     - In `ASSESSMENT`: `Assessment_ID` is a superkey.
     - In `ENROLLMENT`: `Enrollment_ID` and `{Student_ID, Course_ID}` are superkeys.
     - In `PROGRESS`: `Progress_ID` and `{Student_ID, Module_ID}` are superkeys.
     - In `RESULT`: `Result_ID` and `{Student_ID, Assessment_ID}` are superkeys.
     - Every determinant in the entire schema is a superkey. Therefore, the schema is strictly in **BCNF**.

---

### 3. Referential Integrity & Foreign Key Policies

| Foreign Key Constraint | Parent Table | Child Table | Action on Delete | Action on Update | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fk_course_instructor` | `INSTRUCTOR` | `COURSE` | `RESTRICT` | `CASCADE` | Prevents removing faculty currently assigned to courses. |
| `fk_module_course` | `COURSE` | `MODULE` | `RESTRICT` | `CASCADE` | Preserves modules and syllabus when a course is referenced. |
| `fk_assessment_module` | `MODULE` | `ASSESSMENT` | `RESTRICT` | `CASCADE` | Prevents orphan assessments without a parent module. |
| `fk_enrollment_student` | `STUDENT` | `ENROLLMENT` | `RESTRICT` | `CASCADE` | Protects student academic history from unintended deletion. |
| `fk_enrollment_course` | `COURSE` | `ENROLLMENT` | `RESTRICT` | `CASCADE` | Prevents deleting courses with registered students. |
| `fk_progress_student` | `STUDENT` | `PROGRESS` | `RESTRICT` | `CASCADE` | Preserves learning progress analytics. |
| `fk_progress_module` | `MODULE` | `PROGRESS` | `RESTRICT` | `CASCADE` | Prevents deleting modules with active student progress. |
| `fk_result_student` | `STUDENT` | `RESULT` | `RESTRICT` | `CASCADE` | Protects grade audit trail and assessment scores. |
| `fk_result_assessment` | `ASSESSMENT` | `RESULT` | `RESTRICT` | `CASCADE` | Prevents deleting evaluated assessments. |

---

### 4. Database Scripts in this Directory

1. [`schema.sql`](./schema.sql):
   - Drops tables in safe child-to-parent order if existing.
   - Creates database `learningprogressdb` and all eight tables.
   - Enforces `PRIMARY KEY`, `FOREIGN KEY ... ON DELETE RESTRICT`, `UNIQUE`, `CHECK` constraints (e.g., `Completion_Percentage BETWEEN 0 AND 100`, `Score >= 0`, `Year IN (1, 2, 3, 4)`).

2. [`seed.sql`](./seed.sql):
   - Deterministic seed script populating:
     - Exactly **30 Students** (14 in Year 1, 10 in Year 2, 6 in Year 3) across Computer Science, Information Technology, and Electronics.
     - **3 Instructors** (including `Dr. Alan Turing`, `Dr. Ada Lovelace`, `Dr. CV Raman`).
     - **4 Courses** (including `Intro to Python` and `Database Systems` taught by Dr. Alan Turing).
     - **8 Modules** across all 4 courses.
     - **8 Assessments** (Quizzes, Coding Assignments, Final Exams).
     - **30 Enrollments** across diverse student-course combinations.
     - **60 Progress Records** reflecting realistic completion distribution.
     - **60 Assessment Results** with valid scores.

3. [`verification.sql`](./verification.sql):
   - Automated test suite validating:
     - Exact student count = 30.
     - Year 1 student count = 14.
     - Courses taught by Dr. Alan Turing = 2.
     - Table row counts for all eight entities.
     - Zero orphan foreign key records across all tables.

4. Reference Slide Deck:
   - [`Presentation-II_Online_Course_Learning_Progress.pdf`](./Presentation-II_Online_Course_Learning_Progress.pdf)
