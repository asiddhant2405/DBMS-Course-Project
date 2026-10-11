import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { UserCheck, Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';

export const InstructorsPage = ({ showToast }) => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Specialization: '',
    Phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getInstructors({ search: searchTerm });
      if (res.success) {
        setInstructors(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadInstructors(search);
  };

  const handleOpenAdd = () => {
    setFormData({ Name: '', Email: '', Specialization: '', Phone: '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (inst) => {
    setSelectedInstructor(inst);
    setFormData({
      Name: inst.Name,
      Email: inst.Email,
      Specialization: inst.Specialization || '',
      Phone: inst.Phone || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (inst) => {
    setSelectedInstructor(inst);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createInstructor(formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAddOpen(false);
        loadInstructors();
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
      const res = await api.updateInstructor(selectedInstructor.Instructor_ID, formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        loadInstructors();
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
      const res = await api.deleteInstructor(selectedInstructor.Instructor_ID);
      if (res.success) {
        showToast(res.message, 'success');
        setIsDeleteOpen(false);
        setSelectedInstructor(null);
        loadInstructors();
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
                placeholder="Search instructors by name, email, or discipline..."
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
          </form>

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
            <span>+ Add New Instructor</span>
          </button>
        </div>
      </div>

      {/* Instructors Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
            Faculty Instructors Table
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing <strong>{instructors.length}</strong> instructor(s)
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading instructors from MySQL...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '4.5rem' }}>ID</th>
                  <th>Instructor Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Phone</th>
                  <th>Courses Taught</th>
                  <th style={{ textAlign: 'center', width: '12rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((inst) => (
                  <tr key={inst.Instructor_ID}>
                    <td style={{ fontWeight: 600, color: '#475569' }}>#{inst.Instructor_ID}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {inst.Name}
                      {inst.Name === 'Dr. Alan Turing' && (
                        <span className="badge badge-amber" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                          Key Presentation Faculty
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#475569' }}>{inst.Email}</td>
                    <td>
                      <span className="badge badge-purple">{inst.Specialization || 'General'}</span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{inst.Phone || '—'}</td>
                    <td>
                      <span className="badge badge-blue">
                        <BookOpen size={12} /> {inst.Courses_Taught_Count} Course(s)
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(inst)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                          title="Edit instructor"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(inst)}
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
                          title="Delete instructor from MySQL"
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

      {/* Add Instructor Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Instructor Record">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Instructor Full Name *
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Dr. Alan Turing"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Official Email *
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. alan@univ.edu"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Specialization / Department
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Computer Science & AI"
              value={formData.Specialization}
              onChange={(e) => setFormData({ ...formData, Specialization: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Phone Contact
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 555-0001"
              value={formData.Phone}
              onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating in MySQL...' : 'Create Instructor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Instructor Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Instructor Record">
        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Instructor Full Name *
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
              Official Email *
            </label>
            <input
              type="email"
              required
              className="form-input"
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Specialization
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.Specialization}
              onChange={(e) => setFormData({ ...formData, Specialization: e.target.value })}
            />
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
        itemName={selectedInstructor ? selectedInstructor.Name : ''}
        itemId={selectedInstructor ? selectedInstructor.Instructor_ID : ''}
        itemType="Instructor"
        dependencyData={selectedInstructor && selectedInstructor.Courses_Taught_Count > 0 ? {
          hasDependencies: true,
          counts: { enrollments: 0, progress: 0, results: 0 }
        } : null}
        isDeleting={isDeleting}
      />
    </div>
  );
};
