import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { BookOpen, Plus, Search, Edit2, Trash2, Eye, Layers, Users } from 'lucide-react';

const CATEGORIES = ['All', 'Programming', 'Computer Science', 'Electronics', 'Information Tech'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const CoursesPage = ({ showToast }) => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [formData, setFormData] = useState({
    Course_Name: '',
    Description: '',
    Category: 'Computer Science',
    Duration: '6 Weeks',
    Level: 'Beginner',
    Instructor_ID: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCourses();
    loadInstructors();
  }, [category, level]);

  const loadCourses = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getCourses({ search: searchTerm, category, level });
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadInstructors = async () => {
    try {
      const res = await api.getInstructors();
      if (res.success) {
        setInstructors(res.data);
      }
    } catch (err) {
      console.error('Error fetching instructors:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCourses(search);
  };

  const handleOpenDetail = async (course) => {
    setSelectedCourse(course);
    setIsDetailOpen(true);
    setLoadingDetails(true);
    try {
      const res = await api.getCourseById(course.Course_ID);
      if (res.success) {
        setCourseDetails(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      Course_Name: '',
      Description: '',
      Category: 'Computer Science',
      Duration: '6 Weeks',
      Level: 'Beginner',
      Instructor_ID: instructors.length > 0 ? instructors[0].Instructor_ID : ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      Course_Name: course.Course_Name,
      Description: course.Description || '',
      Category: course.Category || 'Computer Science',
      Duration: course.Duration || '6 Weeks',
      Level: course.Level || 'Beginner',
      Instructor_ID: course.Instructor_ID || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (course) => {
    setSelectedCourse(course);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createCourse(formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAddOpen(false);
        loadCourses();
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
      const res = await api.updateCourse(selectedCourse.Course_ID, formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        loadCourses();
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
      const res = await api.deleteCourse(selectedCourse.Course_ID, cascade);
      if (res.success) {
        showToast(res.message, 'success');
        setIsDeleteOpen(false);
        setSelectedCourse(null);
        loadCourses();
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
                placeholder="Search courses by name or instructor..."
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
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Category:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Level:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
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
              <span>+ Add New Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
            Course Catalog Table
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing <strong>{courses.length}</strong> course(s)
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading courses from MySQL...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '4.5rem' }}>ID</th>
                  <th>Course Title</th>
                  <th>Assigned Instructor</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Level</th>
                  <th>Modules</th>
                  <th>Enrolled</th>
                  <th style={{ textAlign: 'right', width: '8rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.Course_ID}>
                    <td style={{ fontWeight: 600, color: '#475569' }}>#{c.Course_ID}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.Course_Name}</td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#2563eb' }}>
                        {c.Instructor_Name || 'Unassigned'}
                      </span>
                    </td>
                    <td><span className="badge badge-purple">{c.Category}</span></td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{c.Duration}</td>
                    <td>
                      <span className={
                        c.Level === 'Beginner' ? 'badge badge-green' :
                        c.Level === 'Intermediate' ? 'badge badge-blue' : 'badge badge-amber'
                      }>
                        {c.Level}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-slate">
                        <Layers size={11} /> {c.Module_Count}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        <Users size={11} /> {c.Enrolled_Count}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenDetail(c)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                          title="View course curriculum & students"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                          title="Edit course"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(c)}
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
                          title="Delete course from MySQL"
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

      {/* Add Course Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Course Offering">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Course Name *
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Database Systems"
              value={formData.Course_Name}
              onChange={(e) => setFormData({ ...formData, Course_Name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Description
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Course description and learning objectives..."
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Assigned Instructor (Foreign Key: INSTRUCTOR) *
            </label>
            <select
              className="form-select"
              required
              value={formData.Instructor_ID}
              onChange={(e) => setFormData({ ...formData, Instructor_ID: e.target.value })}
            >
              <option value="">-- Select Instructor --</option>
              {instructors.map((i) => (
                <option key={i.Instructor_ID} value={i.Instructor_ID}>
                  {i.Name} ({i.Specialization || 'Faculty'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Category
              </label>
              <select
                className="form-select"
                value={formData.Category}
                onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
              >
                <option value="Programming">Programming</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Information Tech">Information Tech</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Duration
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 8 Weeks"
                value={formData.Duration}
                onChange={(e) => setFormData({ ...formData, Duration: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Level
              </label>
              <select
                className="form-select"
                value={formData.Level}
                onChange={(e) => setFormData({ ...formData, Level: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating in MySQL...' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Course Details">
        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Course Name *
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.Course_Name}
              onChange={(e) => setFormData({ ...formData, Course_Name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Description
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Instructor *
            </label>
            <select
              className="form-select"
              required
              value={formData.Instructor_ID}
              onChange={(e) => setFormData({ ...formData, Instructor_ID: e.target.value })}
            >
              {instructors.map((i) => (
                <option key={i.Instructor_ID} value={i.Instructor_ID}>
                  {i.Name} ({i.Specialization || 'Faculty'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Category
              </label>
              <select
                className="form-select"
                value={formData.Category}
                onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
              >
                <option value="Programming">Programming</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Information Tech">Information Tech</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Duration
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.Duration}
                onChange={(e) => setFormData({ ...formData, Duration: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Level
              </label>
              <select
                className="form-select"
                value={formData.Level}
                onChange={(e) => setFormData({ ...formData, Level: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

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

      {/* Course Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedCourse ? `Course: ${selectedCourse.Course_Name}` : 'Course Details'}
        maxWidth="40rem"
      >
        {loadingDetails ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Loading course modules and student enrollments from MySQL...
          </div>
        ) : courseDetails ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                {courseDetails.Description || 'No description provided.'}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                <div>Instructor: <strong style={{ color: '#0f172a' }}>{courseDetails.Instructor_Name}</strong></div>
                <div>Category: <strong style={{ color: '#0f172a' }}>{courseDetails.Category}</strong></div>
                <div>Duration: <strong style={{ color: '#0f172a' }}>{courseDetails.Duration}</strong></div>
              </div>
            </div>

            {/* Modules */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                Curriculum Modules ({courseDetails.modules.length})
              </h4>
              {courseDetails.modules.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No modules configured yet.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Seq</th>
                      <th>Module Title</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseDetails.modules.map((m) => (
                      <tr key={m.Module_ID}>
                        <td style={{ fontWeight: 600 }}>#{m.Sequence_No}</td>
                        <td style={{ fontWeight: 500 }}>{m.Module_Name}</td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.Description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Enrolled Students */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                Enrolled Students ({courseDetails.enrollments.length})
              </h4>
              {courseDetails.enrollments.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No students enrolled.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>Enroll Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseDetails.enrollments.map((en) => (
                      <tr key={en.Enrollment_ID}>
                        <td style={{ fontWeight: 500 }}>{en.Student_Name}</td>
                        <td><span className="badge badge-slate">{en.Department}</span></td>
                        <td>Year {en.Year}</td>
                        <td>{en.Enroll_Date}</td>
                        <td>
                          <span className={en.Status === 'Completed' ? 'badge badge-green' : 'badge badge-blue'}>
                            {en.Status}
                          </span>
                        </td>
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
        itemName={selectedCourse ? selectedCourse.Course_Name : ''}
        itemId={selectedCourse ? selectedCourse.Course_ID : ''}
        itemType="Course"
        dependencyData={selectedCourse && (selectedCourse.Enrolled_Count > 0 || selectedCourse.Module_Count > 0) ? {
          hasDependencies: true,
          counts: {
            enrollments: selectedCourse.Enrolled_Count,
            progress: selectedCourse.Module_Count,
            results: 0
          }
        } : null}
        isDeleting={isDeleting}
      />
    </div>
  );
};
