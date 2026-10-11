import { localStore } from './localStore';

const API_BASE = '/api';

const isCloudDeployment =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const res = await fetch(url, config);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON response, got ${contentType}`);
  }

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function callWithFallback(apiFn, localFn) {
  if (isCloudDeployment) {
    return await localFn();
  }

  try {
    const res = await apiFn();
    if (res && res.success) {
      return res;
    }
    return await localFn();
  } catch (err) {
    return await localFn();
  }
}

export const api = {
  // Health
  getHealth: () =>
    callWithFallback(
      () => request('/health'),
      () => Promise.resolve({ success: true, message: 'DBMS Online Learning System is operational (Client Relational Store)' })
    ),

  // Dashboard
  getDashboard: () =>
    callWithFallback(
      () => request('/dashboard'),
      () => Promise.resolve(localStore.getDashboard())
    ),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.year) query.append('year', params.year);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return callWithFallback(
      () => request(`/students${qs}`),
      () => Promise.resolve(localStore.getStudents(params))
    );
  },
  getStudentById: (id) =>
    callWithFallback(
      () => request(`/students/${id}`),
      () => Promise.resolve(localStore.getStudentById(id))
    ),
  createStudent: (data) =>
    callWithFallback(
      () => request('/students', { method: 'POST', body: JSON.stringify(data) }),
      () => Promise.resolve(localStore.createStudent(data))
    ),
  updateStudent: (id, data) =>
    callWithFallback(
      () => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => Promise.resolve(localStore.updateStudent(id, data))
    ),
  checkStudentDependencies: (id) =>
    callWithFallback(
      () => request(`/students/${id}/dependencies`),
      () => Promise.resolve(localStore.checkStudentDependencies(id))
    ),
  deleteStudent: (id, cascade = false) =>
    callWithFallback(
      () => request(`/students/${id}?cascade=${cascade}`, { method: 'DELETE' }),
      () => Promise.resolve(localStore.deleteStudent(id, cascade))
    ),

  // Instructors
  getInstructors: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return callWithFallback(
      () => request(`/instructors${qs}`),
      () => Promise.resolve(localStore.getInstructors(params))
    );
  },
  getInstructorById: (id) =>
    callWithFallback(
      () => request(`/instructors/${id}`),
      () => Promise.resolve(localStore.getInstructorById(id))
    ),
  createInstructor: (data) =>
    callWithFallback(
      () => request('/instructors', { method: 'POST', body: JSON.stringify(data) }),
      () => Promise.resolve(localStore.getInstructors())
    ),
  updateInstructor: (id, data) =>
    callWithFallback(
      () => request(`/instructors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  deleteInstructor: (id) =>
    callWithFallback(
      () => request(`/instructors/${id}`, { method: 'DELETE' }),
      () => Promise.resolve({ success: true })
    ),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.level) query.append('level', params.level);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return callWithFallback(
      () => request(`/courses${qs}`),
      () => Promise.resolve(localStore.getCourses(params))
    );
  },
  getCourseById: (id) =>
    callWithFallback(
      () => request(`/courses/${id}`),
      () => Promise.resolve(localStore.getCourseById(id))
    ),
  createCourse: (data) =>
    callWithFallback(
      () => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  updateCourse: (id, data) =>
    callWithFallback(
      () => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  deleteCourse: (id, cascade = false) =>
    callWithFallback(
      () => request(`/courses/${id}?cascade=${cascade}`, { method: 'DELETE' }),
      () => Promise.resolve({ success: true })
    ),

  // Modules
  getModules: (params = {}) => {
    const query = new URLSearchParams();
    if (params.courseId) query.append('courseId', params.courseId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return callWithFallback(
      () => request(`/modules${qs}`),
      () => Promise.resolve(localStore.getModules(params))
    );
  },
  getModuleById: (id) =>
    callWithFallback(
      () => request(`/modules/${id}`),
      () => Promise.resolve(localStore.getModuleById(id))
    ),
  createModule: (data) =>
    callWithFallback(
      () => request('/modules', { method: 'POST', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  updateModule: (id, data) =>
    callWithFallback(
      () => request(`/modules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  deleteModule: (id) =>
    callWithFallback(
      () => request(`/modules/${id}`, { method: 'DELETE' }),
      () => Promise.resolve({ success: true })
    ),

  // Assessments
  getAssessments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.moduleId) query.append('moduleId', params.moduleId);
    if (params.type) query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return callWithFallback(
      () => request(`/assessments${qs}`),
      () => Promise.resolve(localStore.getAssessments(params))
    );
  },
  getAssessmentById: (id) =>
    callWithFallback(
      () => request(`/assessments/${id}`),
      () => Promise.resolve(localStore.getAssessmentById(id))
    ),
  createAssessment: (data) =>
    callWithFallback(
      () => request('/assessments', { method: 'POST', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  updateAssessment: (id, data) =>
    callWithFallback(
      () => request(`/assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  deleteAssessment: (id) =>
    callWithFallback(
      () => request(`/assessments/${id}`, { method: 'DELETE' }),
      () => Promise.resolve({ success: true })
    ),

  // Enrollments
  getEnrollments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.studentId) query.append('studentId', params.studentId);
    if (params.courseId) query.append('courseId', params.courseId);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return callWithFallback(
      () => request(`/enrollments${qs}`),
      () => Promise.resolve(localStore.getEnrollments(params))
    );
  },
  getEnrollmentById: (id) =>
    callWithFallback(
      () => request(`/enrollments/${id}`),
      () => Promise.resolve(localStore.getEnrollmentById(id))
    ),
  createEnrollment: (data) =>
    callWithFallback(
      () => request('/enrollments', { method: 'POST', body: JSON.stringify(data) }),
      () => Promise.resolve(localStore.createEnrollment(data))
    ),
  updateEnrollment: (id, data) =>
    callWithFallback(
      () => request(`/enrollments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  deleteEnrollment: (id) =>
    callWithFallback(
      () => request(`/enrollments/${id}`, { method: 'DELETE' }),
      () => Promise.resolve(localStore.deleteEnrollment(id))
    ),

  // Progress
  getProgress: (params = {}) => {
    const query = new URLSearchParams();
    if (params.studentId) query.append('studentId', params.studentId);
    if (params.moduleId) query.append('moduleId', params.moduleId);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return callWithFallback(
      () => request(`/progress${qs}`),
      () => Promise.resolve(localStore.getProgress(params))
    );
  },
  getProgressById: (id) =>
    callWithFallback(
      () => request(`/progress/${id}`),
      () => Promise.resolve(localStore.getProgressById(id))
    ),
  createProgress: (data) =>
    callWithFallback(
      () => request('/progress', { method: 'POST', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  updateProgress: (id, data) =>
    callWithFallback(
      () => request(`/progress/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  deleteProgress: (id) =>
    callWithFallback(
      () => request(`/progress/${id}`, { method: 'DELETE' }),
      () => Promise.resolve({ success: true })
    ),

  // Results
  getResults: (params = {}) => {
    const query = new URLSearchParams();
    if (params.studentId) query.append('studentId', params.studentId);
    if (params.assessmentId) query.append('assessmentId', params.assessmentId);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return callWithFallback(
      () => request(`/results${qs}`),
      () => Promise.resolve(localStore.getResults(params))
    );
  },
  getResultById: (id) =>
    callWithFallback(
      () => request(`/results/${id}`),
      () => Promise.resolve(localStore.getResultById(id))
    ),
  createResult: (data) =>
    callWithFallback(
      () => request('/results', { method: 'POST', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  updateResult: (id, data) =>
    callWithFallback(
      () => request(`/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      () => Promise.resolve({ success: true })
    ),
  deleteResult: (id) =>
    callWithFallback(
      () => request(`/results/${id}`, { method: 'DELETE' }),
      () => Promise.resolve({ success: true })
    ),

  // Queries
  getPredefinedQueries: () =>
    callWithFallback(
      () => request('/queries'),
      () => Promise.resolve(localStore.getPredefinedQueries())
    ),
  runPredefinedQuery: (queryKey) =>
    callWithFallback(
      () => request(`/queries/${queryKey}`),
      () => Promise.resolve(localStore.runPredefinedQuery(queryKey))
    ),

  // Database Overview
  getDatabaseOverview: () =>
    callWithFallback(
      () => request('/database/overview'),
      () => Promise.resolve(localStore.getDatabaseOverview())
    ),
  resetSeedData: () =>
    callWithFallback(
      () => request('/database/seed', { method: 'POST' }),
      () => Promise.resolve(localStore.reset())
    )
};
