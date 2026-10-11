import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { UserPlus, Plus, Search, Edit2, Trash2 } from 'lucide-react';

const STATUSES = ['All', 'Active', 'Completed'];

export const EnrollmentsPage = ({ showToast }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const [formData, setFormData] = useState({
    Student_ID: '',
    Course_ID: '',
    Enroll_Date: new Date().toISOString().split('T')[0],
    Status: 'Active',
    Completion_Date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEnrollments();
    loadDropdowns();
  }, [statusFilter, courseFilter]);

  const loadEnrollments = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getEnrollments({ status: statusFilter, courseId: courseFilter, search: searchTerm });
      if (res.success) {
        setEnrollments(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [sRes, cRes] = await Promise.all([api.getStudents(), api.getCourses()]);
      if (sRes.success) setStudents(sRes.data);
      if (cRes.success) setCourses(cRes.data);
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEnrollments(search);
  };

  const handleOpenAdd = () => {
    setFormData({
      Student_ID: students.length > 0 ? students[0].Student_ID : '',
      Course_ID: courses.length > 0 ? courses[0].Course_ID : '',
      Enroll_Date: new Date().toISOString().split('T')[0],
      Status: 'Active',
      Completion_Date: ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (en) => {
    setSelectedEnrollment(en);
    setFormData({
      Student_ID: en.Student_ID,
      Course_ID: en.Course_ID,
      Enroll_Date: en.Enroll_Date ? en.Enroll_Date.split('T')[0] : '',
      Status: en.Status,
      Completion_Date: en.Completion_Date ? en.Completion_Date.split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (en) => {
    setSelectedEnrollment(en);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createEnrollment(formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAddOpen(false);
        loadEnrollments();
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
      const res = await api.updateEnrollment(selectedEnrollment.Enrollment_ID, formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        loadEnrollments();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const res = await api.deleteEnrollment(selectedEnrollment.Enrollment_ID);
      if (res.success) {
        showToast(res.message, 'success');
        setIsDeleteOpen(false);
        setSelectedEnrollment(null);
        loadEnrollments();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Filter and Actions */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '15rem', maxWidth: '24rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search enrollments by student or course..."
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Course:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="All">All Courses</option>
                {courses.map((c) => (
                  <option key={c.Course_ID} value={c.Course_ID}>{c.Course_Name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
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
              <span>+ Enroll Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
            Course Enrollments Table (Associative Entity)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing <strong>{enrollments.length}</strong> enrollment record(s)
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading enrollments from MySQL...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '4.5rem' }}>ID</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Enrolled Course</th>
                  <th>Enroll Date</th>
                  <th>Status</th>
                  <th>Completion Date</th>
                    <th style={{ textAlign: 'center', width: '12rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((en) => (
                  <tr key={en.Enrollment_ID}>
                    <td style={{ fontWeight: 600, color: '#475569' }}>#{en.Enrollment_ID}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{en.Student_Name}</td>
                    <td><span className="badge badge-slate">{en.Student_Department}</span></td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#2563eb' }}>{en.Course_Name}</span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {en.Enroll_Date ? en.Enroll_Date.split('T')[0] : '—'}
                    </td>
                    <td>
                      <span className={en.Status === 'Completed' ? 'badge badge-green' : 'badge badge-blue'}>
                        {en.Status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {en.Completion_Date ? en.Completion_Date.split('T')[0] : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(en)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                          title="Edit enrollment"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(en)}
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
                          title="Delete enrollment from MySQL"
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

      {/* Add Enrollment Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Student Enrollment">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Student (Foreign Key: STUDENT) *
            </label>
            <select
              className="form-select"
              required
              value={formData.Student_ID}
              onChange={(e) => setFormData({ ...formData, Student_ID: e.target.value })}
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.Student_ID} value={s.Student_ID}>
                  #{s.Student_ID} - {s.Name} ({s.Department}, Year {s.Year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Course (Foreign Key: COURSE) *
            </label>
            <select
              className="form-select"
              required
              value={formData.Course_ID}
              onChange={(e) => setFormData({ ...formData, Course_ID: e.target.value })}
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.Course_ID} value={c.Course_ID}>
                  {c.Course_Name} ({c.Category})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Enrollment Date *
              </label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.Enroll_Date}
                onChange={(e) => setFormData({ ...formData, Enroll_Date: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Status *
              </label>
              <select
                className="form-select"
                value={formData.Status}
                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {formData.Status === 'Completed' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Completion Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.Completion_Date}
                onChange={(e) => setFormData({ ...formData, Completion_Date: e.target.value })}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Enrolling in MySQL...' : 'Register Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Enrollment Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Enrollment Record">
        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Student *
            </label>
            <select
              className="form-select"
              required
              value={formData.Student_ID}
              onChange={(e) => setFormData({ ...formData, Student_ID: e.target.value })}
            >
              {students.map((s) => (
                <option key={s.Student_ID} value={s.Student_ID}>
                  #{s.Student_ID} - {s.Name} ({s.Department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Course *
            </label>
            <select
              className="form-select"
              required
              value={formData.Course_ID}
              onChange={(e) => setFormData({ ...formData, Course_ID: e.target.value })}
            >
              {courses.map((c) => (
                <option key={c.Course_ID} value={c.Course_ID}>
                  {c.Course_Name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Enrollment Date
              </label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.Enroll_Date}
                onChange={(e) => setFormData({ ...formData, Enroll_Date: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Status
              </label>
              <select
                className="form-select"
                value={formData.Status}
                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {formData.Status === 'Completed' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Completion Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.Completion_Date}
                onChange={(e) => setFormData({ ...formData, Completion_Date: e.target.value })}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving in MySQL...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedEnrollment ? `${selectedEnrollment.Student_Name} → ${selectedEnrollment.Course_Name}` : ''}
        itemId={selectedEnrollment ? selectedEnrollment.Enrollment_ID : ''}
        itemType="Enrollment"
        isDeleting={isDeleting}
      />
    </div>
  );
};
