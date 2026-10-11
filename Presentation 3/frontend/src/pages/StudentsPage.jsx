import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  BookOpen,
  TrendingUp,
  Award,
  Phone,
  Mail,
  User
} from 'lucide-react';

const DEPARTMENTS = ['All', 'Computer Science', 'Information Tech', 'Electronics'];
const YEARS = ['All', '1', '2', '3'];

export const StudentsPage = ({ showToast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected student for detail / edit / delete
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [dependencyData, setDependencyData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Department: 'Computer Science',
    Year: 1,
    Phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [department, year]);

  const loadStudents = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getStudents({ search: searchTerm, department, year });
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents(search);
  };

  const handleOpenDetail = async (student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
    setLoadingDetails(true);
    try {
      const res = await api.getStudentById(student.Student_ID);
      if (res.success) {
        setStudentDetails(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingDetails(false);
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

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      Name: student.Name,
      Email: student.Email,
      Department: student.Department,
      Year: student.Year,
      Phone: student.Phone || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = async (student) => {
    setSelectedStudent(student);
    try {
      const depRes = await api.checkStudentDependencies(student.Student_ID);
      setDependencyData(depRes);
      setIsDeleteOpen(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createStudent(formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAddOpen(false);
        loadStudents();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.updateStudent(selectedStudent.Student_ID, formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        loadStudents();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (cascade) => {
    try {
      setIsDeleting(true);
      const res = await api.deleteStudent(selectedStudent.Student_ID, cascade);
      if (res.success) {
        showToast(res.message, 'success');
        setIsDeleteOpen(false);
        setSelectedStudent(null);
        loadStudents();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Filter and Actions Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '15rem', maxWidth: '24rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search student by name, email, or ID..."
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>

          {/* Filters & Add Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Dept:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Year:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.15rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>+ Add New Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
            Students Master Table
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing <strong>{students.length}</strong> student record(s)
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading students from MySQL...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No students found matching current filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '4.5rem' }}>ID</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Phone</th>
                    <th style={{ textAlign: 'center', width: '13rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.Student_ID}>
                    <td style={{ fontWeight: 600, color: '#475569' }}>#{s.Student_ID}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.Name}</td>
                    <td style={{ color: '#475569' }}>{s.Email}</td>
                    <td>
                      <span className={
                        s.Department === 'Computer Science' ? 'badge badge-blue' :
                        s.Department === 'Information Tech' ? 'badge badge-purple' : 'badge badge-amber'
                      }>
                        {s.Department}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-slate">Year {s.Year}</span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{s.Phone || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenDetail(s)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                          title="View student profile & related records"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                          title="Edit student"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(s)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.35rem 0.7rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #f87171',
                            borderRadius: '0.375rem',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                            e.currentTarget.style.color = '#b91c1c';
                          }}
                          title="Delete student from MySQL"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Student Record">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Siddhant Agarwal"
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
              placeholder="e.g. siddhant@univ.edu"
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
              placeholder="e.g. 555-2026"
              value={formData.Phone}
              onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Inserting into MySQL...' : 'Insert Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Student Record">
        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              className="form-input"
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
              value={formData.Phone}
              onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Updating in MySQL...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Detail Modal (Relational View) */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedStudent ? `Student Profile: ${selectedStudent.Name}` : 'Student Profile'}
        maxWidth="44rem"
      >
        {loadingDetails ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Fetching related database records from MySQL...
          </div>
        ) : studentDetails ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Student Info Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
                gap: '0.75rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Student ID</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>#{studentDetails.Student_ID}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Department</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{studentDetails.Department}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Academic Year</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>Year {studentDetails.Year}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Email</span>
                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.85rem' }}>{studentDetails.Email}</div>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} color="#2563eb" /> Enrolled Courses ({studentDetails.enrollments.length})
              </h4>
              {studentDetails.enrollments.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No courses enrolled currently.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Category</th>
                      <th>Enroll Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentDetails.enrollments.map((e) => (
                      <tr key={e.Enrollment_ID}>
                        <td style={{ fontWeight: 500 }}>{e.Course_Name}</td>
                        <td>{e.Category}</td>
                        <td>{e.Enroll_Date}</td>
                        <td>
                          <span className={e.Status === 'Completed' ? 'badge badge-green' : 'badge badge-blue'}>
                            {e.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Module Progress */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <TrendingUp size={16} color="#059669" /> Module Learning Progress ({studentDetails.progress.length})
              </h4>
              {studentDetails.progress.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No progress logged yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Module</th>
                      <th>Progress</th>
                      <th>Time Spent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentDetails.progress.map((p) => (
                      <tr key={p.Progress_ID}>
                        <td style={{ fontSize: '0.8rem' }}>{p.Course_Name}</td>
                        <td style={{ fontWeight: 500 }}>{p.Module_Name}</td>
                        <td style={{ width: '8rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${p.Completion_Percent}%`, height: '100%', backgroundColor: p.Completion_Percent === 100 ? '#10b981' : '#2563eb' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.Completion_Percent}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{p.Time_Spent} mins</td>
                        <td>
                          <span className={p.Status === 'Completed' ? 'badge badge-green' : 'badge badge-amber'}>
                            {p.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Assessment Results */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={16} color="#7c3aed" /> Assessment Results ({studentDetails.results.length})
              </h4>
              {studentDetails.results.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No assessment submissions recorded.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assessment</th>
                      <th>Type</th>
                      <th>Score</th>
                      <th>Attempt</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentDetails.results.map((r) => (
                      <tr key={r.Result_ID}>
                        <td style={{ fontWeight: 500 }}>{r.Assessment_Name}</td>
                        <td><span className="badge badge-slate">{r.Assessment_Type}</span></td>
                        <td>
                          {r.Score !== null ? (
                            <strong style={{ color: '#0f172a' }}>{r.Score} / {r.Max_Marks}</strong>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Pending</span>
                          )}
                        </td>
                        <td>#{r.Attempt_No || '—'}</td>
                        <td>{r.Result_Date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedStudent ? selectedStudent.Name : ''}
        itemId={selectedStudent ? selectedStudent.Student_ID : ''}
        itemType="Student"
        dependencyData={dependencyData}
        isDeleting={isDeleting}
      />
    </div>
  );
};
