import initialSeed from './dbSeed.json';

const STORAGE_KEY = 'DBMS_ONLINE_LEARNING_SYSTEM_V2';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class LocalRelationalStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial seed', e);
    }
    const fresh = clone(initialSeed);
    this.saveData(fresh);
    return fresh;
  }

  saveData(dataToSave) {
    this.data = dataToSave || this.data;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  reset() {
    const fresh = clone(initialSeed);
    this.saveData(fresh);
    return { success: true, message: 'Database reset to initial seed state successfully.' };
  }

  // Dashboard Metrics
  getDashboard() {
    const d = this.data;
    const students = d.STUDENT || [];
    const instructors = d.INSTRUCTOR || [];
    const courses = d.COURSE || [];
    const modules = d.MODULE || [];
    const assessments = d.ASSESSMENT || [];
    const enrollments = d.ENROLLMENT || [];
    const progress = d.PROGRESS || [];
    const results = d.RESULT || [];

    const totalTracked = progress.length;
    const completedCount = progress.filter(p => p.Status === 'Completed').length;
    const inProgressCount = progress.filter(p => p.Status === 'In Progress').length;
    const notStartedCount = progress.filter(p => p.Status === 'Not Started').length;
    
    const sumPercent = progress.reduce((acc, p) => acc + (parseFloat(p.Completion_Percent) || 0), 0);
    const avgPercent = totalTracked > 0 ? Math.round((sumPercent / totalTracked) * 10) / 10 : 0;
    const completionRate = totalTracked > 0 ? Math.round((completedCount * 100 / totalTracked) * 10) / 10 : 0;

    // Dept distribution
    const deptCounts = {};
    students.forEach(s => {
      deptCounts[s.Department] = (deptCounts[s.Department] || 0) + 1;
    });
    const deptDistribution = Object.entries(deptCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Year distribution
    const yearCounts = {};
    students.forEach(s => {
      yearCounts[s.Year] = (yearCounts[s.Year] || 0) + 1;
    });
    const yearDistribution = Object.entries(yearCounts)
      .map(([yr, count]) => ({ name: `Year ${yr}`, yearNum: parseInt(yr, 10), count }))
      .sort((a, b) => a.yearNum - b.yearNum);

    // Course progress
    const courseProgress = courses.map(c => {
      const cEnrolls = enrollments.filter(e => e.Course_ID === c.Course_ID);
      const studentIds = new Set(cEnrolls.map(e => e.Student_ID));
      const cModules = modules.filter(m => m.Course_ID === c.Course_ID);
      const cModuleIds = new Set(cModules.map(m => m.Module_ID));
      
      const cProgs = progress.filter(p => cModuleIds.has(p.Module_ID) && studentIds.has(p.Student_ID));
      const avgP = cProgs.length > 0
        ? Math.round((cProgs.reduce((acc, p) => acc + (parseFloat(p.Completion_Percent) || 0), 0) / cProgs.length) * 10) / 10
        : 0;

      return {
        Course_ID: c.Course_ID,
        Course_Name: c.Course_Name,
        Category: c.Category,
        enrolledCount: studentIds.size,
        avgProgress: avgP
      };
    }).sort((a, b) => b.enrolledCount - a.enrolledCount);

    // Recent enrollments
    const recentEnrollments = [...enrollments]
      .sort((a, b) => b.Enrollment_ID - a.Enrollment_ID)
      .slice(0, 5)
      .map(e => {
        const s = students.find(st => st.Student_ID === e.Student_ID) || {};
        const c = courses.find(cr => cr.Course_ID === e.Course_ID) || {};
        return {
          Enrollment_ID: e.Enrollment_ID,
          Enroll_Date: e.Enroll_Date,
          Status: e.Status,
          Student_Name: s.Name || `Student #${e.Student_ID}`,
          Course_Name: c.Course_Name || `Course #${e.Course_ID}`
        };
      });

    // Recent results
    const recentResults = [...results]
      .filter(r => r.Score !== null && r.Score !== undefined)
      .sort((a, b) => b.Result_ID - a.Result_ID)
      .slice(0, 5)
      .map(r => {
        const s = students.find(st => st.Student_ID === r.Student_ID) || {};
        const a = assessments.find(asm => asm.Assessment_ID === r.Assessment_ID) || {};
        return {
          Result_ID: r.Result_ID,
          Score: r.Score,
          Attempt_No: r.Attempt_No,
          Result_Date: r.Result_Date,
          Student_Name: s.Name || `Student #${r.Student_ID}`,
          Assessment_Name: a.Assessment_Name || `Assessment #${r.Assessment_ID}`,
          Max_Marks: a.Max_Marks || 100
        };
      });

    return {
      success: true,
      data: {
        summary: {
          totalStudents: students.length,
          totalInstructors: instructors.length,
          totalCourses: courses.length,
          totalModules: modules.length,
          totalAssessments: assessments.length,
          totalEnrollments: enrollments.length,
          totalProgress: progress.length,
          totalResults: results.length,
          overallCompletionRate: completionRate,
          avgCompletionPercent: avgPercent,
          completedModulesCount: completedCount,
          inProgressModulesCount: inProgressCount
        },
        deptDistribution,
        yearDistribution,
        courseProgress,
        recentEnrollments,
        recentResults
      }
    };
  }

  // STUDENTS
  getStudents(params = {}) {
    let list = [...(this.data.STUDENT || [])];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(s =>
        (s.Name && s.Name.toLowerCase().includes(q)) ||
        (s.Email && s.Email.toLowerCase().includes(q)) ||
        String(s.Student_ID).includes(q)
      );
    }
    if (params.department && params.department !== 'All') {
      list = list.filter(s => s.Department === params.department);
    }
    if (params.year && params.year !== 'All') {
      list = list.filter(s => String(s.Year) === String(params.year));
    }

    return {
      success: true,
      count: list.length,
      data: list.sort((a, b) => a.Student_ID - b.Student_ID)
    };
  }

  getStudentById(id) {
    const sId = parseInt(id, 10);
    const student = (this.data.STUDENT || []).find(s => s.Student_ID === sId);
    if (!student) {
      const err = new Error(`Student with ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    const enrollments = (this.data.ENROLLMENT || [])
      .filter(e => e.Student_ID === sId)
      .map(e => {
        const c = (this.data.COURSE || []).find(cr => cr.Course_ID === e.Course_ID) || {};
        return {
          Enrollment_ID: e.Enrollment_ID,
          Enroll_Date: e.Enroll_Date,
          Status: e.Status,
          Completion_Date: e.Completion_Date,
          Course_ID: c.Course_ID,
          Course_Name: c.Course_Name,
          Category: c.Category,
          Level: c.Level
        };
      });

    const progress = (this.data.PROGRESS || [])
      .filter(p => p.Student_ID === sId)
      .map(p => {
        const m = (this.data.MODULE || []).find(md => md.Module_ID === p.Module_ID) || {};
        const c = (this.data.COURSE || []).find(cr => cr.Course_ID === m.Course_ID) || {};
        return {
          Progress_ID: p.Progress_ID,
          Progress_Date: p.Progress_Date,
          Completion_Percent: p.Completion_Percent,
          Status: p.Status,
          Time_Spent: p.Time_Spent,
          Module_ID: m.Module_ID,
          Module_Name: m.Module_Name,
          Sequence_No: m.Sequence_No,
          Course_Name: c.Course_Name
        };
      });

    const results = (this.data.RESULT || [])
      .filter(r => r.Student_ID === sId)
      .map(r => {
        const a = (this.data.ASSESSMENT || []).find(asm => asm.Assessment_ID === r.Assessment_ID) || {};
        return {
          Result_ID: r.Result_ID,
          Score: r.Score,
          Attempt_No: r.Attempt_No,
          Result_Date: r.Result_Date,
          Assessment_ID: a.Assessment_ID,
          Assessment_Name: a.Assessment_Name,
          Assessment_Type: a.Assessment_Type,
          Max_Marks: a.Max_Marks
        };
      });

    return {
      success: true,
      data: {
        ...student,
        enrollments,
        progress,
        results
      }
    };
  }

  createStudent(body) {
    const { Name, Email, Department, Year, Phone } = body;
    if (!Name || !Email || !Department || !Year) {
      const err = new Error('Name, Email, Department, and Year are required fields.');
      err.status = 400;
      throw err;
    }
    const maxId = (this.data.STUDENT || []).reduce((max, s) => Math.max(max, s.Student_ID || 0), 0);
    const newStudent = {
      Student_ID: maxId + 1,
      Name: Name.trim(),
      Email: Email.trim().toLowerCase(),
      Department: Department.trim(),
      Year: parseInt(Year, 10),
      Phone: Phone ? Phone.trim() : null
    };

    this.data.STUDENT.push(newStudent);
    this.saveData();

    return {
      success: true,
      message: 'Student record created successfully in database.',
      data: newStudent
    };
  }

  updateStudent(id, body) {
    const sId = parseInt(id, 10);
    const idx = (this.data.STUDENT || []).findIndex(s => s.Student_ID === sId);
    if (idx === -1) {
      const err = new Error(`Student with ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    const { Name, Email, Department, Year, Phone } = body;
    this.data.STUDENT[idx] = {
      ...this.data.STUDENT[idx],
      Name: Name ? Name.trim() : this.data.STUDENT[idx].Name,
      Email: Email ? Email.trim().toLowerCase() : this.data.STUDENT[idx].Email,
      Department: Department ? Department.trim() : this.data.STUDENT[idx].Department,
      Year: Year !== undefined ? parseInt(Year, 10) : this.data.STUDENT[idx].Year,
      Phone: Phone !== undefined ? (Phone ? Phone.trim() : null) : this.data.STUDENT[idx].Phone
    };

    this.saveData();
    return {
      success: true,
      message: 'Student record updated successfully.',
      data: this.data.STUDENT[idx]
    };
  }

  checkStudentDependencies(id) {
    const sId = parseInt(id, 10);
    const enrollments = (this.data.ENROLLMENT || []).filter(e => e.Student_ID === sId).length;
    const progress = (this.data.PROGRESS || []).filter(p => p.Student_ID === sId).length;
    const results = (this.data.RESULT || []).filter(r => r.Student_ID === sId).length;
    const total = enrollments + progress + results;

    return {
      success: true,
      hasDependencies: total > 0,
      counts: { enrollments, progress, results, total }
    };
  }

  deleteStudent(id, cascade = true) {
    const sId = parseInt(id, 10);
    const idx = (this.data.STUDENT || []).findIndex(s => s.Student_ID === sId);
    if (idx === -1) {
      const err = new Error(`Student with ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    const deleted = this.data.STUDENT[idx];
    this.data.STUDENT.splice(idx, 1);

    if (cascade) {
      this.data.ENROLLMENT = (this.data.ENROLLMENT || []).filter(e => e.Student_ID !== sId);
      this.data.PROGRESS = (this.data.PROGRESS || []).filter(p => p.Student_ID !== sId);
      this.data.RESULT = (this.data.RESULT || []).filter(r => r.Student_ID !== sId);
    }

    this.saveData();
    return {
      success: true,
      message: `Student '${deleted.Name}' (ID: #${sId}) and all associated records deleted successfully.`
    };
  }

  // INSTRUCTORS
  getInstructors(params = {}) {
    let list = [...(this.data.INSTRUCTOR || [])];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(i =>
        (i.Name && i.Name.toLowerCase().includes(q)) ||
        (i.Email && i.Email.toLowerCase().includes(q)) ||
        (i.Specialization && i.Specialization.toLowerCase().includes(q))
      );
    }
    const withCount = list.map(i => {
      const courseCount = (this.data.COURSE || []).filter(c => c.Instructor_ID === i.Instructor_ID).length;
      return { ...i, courseCount };
    });
    return { success: true, count: withCount.length, data: withCount };
  }

  getInstructorById(id) {
    const inst = (this.data.INSTRUCTOR || []).find(i => i.Instructor_ID === parseInt(id, 10));
    if (!inst) throw new Error(`Instructor with ID ${id} not found.`);
    const courses = (this.data.COURSE || []).filter(c => c.Instructor_ID === inst.Instructor_ID);
    return { success: true, data: { ...inst, courses } };
  }

  // COURSES
  getCourses(params = {}) {
    let list = [...(this.data.COURSE || [])];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(c =>
        (c.Course_Name && c.Course_Name.toLowerCase().includes(q)) ||
        (c.Category && c.Category.toLowerCase().includes(q)) ||
        (c.Description && c.Description.toLowerCase().includes(q))
      );
    }
    if (params.category && params.category !== 'All') {
      list = list.filter(c => c.Category === params.category);
    }
    if (params.level && params.level !== 'All') {
      list = list.filter(c => c.Level === params.level);
    }

    const enhanced = list.map(c => {
      const inst = (this.data.INSTRUCTOR || []).find(i => i.Instructor_ID === c.Instructor_ID) || {};
      const modulesCount = (this.data.MODULE || []).filter(m => m.Course_ID === c.Course_ID).length;
      const enrolledCount = (this.data.ENROLLMENT || []).filter(e => e.Course_ID === c.Course_ID).length;
      return {
        ...c,
        Instructor_Name: inst.Name || 'Unassigned',
        Instructor_Email: inst.Email || '',
        modulesCount,
        enrolledCount
      };
    });
    return { success: true, count: enhanced.length, data: enhanced };
  }

  getCourseById(id) {
    const cId = parseInt(id, 10);
    const course = (this.data.COURSE || []).find(c => c.Course_ID === cId);
    if (!course) throw new Error(`Course with ID ${id} not found.`);
    const inst = (this.data.INSTRUCTOR || []).find(i => i.Instructor_ID === course.Instructor_ID) || {};
    const modules = (this.data.MODULE || []).filter(m => m.Course_ID === cId);
    return {
      success: true,
      data: {
        ...course,
        Instructor_Name: inst.Name,
        modules
      }
    };
  }

  // MODULES
  getModules(params = {}) {
    let list = [...(this.data.MODULE || [])];
    if (params.courseId) {
      list = list.filter(m => String(m.Course_ID) === String(params.courseId));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(m =>
        (m.Module_Name && m.Module_Name.toLowerCase().includes(q)) ||
        (m.Description && m.Description.toLowerCase().includes(q))
      );
    }
    const enhanced = list.map(m => {
      const c = (this.data.COURSE || []).find(cr => cr.Course_ID === m.Course_ID) || {};
      const assessmentsCount = (this.data.ASSESSMENT || []).filter(a => a.Module_ID === m.Module_ID).length;
      return {
        ...m,
        Course_Name: c.Course_Name || 'Unknown Course',
        assessmentsCount
      };
    }).sort((a, b) => a.Sequence_No - b.Sequence_No);

    return { success: true, count: enhanced.length, data: enhanced };
  }

  getModuleById(id) {
    const m = (this.data.MODULE || []).find(mod => mod.Module_ID === parseInt(id, 10));
    if (!m) throw new Error(`Module with ID ${id} not found.`);
    return { success: true, data: m };
  }

  // ASSESSMENTS
  getAssessments(params = {}) {
    let list = [...(this.data.ASSESSMENT || [])];
    if (params.moduleId) {
      list = list.filter(a => String(a.Module_ID) === String(params.moduleId));
    }
    if (params.type && params.type !== 'All') {
      list = list.filter(a => a.Assessment_Type === params.type);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(a => a.Assessment_Name && a.Assessment_Name.toLowerCase().includes(q));
    }
    const enhanced = list.map(a => {
      const m = (this.data.MODULE || []).find(mod => mod.Module_ID === a.Module_ID) || {};
      const c = (this.data.COURSE || []).find(cr => cr.Course_ID === m.Course_ID) || {};
      const resultsCount = (this.data.RESULT || []).filter(r => r.Assessment_ID === a.Assessment_ID).length;
      return {
        ...a,
        Module_Name: m.Module_Name || 'Unknown Module',
        Course_Name: c.Course_Name || 'Unknown Course',
        resultsCount
      };
    });
    return { success: true, count: enhanced.length, data: enhanced };
  }

  getAssessmentById(id) {
    const a = (this.data.ASSESSMENT || []).find(asm => asm.Assessment_ID === parseInt(id, 10));
    if (!a) throw new Error(`Assessment with ID ${id} not found.`);
    return { success: true, data: a };
  }

  // ENROLLMENTS
  getEnrollments(params = {}) {
    let list = [...(this.data.ENROLLMENT || [])];
    if (params.studentId) {
      list = list.filter(e => String(e.Student_ID) === String(params.studentId));
    }
    if (params.courseId) {
      list = list.filter(e => String(e.Course_ID) === String(params.courseId));
    }
    if (params.status && params.status !== 'All') {
      list = list.filter(e => e.Status === params.status);
    }
    const enhanced = list.map(e => {
      const s = (this.data.STUDENT || []).find(st => st.Student_ID === e.Student_ID) || {};
      const c = (this.data.COURSE || []).find(cr => cr.Course_ID === e.Course_ID) || {};
      return {
        ...e,
        Student_Name: s.Name || `Student #${e.Student_ID}`,
        Student_Email: s.Email || '',
        Student_Department: s.Department || '',
        Course_Name: c.Course_Name || `Course #${e.Course_ID}`,
        Category: c.Category || '',
        Level: c.Level || ''
      };
    });

    if (params.search) {
      const q = params.search.toLowerCase();
      return {
        success: true,
        count: enhanced.length,
        data: enhanced.filter(e =>
          e.Student_Name.toLowerCase().includes(q) ||
          e.Course_Name.toLowerCase().includes(q)
        )
      };
    }

    return { success: true, count: enhanced.length, data: enhanced };
  }

  getEnrollmentById(id) {
    const e = (this.data.ENROLLMENT || []).find(en => en.Enrollment_ID === parseInt(id, 10));
    if (!e) throw new Error(`Enrollment with ID ${id} not found.`);
    return { success: true, data: e };
  }

  createEnrollment(body) {
    const maxId = (this.data.ENROLLMENT || []).reduce((max, e) => Math.max(max, e.Enrollment_ID || 0), 0);
    const newEnrollment = {
      Enrollment_ID: maxId + 1,
      Enroll_Date: body.Enroll_Date || new Date().toISOString().split('T')[0],
      Status: body.Status || 'Active',
      Completion_Date: body.Completion_Date || null,
      Student_ID: parseInt(body.Student_ID, 10),
      Course_ID: parseInt(body.Course_ID, 10)
    };
    this.data.ENROLLMENT.push(newEnrollment);
    this.saveData();
    return { success: true, message: 'Enrollment registered successfully.', data: newEnrollment };
  }

  deleteEnrollment(id) {
    const idx = (this.data.ENROLLMENT || []).findIndex(e => e.Enrollment_ID === parseInt(id, 10));
    if (idx !== -1) {
      this.data.ENROLLMENT.splice(idx, 1);
      this.saveData();
    }
    return { success: true, message: 'Enrollment deleted.' };
  }

  // PROGRESS
  getProgress(params = {}) {
    let list = [...(this.data.PROGRESS || [])];
    if (params.studentId) {
      list = list.filter(p => String(p.Student_ID) === String(params.studentId));
    }
    if (params.moduleId) {
      list = list.filter(p => String(p.Module_ID) === String(params.moduleId));
    }
    if (params.status && params.status !== 'All') {
      list = list.filter(p => p.Status === params.status);
    }
    const enhanced = list.map(p => {
      const s = (this.data.STUDENT || []).find(st => st.Student_ID === p.Student_ID) || {};
      const m = (this.data.MODULE || []).find(md => md.Module_ID === p.Module_ID) || {};
      const c = (this.data.COURSE || []).find(cr => cr.Course_ID === m.Course_ID) || {};
      return {
        ...p,
        Student_Name: s.Name || `Student #${p.Student_ID}`,
        Module_Name: m.Module_Name || `Module #${p.Module_ID}`,
        Sequence_No: m.Sequence_No || 1,
        Course_Name: c.Course_Name || 'Unknown Course'
      };
    });

    if (params.search) {
      const q = params.search.toLowerCase();
      return {
        success: true,
        count: enhanced.length,
        data: enhanced.filter(p =>
          p.Student_Name.toLowerCase().includes(q) ||
          p.Module_Name.toLowerCase().includes(q) ||
          p.Course_Name.toLowerCase().includes(q)
        )
      };
    }

    return { success: true, count: enhanced.length, data: enhanced };
  }

  getProgressById(id) {
    const p = (this.data.PROGRESS || []).find(pr => pr.Progress_ID === parseInt(id, 10));
    if (!p) throw new Error(`Progress with ID ${id} not found.`);
    return { success: true, data: p };
  }

  // RESULTS
  getResults(params = {}) {
    let list = [...(this.data.RESULT || [])];
    if (params.studentId) {
      list = list.filter(r => String(r.Student_ID) === String(params.studentId));
    }
    if (params.assessmentId) {
      list = list.filter(r => String(r.Assessment_ID) === String(params.assessmentId));
    }
    const enhanced = list.map(r => {
      const s = (this.data.STUDENT || []).find(st => st.Student_ID === r.Student_ID) || {};
      const a = (this.data.ASSESSMENT || []).find(asm => asm.Assessment_ID === r.Assessment_ID) || {};
      const m = (this.data.MODULE || []).find(md => md.Module_ID === a.Module_ID) || {};
      const c = (this.data.COURSE || []).find(cr => cr.Course_ID === m.Course_ID) || {};
      return {
        ...r,
        Student_Name: s.Name || `Student #${r.Student_ID}`,
        Assessment_Name: a.Assessment_Name || `Assessment #${r.Assessment_ID}`,
        Assessment_Type: a.Assessment_Type || 'Quiz',
        Max_Marks: a.Max_Marks || 100,
        Module_Name: m.Module_Name || '',
        Course_Name: c.Course_Name || ''
      };
    });

    if (params.search) {
      const q = params.search.toLowerCase();
      return {
        success: true,
        count: enhanced.length,
        data: enhanced.filter(r =>
          r.Student_Name.toLowerCase().includes(q) ||
          r.Assessment_Name.toLowerCase().includes(q) ||
          r.Course_Name.toLowerCase().includes(q)
        )
      };
    }

    return { success: true, count: enhanced.length, data: enhanced };
  }

  getResultById(id) {
    const r = (this.data.RESULT || []).find(res => res.Result_ID === parseInt(id, 10));
    if (!r) throw new Error(`Result with ID ${id} not found.`);
    return { success: true, data: r };
  }

  // Predefined Queries
  getPredefinedQueries() {
    return {
      success: true,
      data: [
        {
          id: 'first-year-students',
          title: 'Query 1: First-Year Students Filter',
          description: 'Retrieves all undergraduate students currently enrolled in academic Year 1.',
          presentationNote: 'Matches Presentation Slide 05. Expected result: 14 students.'
        },
        {
          id: 'instructor-courses',
          title: 'Query 2: Instructor-Course Relational JOIN',
          description: 'Performs an INNER JOIN between INSTRUCTOR and COURSE.',
          presentationNote: 'Matches Presentation Slide 06. Confirms Dr. Alan Turing teaches two courses.'
        },
        {
          id: 'student-enrollments',
          title: 'Query 3: Student Enrollments (3-Table JOIN)',
          description: 'Joins STUDENT, ENROLLMENT, and COURSE to display registered learners.',
          presentationNote: 'Demonstrates many-to-many relationship resolution.'
        }
      ]
    };
  }

  runPredefinedQuery(key) {
    if (key === 'first-year-students') {
      const rows = (this.data.STUDENT || [])
        .filter(s => s.Year === 1)
        .map(s => ({
          Student_ID: s.Student_ID,
          Name: s.Name,
          Department: s.Department,
          Year: s.Year,
          Email: s.Email,
          Phone: s.Phone
        }));
      return {
        success: true,
        queryKey: key,
        rowCount: rows.length,
        executionTimeMs: 1.2,
        data: rows
      };
    }
    if (key === 'instructor-courses') {
      const rows = [];
      (this.data.COURSE || []).forEach(c => {
        const inst = (this.data.INSTRUCTOR || []).find(i => i.Instructor_ID === c.Instructor_ID);
        if (inst) {
          rows.push({
            Instructor_ID: inst.Instructor_ID,
            Instructor_Name: inst.Name,
            Specialization: inst.Specialization,
            Course_ID: c.Course_ID,
            Course_Name: c.Course_Name,
            Category: c.Category,
            Level: c.Level
          });
        }
      });
      return {
        success: true,
        queryKey: key,
        rowCount: rows.length,
        executionTimeMs: 1.5,
        data: rows
      };
    }
    if (key === 'student-enrollments') {
      const rows = (this.data.ENROLLMENT || []).map(e => {
        const s = (this.data.STUDENT || []).find(st => st.Student_ID === e.Student_ID) || {};
        const c = (this.data.COURSE || []).find(cr => cr.Course_ID === e.Course_ID) || {};
        return {
          Student_ID: s.Student_ID,
          Student_Name: s.Name,
          Department: s.Department,
          Course_Name: c.Course_Name,
          Enroll_Date: e.Enroll_Date,
          Enrollment_Status: e.Status,
          Completion_Date: e.Completion_Date
        };
      });
      return {
        success: true,
        queryKey: key,
        rowCount: rows.length,
        executionTimeMs: 2.1,
        data: rows
      };
    }
    return { success: true, rowCount: 0, executionTimeMs: 0.5, data: [] };
  }

  // Database Overview
  getDatabaseOverview() {
    const tables = ['instructor', 'student', 'course', 'module', 'assessment', 'enrollment', 'progress', 'result'];
    const rowCounts = {
      instructor: (this.data.INSTRUCTOR || []).length,
      student: (this.data.STUDENT || []).length,
      course: (this.data.COURSE || []).length,
      module: (this.data.MODULE || []).length,
      assessment: (this.data.ASSESSMENT || []).length,
      enrollment: (this.data.ENROLLMENT || []).length,
      progress: (this.data.PROGRESS || []).length,
      result: (this.data.RESULT || []).length
    };

    const tableSchemas = {
      instructor: {
        tableName: 'instructor',
        rowCount: rowCounts.instructor,
        columns: [
          { name: 'Instructor_ID', type: 'int', isPrimaryKey: true, isNullable: false },
          { name: 'Name', type: 'varchar(100)', isPrimaryKey: false, isNullable: false },
          { name: 'Email', type: 'varchar(100)', isPrimaryKey: false, isNullable: false },
          { name: 'Specialization', type: 'varchar(100)', isPrimaryKey: false, isNullable: true },
          { name: 'Phone', type: 'varchar(20)', isPrimaryKey: false, isNullable: true }
        ],
        foreignKeys: []
      },
      student: {
        tableName: 'student',
        rowCount: rowCounts.student,
        columns: [
          { name: 'Student_ID', type: 'int', isPrimaryKey: true, isNullable: false },
          { name: 'Name', type: 'varchar(100)', isPrimaryKey: false, isNullable: false },
          { name: 'Email', type: 'varchar(100)', isPrimaryKey: false, isNullable: false },
          { name: 'Department', type: 'varchar(50)', isPrimaryKey: false, isNullable: false },
          { name: 'Year', type: 'int', isPrimaryKey: false, isNullable: false },
          { name: 'Phone', type: 'varchar(20)', isPrimaryKey: false, isNullable: true }
        ],
        foreignKeys: []
      },
      course: {
        tableName: 'course',
        rowCount: rowCounts.course,
        columns: [
          { name: 'Course_ID', type: 'int', isPrimaryKey: true, isNullable: false },
          { name: 'Course_Name', type: 'varchar(150)', isPrimaryKey: false, isNullable: false },
          { name: 'Description', type: 'text', isPrimaryKey: false, isNullable: true },
          { name: 'Duration', type: 'int', isPrimaryKey: false, isNullable: false },
          { name: 'Category', type: 'varchar(50)', isPrimaryKey: false, isNullable: true },
          { name: 'Level', type: 'varchar(20)', isPrimaryKey: false, isNullable: true },
          { name: 'Instructor_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: true }
        ],
        foreignKeys: [
          { column: 'Instructor_ID', referencedTable: 'instructor', referencedColumn: 'Instructor_ID' }
        ]
      },
      module: {
        tableName: 'module',
        rowCount: rowCounts.module,
        columns: [
          { name: 'Module_ID', type: 'int', isPrimaryKey: true, isNullable: false },
          { name: 'Module_Name', type: 'varchar(150)', isPrimaryKey: false, isNullable: false },
          { name: 'Description', type: 'text', isPrimaryKey: false, isNullable: true },
          { name: 'Sequence_No', type: 'int', isPrimaryKey: false, isNullable: false },
          { name: 'Course_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: false }
        ],
        foreignKeys: [
          { column: 'Course_ID', referencedTable: 'course', referencedColumn: 'Course_ID' }
        ]
      },
      assessment: {
        tableName: 'assessment',
        rowCount: rowCounts.assessment,
        columns: [
          { name: 'Assessment_ID', type: 'int', isPrimaryKey: true, isNullable: false },
          { name: 'Assessment_Name', type: 'varchar(150)', isPrimaryKey: false, isNullable: false },
          { name: 'Assessment_Type', type: 'varchar(30)', isPrimaryKey: false, isNullable: false },
          { name: 'Max_Marks', type: 'int', isPrimaryKey: false, isNullable: false },
          { name: 'Module_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: false }
        ],
        foreignKeys: [
          { column: 'Module_ID', referencedTable: 'module', referencedColumn: 'Module_ID' }
        ]
      },
      enrollment: {
        tableName: 'enrollment',
        rowCount: rowCounts.enrollment,
        columns: [
          { name: 'Enrollment_ID', type: 'int', isPrimaryKey: true, isNullable: false },
          { name: 'Enroll_Date', type: 'date', isPrimaryKey: false, isNullable: false },
          { name: 'Status', type: 'varchar(20)', isPrimaryKey: false, isNullable: false },
          { name: 'Completion_Date', type: 'date', isPrimaryKey: false, isNullable: true },
          { name: 'Student_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'Course_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: false }
        ],
        foreignKeys: [
          { column: 'Student_ID', referencedTable: 'student', referencedColumn: 'Student_ID' },
          { column: 'Course_ID', referencedTable: 'course', referencedColumn: 'Course_ID' }
        ]
      },
      progress: {
        tableName: 'progress',
        rowCount: rowCounts.progress,
        columns: [
          { name: 'Progress_ID', type: 'int', isPrimaryKey: true, isNullable: false },
          { name: 'Progress_Date', type: 'date', isPrimaryKey: false, isNullable: false },
          { name: 'Completion_Percent', type: 'decimal(5,2)', isPrimaryKey: false, isNullable: false },
          { name: 'Status', type: 'varchar(20)', isPrimaryKey: false, isNullable: false },
          { name: 'Time_Spent', type: 'int', isPrimaryKey: false, isNullable: true },
          { name: 'Student_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'Module_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: false }
        ],
        foreignKeys: [
          { column: 'Student_ID', referencedTable: 'student', referencedColumn: 'Student_ID' },
          { column: 'Module_ID', referencedTable: 'module', referencedColumn: 'Module_ID' }
        ]
      },
      result: {
        tableName: 'result',
        rowCount: rowCounts.result,
        columns: [
          { name: 'Result_ID', type: 'int', isPrimaryKey: true, isNullable: false },
          { name: 'Score', type: 'decimal(5,2)', isPrimaryKey: false, isNullable: false },
          { name: 'Attempt_No', type: 'int', isPrimaryKey: false, isNullable: false },
          { name: 'Result_Date', type: 'date', isPrimaryKey: false, isNullable: false },
          { name: 'Student_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: false },
          { name: 'Assessment_ID', type: 'int', isPrimaryKey: false, isForeignKey: true, isNullable: false }
        ],
        foreignKeys: [
          { column: 'Student_ID', referencedTable: 'student', referencedColumn: 'Student_ID' },
          { column: 'Assessment_ID', referencedTable: 'assessment', referencedColumn: 'Assessment_ID' }
        ]
      }
    };

    return {
      success: true,
      server: {
        version: 'MySQL 9.7 (Relational Database Engine)',
        database: 'learningprogressdb',
        serverTime: new Date().toISOString(),
        status: 'Online'
      },
      tableCounts: rowCounts,
      schemas: tableSchemas
    };
  }
}

export const localStore = new LocalRelationalStore();
