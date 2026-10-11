import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Layers, Plus, Search, Edit2, Trash2, ClipboardCheck } from 'lucide-react';

export const ModulesPage = ({ showToast }) => {
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const [formData, setFormData] = useState({
    Module_Name: '',
    Description: '',
    Sequence_No: 1,
    Course_ID: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadModules();
    loadCourses();
  }, [courseFilter]);

  const loadModules = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getModules({ courseId: courseFilter, search: searchTerm });
      if (res.success) {
        setModules(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await api.getCourses();
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadModules(search);
  };

  const handleOpenAdd = () => {
    setFormData({
      Module_Name: '',
      Description: '',
      Sequence_No: 1,
      Course_ID: courses.length > 0 ? courses[0].Course_ID : ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (m) => {
    setSelectedModule(m);
    setFormData({
      Module_Name: m.Module_Name,
      Description: m.Description || '',
      Sequence_No: m.Sequence_No || 1,
      Course_ID: m.Course_ID
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (m) => {
    setSelectedModule(m);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createModule(formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAddOpen(false);
        loadModules();
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
      const res = await api.updateModule(selectedModule.Module_ID, formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        loadModules();
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
      const res = await api.deleteModule(selectedModule.Module_ID);
      if (res.success) {
        showToast(res.message, 'success');
        setIsDeleteOpen(false);
        setSelectedModule(null);
        loadModules();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filters and Actions */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '15rem', maxWidth: '24rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search modules by title or course..."
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
              <span>+ Add New Module</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modules Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
            Curriculum Modules Table
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing <strong>{modules.length}</strong> module(s)
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading modules from MySQL...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '4.5rem' }}>ID</th>
                  <th>Module Title</th>
                  <th>Parent Course</th>
                  <th>Sequence</th>
                  <th>Description</th>
                  <th>Assessments</th>
                  <th style={{ textAlign: 'center', width: '12rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.Module_ID}>
                    <td style={{ fontWeight: 600, color: '#475569' }}>#{m.Module_ID}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{m.Module_Name}</td>
                    <td>
                      <span style={{ fontWeight: 500, color: '#2563eb' }}>{m.Course_Name}</span>
                    </td>
                    <td>
                      <span className="badge badge-slate">Order #{m.Sequence_No}</span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{m.Description || '—'}</td>
                    <td>
                      <span className="badge badge-purple">
                        <ClipboardCheck size={11} /> {m.Assessment_Count} Assessment(s)
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                          title="Edit module"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(m)}
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
                          title="Delete module from MySQL"
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

      {/* Add Module Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Course Module">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Parent Course (Foreign Key: COURSE) *
            </label>
            <select
              className="form-select"
              required
              value={formData.Course_ID}
              onChange={(e) => setFormData({ ...formData, Course_ID: e.target.value })}
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.Course_ID} value={c.Course_ID}>{c.Course_Name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Module Title *
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Relational Normalization"
              value={formData.Module_Name}
              onChange={(e) => setFormData({ ...formData, Module_Name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Sequence Number *
            </label>
            <input
              type="number"
              min={1}
              required
              className="form-input"
              value={formData.Sequence_No}
              onChange={(e) => setFormData({ ...formData, Sequence_No: parseInt(e.target.value, 10) })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Module Description
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Module overview and covered concepts..."
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Inserting into MySQL...' : 'Insert Module'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Module Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Module">
        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Parent Course *
            </label>
            <select
              className="form-select"
              required
              value={formData.Course_ID}
              onChange={(e) => setFormData({ ...formData, Course_ID: e.target.value })}
            >
              {courses.map((c) => (
                <option key={c.Course_ID} value={c.Course_ID}>{c.Course_Name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Module Title *
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.Module_Name}
              onChange={(e) => setFormData({ ...formData, Module_Name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Sequence Number
            </label>
            <input
              type="number"
              min={1}
              className="form-input"
              value={formData.Sequence_No}
              onChange={(e) => setFormData({ ...formData, Sequence_No: parseInt(e.target.value, 10) })}
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
        itemName={selectedModule ? selectedModule.Module_Name : ''}
        itemId={selectedModule ? selectedModule.Module_ID : ''}
        itemType="Module"
        isDeleting={isDeleting}
      />
    </div>
  );
};
