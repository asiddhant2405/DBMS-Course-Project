const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      err.message = 'Unable to reach backend server. Please ensure Node.js backend is running on port 5000.';
    }
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.year) query.append('year', params.year);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/students${qs}`);
  },
  getStudentById: (id) => request(`/students/${id}`),
  createStudent: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  checkStudentDependencies: (id) => request(`/students/${id}/dependencies`),
  deleteStudent: (id, cascade = false) => request(`/students/${id}?cascade=${cascade}`, { method: 'DELETE' }),

  // Instructors
  getInstructors: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/instructors${qs}`);
  },
  getInstructorById: (id) => request(`/instructors/${id}`),
  createInstructor: (data) => request('/instructors', { method: 'POST', body: JSON.stringify(data) }),
  updateInstructor: (id, data) => request(`/instructors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInstructor: (id) => request(`/instructors/${id}`, { method: 'DELETE' }),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.level) query.append('level', params.level);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/courses${qs}`);
  },
  getCourseById: (id) => request(`/courses/${id}`),
  createCourse: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id, data) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id, cascade = false) => request(`/courses/${id}?cascade=${cascade}`, { method: 'DELETE' }),

  // Modules
  getModules: (params = {}) => {
    const query = new URLSearchParams();
    if (params.courseId) query.append('courseId', params.courseId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/modules${qs}`);
  },
  getModuleById: (id) => request(`/modules/${id}`),
  createModule: (data) => request('/modules', { method: 'POST', body: JSON.stringify(data) }),
  updateModule: (id, data) => request(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteModule: (id) => request(`/modules/${id}`, { method: 'DELETE' }),

  // Assessments
  getAssessments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.moduleId) query.append('moduleId', params.moduleId);
    if (params.type) query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/assessments${qs}`);
  },
  getAssessmentById: (id) => request(`/assessments/${id}`),
  createAssessment: (data) => request('/assessments', { method: 'POST', body: JSON.stringify(data) }),
  updateAssessment: (id, data) => request(`/assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAssessment: (id) => request(`/assessments/${id}`, { method: 'DELETE' }),

  // Enrollments
  getEnrollments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.studentId) query.append('studentId', params.studentId);
    if (params.courseId) query.append('courseId', params.courseId);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/enrollments${qs}`);
  },
  getEnrollmentById: (id) => request(`/enrollments/${id}`),
  createEnrollment: (data) => request('/enrollments', { method: 'POST', body: JSON.stringify(data) }),
  updateEnrollment: (id, data) => request(`/enrollments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEnrollment: (id) => request(`/enrollments/${id}`, { method: 'DELETE' }),

  // Progress
  getProgress: (params = {}) => {
    const query = new URLSearchParams();
    if (params.studentId) query.append('studentId', params.studentId);
    if (params.moduleId) query.append('moduleId', params.moduleId);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/progress${qs}`);
  },
  getProgressById: (id) => request(`/progress/${id}`),
  createProgress: (data) => request('/progress', { method: 'POST', body: JSON.stringify(data) }),
  updateProgress: (id, data) => request(`/progress/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProgress: (id) => request(`/progress/${id}`, { method: 'DELETE' }),

  // Results
  getResults: (params = {}) => {
    const query = new URLSearchParams();
    if (params.studentId) query.append('studentId', params.studentId);
    if (params.assessmentId) query.append('assessmentId', params.assessmentId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/results${qs}`);
  },
  getResultById: (id) => request(`/results/${id}`),
  createResult: (data) => request('/results', { method: 'POST', body: JSON.stringify(data) }),
  updateResult: (id, data) => request(`/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResult: (id) => request(`/results/${id}`, { method: 'DELETE' }),

  // Queries
  getPredefinedQueries: () => request('/queries'),
  runPredefinedQuery: (queryKey) => request(`/queries/${queryKey}`),

  // Database Overview
  getDatabaseOverview: () => request('/database/overview'),
  resetSeedData: () => request('/database/seed', { method: 'POST' })
};
