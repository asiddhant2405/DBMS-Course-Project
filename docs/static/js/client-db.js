// Client-Side Relational Database Engine for GitHub Pages & Local Static Deployments
// Online Course Learning Progress Management System
// Developed by Siddhant Agarwal (25WU0102262)

class RelationalDatabase {
    constructor() {
        this.storageKey = 'OnlineLearningSystem_DB_v1';
        this.init();
    }

    init() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.db = JSON.parse(stored);
            } catch (e) {
                console.warn('Corrupted local DB, resetting to initial seed.', e);
                this.reset();
            }
        } else {
            this.reset();
        }
    }

    reset() {
        if (typeof INITIAL_DB_SEED !== 'undefined') {
            this.db = JSON.parse(JSON.stringify(INITIAL_DB_SEED));
            this.save();
        } else {
            console.error('INITIAL_DB_SEED not found!');
            this.db = {
                INSTRUCTOR: [],
                STUDENT: [],
                COURSE: [],
                MODULE: [],
                ASSESSMENT: [],
                ENROLLMENT: [],
                PROGRESS: [],
                RESULT: []
            };
        }
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.db));
        } catch (e) {
            console.error('Failed to persist to localStorage:', e);
        }
    }

    // Get all students with computed metrics
    getStudents() {
        const students = [...(this.db.STUDENT || [])];
        const enrollments = this.db.ENROLLMENT || [];
        const progress = this.db.PROGRESS || [];
        const results = this.db.RESULT || [];

        return students.map(s => {
            const sEnroll = enrollments.filter(e => e.Student_ID === s.Student_ID);
            const sProg = progress.filter(p => p.Student_ID === s.Student_ID);
            const sRes = results.filter(r => r.Student_ID === s.Student_ID);

            let avgProg = 0;
            if (sProg.length > 0) {
                const total = sProg.reduce((acc, curr) => acc + (parseFloat(curr.Completion_Percent) || 0), 0);
                avgProg = Math.round((total / sProg.length) * 10) / 10;
            }

            return {
                ...s,
                Enrolled_Count: sEnroll.length,
                Avg_Progress: avgProg,
                Result_Count: sRes.length
            };
        }).sort((a, b) => b.Student_ID - a.Student_ID);
    }

    // Get courses joined with instructor
    getCourses() {
        const courses = this.db.COURSE || [];
        const instructors = this.db.INSTRUCTOR || [];
        const modules = this.db.MODULE || [];
        const enrollments = this.db.ENROLLMENT || [];

        return courses.map(c => {
            const inst = instructors.find(i => i.Instructor_ID === c.Instructor_ID) || {};
            const courseMods = modules.filter(m => m.Course_ID === c.Course_ID);
            const courseEnrolls = enrollments.filter(e => e.Course_ID === c.Course_ID);

            return {
                ...c,
                Instructor_Name: inst.Name || 'Unassigned',
                Instructor_Specialization: inst.Specialization || '',
                Module_Count: courseMods.length,
                Enrolled_Count: courseEnrolls.length
            };
        });
    }

    // Get instructors
    getInstructors() {
        const instructors = this.db.INSTRUCTOR || [];
        const courses = this.db.COURSE || [];

        return instructors.map(i => {
            const iCourses = courses.filter(c => c.Instructor_ID === i.Instructor_ID);
            return {
                ...i,
                Course_Count: iCourses.length
            };
        });
    }

    // Get overall system KPI statistics
    getStats() {
        const students = this.db.STUDENT || [];
        const courses = this.db.COURSE || [];
        const instructors = this.db.INSTRUCTOR || [];
        const enrollments = this.db.ENROLLMENT || [];
        const progress = this.db.PROGRESS || [];

        const activeEnrolls = enrollments.filter(e => e.Status === 'Active').length;

        let avgProg = 0;
        if (progress.length > 0) {
            const total = progress.reduce((acc, curr) => acc + (parseFloat(curr.Completion_Percent) || 0), 0);
            avgProg = Math.round((total / progress.length) * 10) / 10;
        }

        return {
            total_students: students.length,
            total_courses: courses.length,
            total_instructors: instructors.length,
            active_enrollments: activeEnrolls,
            avg_progress: avgProg
        };
    }

    // Add a new student
    addStudent({ name, email, department, year, phone, course_id }) {
        name = (name || '').trim();
        email = (email || '').trim().toLowerCase();
        department = (department || '').trim();
        phone = (phone || '').trim();
        year = parseInt(year) || 1;

        if (!name || !email || !department || !phone) {
            throw new Error('All required fields must be filled.');
        }

        // Email uniqueness check
        const existing = (this.db.STUDENT || []).find(s => s.Email.toLowerCase() === email);
        if (existing) {
            throw new Error(`A student with email '${email}' already exists.`);
        }

        // Generate ID = MAX(Student_ID) + 1
        const maxId = (this.db.STUDENT || []).reduce((max, s) => Math.max(max, s.Student_ID || 0), 0);
        const nextId = maxId + 1;

        const newStudent = {
            Student_ID: nextId,
            Name: name,
            Email: email,
            Department: department,
            Year: year,
            Phone: phone
        };

        this.db.STUDENT.push(newStudent);

        // Optional Course Auto-enrollment
        if (course_id) {
            const cId = parseInt(course_id);
            const course = (this.db.COURSE || []).find(c => c.Course_ID === cId);
            if (course) {
                const maxEnrollId = (this.db.ENROLLMENT || []).reduce((max, e) => Math.max(max, e.Enrollment_ID || 0), 0);
                const today = new Date().toISOString().split('T')[0];

                this.db.ENROLLMENT.push({
                    Enrollment_ID: maxEnrollId + 1,
                    Enroll_Date: today,
                    Status: 'Active',
                    Completion_Date: null,
                    Student_ID: nextId,
                    Course_ID: cId
                });

                // Find first module of this course
                const firstModule = (this.db.MODULE || [])
                    .filter(m => m.Course_ID === cId)
                    .sort((a, b) => a.Sequence_No - b.Sequence_No)[0];

                if (firstModule) {
                    const maxProgId = (this.db.PROGRESS || []).reduce((max, p) => Math.max(max, p.Progress_ID || 0), 0);
                    this.db.PROGRESS.push({
                        Progress_ID: maxProgId + 1,
                        Progress_Date: today,
                        Completion_Percent: 0.00,
                        Status: 'In Progress',
                        Time_Spent: 0,
                        Student_ID: nextId,
                        Module_ID: firstModule.Module_ID
                    });
                }
            }
        }

        this.save();
        return newStudent;
    }

    // Delete student with ON DELETE CASCADE
    deleteStudent(student_id) {
        const sId = parseInt(student_id);
        const studentIndex = (this.db.STUDENT || []).findIndex(s => s.Student_ID === sId);
        if (studentIndex === -1) {
            throw new Error(`Student #${sId} not found.`);
        }

        const studentName = this.db.STUDENT[studentIndex].Name;

        // Cascade delete
        this.db.STUDENT.splice(studentIndex, 1);
        this.db.ENROLLMENT = (this.db.ENROLLMENT || []).filter(e => e.Student_ID !== sId);
        this.db.PROGRESS = (this.db.PROGRESS || []).filter(p => p.Student_ID !== sId);
        this.db.RESULT = (this.db.RESULT || []).filter(r => r.Student_ID !== sId);

        this.save();

        const stats = this.getStats();
        return {
            success: true,
            student_id: sId,
            student_name: studentName,
            total_students: stats.total_students,
            avg_progress: stats.avg_progress,
            message: `Student '${studentName}' (ID: #${sId}) was successfully deleted.`
        };
    }

    // Get detailed student profile for modal
    getStudentDetails(student_id) {
        const sId = parseInt(student_id);
        const student = (this.db.STUDENT || []).find(s => s.Student_ID === sId);
        if (!student) {
            throw new Error(`Student #${sId} not found.`);
        }

        const enrollments = (this.db.ENROLLMENT || [])
            .filter(e => e.Student_ID === sId)
            .map(e => {
                const c = (this.db.COURSE || []).find(crs => crs.Course_ID === e.Course_ID) || {};
                const inst = (this.db.INSTRUCTOR || []).find(i => i.Instructor_ID === c.Instructor_ID) || {};
                return {
                    Enrollment_ID: e.Enrollment_ID,
                    Enroll_Date: e.Enroll_Date,
                    Enrollment_Status: e.Status,
                    Completion_Date: e.Completion_Date,
                    Course_ID: c.Course_ID,
                    Course_Name: c.Course_Name || 'Unknown Course',
                    Course_Description: c.Description || '',
                    Course_Duration: c.Duration,
                    Course_Category: c.Category || '',
                    Course_Level: c.Level || '',
                    Instructor_ID: inst.Instructor_ID,
                    Instructor_Name: inst.Name || 'Unassigned',
                    Instructor_Email: inst.Email || '',
                    Instructor_Specialization: inst.Specialization || '',
                    Instructor_Phone: inst.Phone || ''
                };
            });

        const progress = (this.db.PROGRESS || [])
            .filter(p => p.Student_ID === sId)
            .map(p => {
                const m = (this.db.MODULE || []).find(mod => mod.Module_ID === p.Module_ID) || {};
                const c = (this.db.COURSE || []).find(crs => crs.Course_ID === m.Course_ID) || {};
                return {
                    Progress_ID: p.Progress_ID,
                    Progress_Date: p.Progress_Date,
                    Completion_Percent: parseFloat(p.Completion_Percent) || 0,
                    Progress_Status: p.Status,
                    Time_Spent: p.Time_Spent || 0,
                    Module_ID: m.Module_ID,
                    Module_Name: m.Module_Name || 'Module',
                    Module_Description: m.Description || '',
                    Sequence_No: m.Sequence_No || 1,
                    Course_ID: c.Course_ID,
                    Course_Name: c.Course_Name || 'Course'
                };
            })
            .sort((a, b) => a.Sequence_No - b.Sequence_No);

        const results = (this.db.RESULT || [])
            .filter(r => r.Student_ID === sId)
            .map(r => {
                const a = (this.db.ASSESSMENT || []).find(asm => asm.Assessment_ID === r.Assessment_ID) || {};
                const m = (this.db.MODULE || []).find(mod => mod.Module_ID === a.Module_ID) || {};
                const c = (this.db.COURSE || []).find(crs => crs.Course_ID === m.Course_ID) || {};

                const score = parseFloat(r.Score) || 0;
                const maxMarks = parseFloat(a.Max_Marks) || 100;
                const percentage = Math.round((score / maxMarks) * 1000) / 10;
                const grade = percentage >= 50.0 ? 'Pass' : 'Fail';

                return {
                    Result_ID: r.Result_ID,
                    Score: score,
                    Attempt_No: r.Attempt_No || 1,
                    Result_Date: r.Result_Date,
                    Assessment_ID: a.Assessment_ID,
                    Assessment_Name: a.Assessment_Name || 'Assessment',
                    Assessment_Type: a.Assessment_Type || 'Quiz',
                    Max_Marks: maxMarks,
                    Module_Name: m.Module_Name || '',
                    Course_Name: c.Course_Name || '',
                    Percentage: percentage,
                    Performance_Grade: grade
                };
            })
            .sort((a, b) => new Date(b.Result_Date || 0) - new Date(a.Result_Date || 0));

        // Summary Analytics
        const totalTimeMins = progress.reduce((acc, curr) => acc + (curr.Time_Spent || 0), 0);
        const avgCompletion = progress.length > 0
            ? Math.round((progress.reduce((acc, curr) => acc + curr.Completion_Percent, 0) / progress.length) * 10) / 10
            : 0.0;
        const avgScorePct = results.length > 0
            ? Math.round((results.reduce((acc, curr) => acc + curr.Percentage, 0) / results.length) * 10) / 10
            : 0.0;
        const completedMods = progress.filter(p => p.Completion_Percent >= 100 || p.Progress_Status === 'Completed').length;

        const summary = {
            total_courses: enrollments.length,
            total_modules: progress.length,
            completed_modules: completedMods,
            total_time_spent_mins: totalTimeMins,
            total_time_spent_hrs: Math.round((totalTimeMins / 60) * 10) / 10,
            avg_completion_percent: avgCompletion,
            avg_score_percent: avgScorePct,
            total_assessments_taken: results.length
        };

        return {
            student,
            enrollments,
            progress,
            results,
            summary
        };
    }

    // Export current database to SQL file
    exportSql() {
        let sql = `-- Online Course Learning Progress Management System\n-- SQL Dump Export\n-- Generated on: ${new Date().toISOString()}\n-- Developed by: Siddhant Agarwal (25WU0102262)\n\n`;
        sql += `CREATE DATABASE IF NOT EXISTS OnlineLearningSystem;\nUSE OnlineLearningSystem;\n\n`;

        // Instructors
        sql += `-- INSTRUCTOR\n`;
        (this.db.INSTRUCTOR || []).forEach(i => {
            sql += `INSERT INTO INSTRUCTOR (Instructor_ID, Name, Email, Specialization, Phone) VALUES (${i.Instructor_ID}, '${i.Name}', '${i.Email}', '${i.Specialization}', '${i.Phone}');\n`;
        });
        sql += `\n-- STUDENT\n`;
        (this.db.STUDENT || []).forEach(s => {
            sql += `INSERT INTO STUDENT (Student_ID, Name, Email, Department, Year, Phone) VALUES (${s.Student_ID}, '${s.Name}', '${s.Email}', '${s.Department}', ${s.Year}, '${s.Phone}');\n`;
        });
        sql += `\n-- COURSE\n`;
        (this.db.COURSE || []).forEach(c => {
            sql += `INSERT INTO COURSE (Course_ID, Course_Name, Description, Duration, Category, Level, Instructor_ID) VALUES (${c.Course_ID}, '${c.Course_Name}', '${c.Description.replace(/'/g, "''")}', ${c.Duration}, '${c.Category}', '${c.Level}', ${c.Instructor_ID});\n`;
        });

        return sql;
    }
}

// Global Singleton Instance
window.clientDB = new RelationalDatabase();
