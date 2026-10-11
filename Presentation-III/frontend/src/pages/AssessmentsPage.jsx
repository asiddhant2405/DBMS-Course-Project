import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ClipboardCheck, Plus, Search, Edit2, Trash2, Award } from 'lucide-react';

const TYPES = ['All', 'Quiz', 'Assignment', 'Exam'];

export const AssessmentsPage = ({ showToast }) => {
  const [assessments, setAssessments] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const [formData, setFormData] = useState({
    Assessment_Name: '',
    Assessment_Type: 'Quiz',
    Max_Marks: 100,
    Module_ID: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadAssessments();
    loadModules();
  }, [typeFilter, moduleFilter]);

  const loadAssessments = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getAssessments({ type: typeFilter, moduleId: moduleFilter, search: searchTerm });
      if (res.success) {
        setAssessments(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async () => {
    try {
      const res = await api.getModules();
      if (res.success) {
        setModules(res.data);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAssessments(search);
  };

  const handleOpenAdd = () => {
    setFormData({
      Assessment_Name: '',
      Assessment_Type: 'Quiz',
      Max_Marks: 50,
      Module_ID: modules.length > 0 ? modules[0].Module_ID : ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (a) => {
    setSelectedAssessment(a);
    setFormData({
      Assessment_Name: a.Assessment_Name,
      Assessment_Type: a.Assessment_Type || 'Quiz',
      Max_Marks: a.Max_Marks || 100,
      Module_ID: a.Module_ID
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (a) => {
    setSelectedAssessment(a);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createAssessment(formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAddOpen(false);
        loadAssessments();
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
      const res = await api.updateAssessment(selectedAssessment.Assessment_ID, formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        loadAssessments();
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
      const res = await api.deleteAssessment(selectedAssessment.Assessment_ID);
      if (res.success) {
        showToast(res.message, 'success');
        setIsDeleteOpen(false);
        setSelectedAssessment(null);
        loadAssessments();
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
                placeholder="Search assessments by title or course..."
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
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Type:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Module:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
              >
                <option value="All">All Modules</option>
                {modules.map((m) => (
                  <option key={m.Module_ID} value={m.Module_ID}>{m.Module_Name}</option>
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
              <span>+ Add Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
            Course Assessments Table
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Showing <strong>{assessments.length}</strong> assessment(s)
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading assessments from MySQL...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '4.5rem' }}>ID</th>
                  <th>Assessment Title</th>
                  <th>Type</th>
                  <th>Module</th>
                  <th>Course</th>
                  <th>Max Marks</th>
                  <th>Submissions</th>
                  <th>Average Score</th>
                  <th style={{ textAlign: 'center', width: '12rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr key={a.Assessment_ID}>
                    <td style={{ fontWeight: 600, color: '#475569' }}>#{a.Assessment_ID}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{a.Assessment_Name}</td>
                    <td>
                      <span className={
                        a.Assessment_Type === 'Quiz' ? 'badge badge-blue' :
                        a.Assessment_Type === 'Assignment' ? 'badge badge-green' : 'badge badge-amber'
                      }>
                        {a.Assessment_Type}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 500 }}>{a.Module_Name}</span></td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{a.Course_Name}</td>
                    <td><strong>{a.Max_Marks}</strong> pts</td>
                    <td>
                      <span className="badge badge-slate">
                        {a.Submissions_Count} submitted
                      </span>
                    </td>
                    <td>
                      {a.Avg_Score !== null ? (
                        <span style={{ fontWeight: 600, color: '#059669' }}>{a.Avg_Score}</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                          title="Edit assessment"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(a)}
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
                          title="Delete assessment from MySQL"
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

      {/* Add Assessment Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Assessment">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Target Module (Foreign Key: MODULE) *
            </label>
            <select
              className="form-select"
              required
              value={formData.Module_ID}
              onChange={(e) => setFormData({ ...formData, Module_ID: e.target.value })}
            >
              <option value="">-- Select Module --</option>
              {modules.map((m) => (
                <option key={m.Module_ID} value={m.Module_ID}>
                  {m.Module_Name} ({m.Course_Name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Assessment Title *
            </label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Midterm SQL Practical"
              value={formData.Assessment_Name}
              onChange={(e) => setFormData({ ...formData, Assessment_Name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Assessment Type *
              </label>
              <select
                className="form-select"
                value={formData.Assessment_Type}
                onChange={(e) => setFormData({ ...formData, Assessment_Type: e.target.value })}
              >
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Exam">Exam</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Maximum Marks *
              </label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                value={formData.Max_Marks}
                onChange={(e) => setFormData({ ...formData, Max_Marks: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Inserting into MySQL...' : 'Insert Assessment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Assessment Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Assessment">
        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Target Module *
            </label>
            <select
              className="form-select"
              required
              value={formData.Module_ID}
              onChange={(e) => setFormData({ ...formData, Module_ID: e.target.value })}
            >
              {modules.map((m) => (
                <option key={m.Module_ID} value={m.Module_ID}>
                  {m.Module_Name} ({m.Course_Name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
              Assessment Title *
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.Assessment_Name}
              onChange={(e) => setFormData({ ...formData, Assessment_Name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Assessment Type *
              </label>
              <select
                className="form-select"
                value={formData.Assessment_Type}
                onChange={(e) => setFormData({ ...formData, Assessment_Type: e.target.value })}
              >
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Exam">Exam</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>
                Maximum Marks *
              </label>
              <input
                type="number"
                min={1}
                required
                className="form-input"
                value={formData.Max_Marks}
                onChange={(e) => setFormData({ ...formData, Max_Marks: parseInt(e.target.value, 10) })}
              />
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedAssessment ? selectedAssessment.Assessment_Name : ''}
        itemId={selectedAssessment ? selectedAssessment.Assessment_ID : ''}
        itemType="Assessment"
        isDeleting={isDeleting}
      />
    </div>
  );
};
