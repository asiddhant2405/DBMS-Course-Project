import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  ClipboardCheck,
  UserPlus,
  CheckCircle2,
  Plus,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const DashboardPage = ({ setActiveTab, showToast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student Management on Dashboard
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add Student State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Department: 'Computer Science',
    Year: 1,
    Phone: ''
  });

  // Delete Student State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dependencyData, setDependencyData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadStudents();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);
      const res = await api.getStudents();
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      Name: '',
      Email: '',
      Department: 'Computer Science',
      Year: 1,
      Phone: ''
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Name.trim() || !formData.Email.trim()) {
      if (showToast) showToast('Name and Email are required.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await api.createStudent(formData);
      if (res.success) {
        if (showToast) showToast(`Student '${res.data.Name}' added successfully!`, 'success');
        setIsAddOpen(false);
        await Promise.all([loadStudents(), loadDashboard()]);
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = async (student) => {
    setSelectedStudent(student);
    try {
      const depRes = await api.checkStudentDependencies(student.Student_ID);
      if (depRes.success) {
        setDependencyData(depRes);
      } else {
        setDependencyData(null);
      }
    } catch {
      setDependencyData(null);
    }
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async (cascade) => {
    if (!selectedStudent) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteStudent(selectedStudent.Student_ID, cascade);
      if (res.success) {
        if (showToast) showToast(`Student '${selectedStudent.Name}' deleted successfully!`, 'success');
        setIsDeleteOpen(false);
        setSelectedStudent(null);
        await Promise.all([loadStudents(), loadDashboard()]);
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}>
          <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Failed to Load Dashboard Metrics</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>
          <button onClick={loadDashboard} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary, deptDistribution, yearDistribution, recentEnrollments, recentResults } = data;

  // Filter students for the dashboard table
  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.Name.toLowerCase().includes(q) ||
      s.Email.toLowerCase().includes(q) ||
      String(s.Student_ID).includes(q) ||
      (s.Department && s.Department.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(13.5rem, 1fr))',
          gap: '1rem'
        }}
      >
        {/* Total Students */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Total Students</span>
            <div style={{ padding: '0.45rem', borderRadius: '0.375rem', backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <GraduationCap size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {summary.totalStudents}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: 500 }}>
            Registered learner profiles
          </div>
        </div>

        {/* Total Instructors */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Instructors</span>
            <div style={{ padding: '0.45rem', borderRadius: '0.375rem', backgroundColor: '#faf5ff', color: '#9333ea' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {summary.totalInstructors}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Active faculty members
          </div>
        </div>

        {/* Total Courses */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Active Courses</span>
            <div style={{ padding: '0.45rem', borderRadius: '0.375rem', backgroundColor: '#ecfdf5', color: '#059669' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {summary.totalCourses}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Across academic disciplines
          </div>
        </div>

        {/* Total Modules */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Course Modules</span>
            <div style={{ padding: '0.45rem', borderRadius: '0.375rem', backgroundColor: '#fffbeb', color: '#d97706' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {summary.totalModules}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            {summary.totalAssessments} Assessments linked
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Course Enrollments</span>
            <div style={{ padding: '0.45rem', borderRadius: '0.375rem', backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <UserPlus size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {summary.totalEnrollments}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Active course registrations
          </div>
        </div>

        {/* Overall Completion Rate */}
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Module Completion Rate</span>
            <div style={{ padding: '0.45rem', borderRadius: '0.375rem', backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>
            {summary.overallCompletionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: 500 }}>
            {summary.completedModulesCount} of {summary.totalProgress} module attempts finished
          </div>
        </div>
      </div>

      {/* Faculty Student Management Section */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Faculty Student Management
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, marginTop: '0.15rem' }}>
              Insert new students into the database or remove existing student records anytime
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '16rem' }}>
              <input
                type="text"
                placeholder="Search students..."
                className="form-input"
                style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.825rem' }}
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Search
                size={15}
                color="#94a3b8"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            <button
              onClick={handleOpenAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
              }}
            >
              <Plus size={16} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div style={{ overflowX: 'auto' }}>
          {studentsLoading ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              No students found matching "{studentSearch}".
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '4.5rem' }}>ID</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Phone</th>
                  <th style={{ textAlign: 'center', width: '6.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((s) => (
                  <tr key={s.Student_ID}>
                    <td style={{ fontWeight: 600, color: '#64748b' }}>#{s.Student_ID}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.Name}</td>
                    <td style={{ color: '#475569' }}>{s.Email}</td>
                    <td>
                      <span className="badge badge-blue">{s.Department}</span>
                    </td>
                    <td>Year {s.Year}</td>
                    <td style={{ color: '#64748b' }}>{s.Phone || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleOpenDelete(s)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.3rem 0.6rem',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                          e.currentTarget.style.borderColor = '#f87171';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }}
                        title={`Delete ${s.Name}`}
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer with Pagination */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#64748b',
            backgroundColor: '#f8fafc'
          }}
        >
          <div>
            Showing <strong>{filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(filteredStudents.length, currentPage * pageSize)}</strong> of{' '}
            <strong>{filteredStudents.length}</strong> students
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))', gap: '1.25rem' }}>
        {/* Department Distribution */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              Students by Academic Department
            </h3>
            <span className="badge badge-slate">Department Breakdown</span>
          </div>

          <div style={{ width: '100%', height: '14rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-10} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} Students`, 'Count']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.8rem' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic Year Cohorts */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              Student Cohorts by Academic Year
            </h3>
            <span className="badge badge-blue">Cohort Distribution</span>
          </div>

          <div style={{ width: '100%', height: '14rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} Students`, 'Cohort Size']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.8rem' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Course Summary & Activity Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(24rem, 1fr))', gap: '1.25rem' }}>
        {/* Recent Enrollments */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              Recent Course Registrations
            </h3>
            <button onClick={() => setActiveTab('enrollments')} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
              View All
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEnrollments.map((en) => (
                <tr key={en.Enrollment_ID}>
                  <td style={{ fontWeight: 500 }}>{en.Student_Name}</td>
                  <td>{en.Course_Name}</td>
                  <td>
                    <span className={en.Status === 'Completed' ? 'badge badge-green' : 'badge badge-blue'}>
                      {en.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Results */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
              Recent Assessment Submissions
            </h3>
            <button onClick={() => setActiveTab('results')} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
              View All
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Assessment</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {recentResults.map((r) => (
                <tr key={r.Result_ID}>
                  <td style={{ fontWeight: 500 }}>{r.Student_Name}</td>
                  <td>{r.Assessment_Name}</td>
                  <td>
                    <span className="badge badge-purple" style={{ fontWeight: 600 }}>
                      {r.Score} / {r.Max_Marks}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Student">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Full Student Name *
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Maya Lin"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              University Email *
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. maya.lin@university.edu"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Department *
              </label>
              <select
                className="form-select"
                value={formData.Department}
                onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Academic Year *
              </label>
              <select
                className="form-select"
                value={formData.Year}
                onChange={(e) => setFormData({ ...formData, Year: parseInt(e.target.value, 10) })}
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Phone Contact
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 555-0199"
              value={formData.Phone}
              onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Inserting...' : 'Insert Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {selectedStudent && (
        <ConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedStudent(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Student"
          itemName={selectedStudent.Name}
          itemId={selectedStudent.Student_ID}
          itemType="Student"
          dependencyData={dependencyData}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
