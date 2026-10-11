import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { TrendingUp, Plus, Search, Edit2, Trash2, ShieldCheck, Layers, LayoutList, Clock } from 'lucide-react';

const STATUSES = ['All', 'Not Started', 'In Progress', 'Completed'];

export const ProgressPage = ({ showToast }) => {
  const [progressList, setProgressList] = useState([]);
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('normalized-table'); // 'normalized-table' | 'normalized-grouped'

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState(null);

  const [formData, setFormData] = useState({
    Student_ID: '',
    Module_ID: '',
    Progress_Date: new Date().toISOString().split('T')[0],
    Completion_Percent: 50,
    Status: 'In Progress',
    Time_Spent: 60
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProgress();
    loadDropdowns();
  }, [statusFilter]);

  const loadProgress = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getProgress({ status: statusFilter, search: searchTerm });
      if (res.success) {
        setProgressList(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [sRes, mRes] = await Promise.all([api.getStudents(), api.getModules()]);
      if (sRes.success) setStudents(sRes.data);
      if (mRes.success) setModules(mRes.data);
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProgress(search);
  };

  const handleOpenAdd = () => {
    setFormData({
      Student_ID: students.length > 0 ? students[0].Student_ID : '',
      Module_ID: modules.length > 0 ? modules[0].Module_ID : '',
      Progress_Date: new Date().toISOString().split('T')[0],
      Completion_Percent: 100,
      Status: 'Completed',
      Time_Spent: 120
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p) => {
    setSelectedProgress(p);
    setFormData({
      Student_ID: p.Student_ID,
      Module_ID: p.Module_ID,
      Progress_Date: p.Progress_Date ? p.Progress_Date.split('T')[0] : '',
      Completion_Percent: p.Completion_Percent,
      Status: p.Status,
      Time_Spent: p.Time_Spent
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (p) => {
    setSelectedProgress(p);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Dynamically compute Status from Completion_Percent to eliminate update anomaly
      const percent = parseFloat(formData.Completion_Percent);
      const computedStatus = percent >= 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Not Started';
      const payload = { ...formData, Status: computedStatus };

      const res = await api.createProgress(payload);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAddOpen(false);
        loadProgress();
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
      const percent = parseFloat(formData.Completion_Percent);
      const computedStatus = percent >= 100 ? 'Completed' : percent > 0 ? 'In Progress' : 'Not Started';
      const payload = { ...formData, Status: computedStatus };

      const res = await api.updateProgress(selectedProgress.Progress_ID, payload);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        loadProgress();
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
      const res = await api.deleteProgress(selectedProgress.Progress_ID);
      if (res.success) {
        showToast(res.message, 'success');
        setIsDeleteOpen(false);
        setSelectedProgress(null);
        loadProgress();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Grouped by Student to eliminate repetitive student details across rows
  const groupedByStudent = useMemo(() => {
    const map = new Map();
    progressList.forEach((p) => {
      const sId = p.Student_ID;
      if (!map.has(sId)) {
        map.set(sId, {
          studentId: sId,
          studentName: p.Student_Name,
          records: []
        });
      }
      map.get(sId).records.push(p);
    });
    return Array.from(map.values());
  }, [progressList]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Normalization & Academic Integrity Callout */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ padding: '0.4rem', backgroundColor: '#dcfce7', borderRadius: '0.375rem', color: '#16a34a', marginTop: '0.1rem' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Learning Progress Normalization (3NF & BCNF)</span>
              <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>Redundancy Eliminated</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '0.2rem', lineHeight: 1.4, maxWidth: '52rem' }}>
              <strong>Transitive & Functional Dependencies Normalized:</strong> Course name removed from progress relation (transitive via <code>Module_ID</code>). Status is derived directly from <code>Completion_Percent</code> to eliminate non-prime attribute update anomalies.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#dcfce7', padding: '0.25rem', borderRadius: '0.5rem' }}>
          <button
            onClick={() => setViewMode('normalized-table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'normalized-table' ? '#ffffff' : 'transparent',
              color: viewMode === 'normalized-table' ? '#166534' : '#15803d',
              boxShadow: viewMode === 'normalized-table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <LayoutList size={14} />
            <span>3NF Flat Table</span>
          </button>
          <button
            onClick={() => setViewMode('normalized-grouped')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'normalized-grouped' ? '#ffffff' : 'transparent',
              color: viewMode === 'normalized-grouped' ? '#166534' : '#15803d',
              boxShadow: viewMode === 'normalized-grouped' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <Layers size={14} />
            <span>Grouped by Student (Zero Duplicate Names)</span>
          </button>
        </div>
      </div>

      {/* Primary Action & Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '15rem', maxWidth: '24rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search progress by student or module..."
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
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Status:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* HIGHLY VISIBLE INSERT ACTION BUTTON */}
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
              <span>+ Record Progress Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: NORMALIZED 3NF FLAT TABLE */}
      {viewMode === 'normalized-table' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                Normalized Learning Progress Tracking Table
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                (Pure 3NF: Transitive Course attribute removed)
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing <strong>{progressList.length}</strong> progress record(s)
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Loading progress records from MySQL...
            </div>
          ) : progressList.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              No progress records found matching current criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '4.5rem' }}>Progress ID</th>
                    <th>Student</th>
                    <th>Module Name</th>
                    <th style={{ width: '13rem' }}>Completion (Normalized)</th>
                    <th>Time Spent</th>
                    <th>Date Logged</th>
                    <th style={{ textAlign: 'center', width: '11rem' }}>Database Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {progressList.map((p) => {
                    const isCompleted = p.Completion_Percent >= 100;
                    const inProgress = p.Completion_Percent > 0 && p.Completion_Percent < 100;
                    return (
                      <tr key={p.Progress_ID}>
                        <td style={{ fontWeight: 600, color: '#475569' }}>#{p.Progress_ID}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>
                          <div>{p.Student_Name}</div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Student ID #{p.Student_ID}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, color: '#1e293b' }}>{p.Module_Name}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.Completion_Percent}%</span>
                              <span className={isCompleted ? 'badge badge-green' : inProgress ? 'badge badge-blue' : 'badge badge-slate'}>
                                {isCompleted ? 'Completed' : inProgress ? 'In Progress' : 'Not Started'}
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${p.Completion_Percent}%`,
                                  height: '100%',
                                  backgroundColor: isCompleted ? '#10b981' : inProgress ? '#2563eb' : '#94a3b8'
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#475569', fontSize: '0.8rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} color="#64748b" />
                            {p.Time_Spent} mins
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {p.Progress_Date ? p.Progress_Date.split('T')[0] : '—'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {/* HIGHLY VISIBLE ACTION BUTTONS */}
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: '0.375rem',
                                cursor: 'pointer'
                              }}
                              title="Edit progress"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>

                            {/* HIGHLY VISIBLE DELETE BUTTON */}
                            <button
                              onClick={() => handleOpenDelete(p)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #f87171',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.1)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                                e.currentTarget.style.color = '#ffffff';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fee2e2';
                                e.currentTarget.style.color = '#b91c1c';
                              }}
                              title="Delete this progress record from MySQL"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: NORMALIZED HIERARCHICAL GROUPED VIEW (ZERO REDUNDANT STUDENT NAMES) */}
      {viewMode === 'normalized-grouped' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', padding: '0 0.25rem' }}>
            Showing <strong>{groupedByStudent.length}</strong> unique student profiles. Each student appears exactly once, eliminating duplicate student rows:
          </div>

          {loading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              Loading normalized groupings from MySQL...
            </div>
          ) : (
            groupedByStudent.map((group) => (
              <div key={group.studentId} className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.65rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      #{group.studentId}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                        {group.studentName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Student Profile ID: #{group.studentId}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                    {group.records.length} Module(s) Enrolled & Tracked
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '4.5rem' }}>ID</th>
                        <th>Module Name</th>
                        <th style={{ width: '12rem' }}>Completion</th>
                        <th>Time Spent</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'center', width: '10rem' }}>Database Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.records.map((p) => {
                        const isCompleted = p.Completion_Percent >= 100;
                        const inProgress = p.Completion_Percent > 0 && p.Completion_Percent < 100;
                        return (
                          <tr key={p.Progress_ID}>
                            <td style={{ fontWeight: 600, color: '#64748b' }}>#{p.Progress_ID}</td>
                            <td style={{ fontWeight: 500, color: '#1e293b' }}>{p.Module_Name}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ flex: 1, height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${p.Completion_Percent}%`,
                                      height: '100%',
                                      backgroundColor: isCompleted ? '#10b981' : inProgress ? '#2563eb' : '#94a3b8'
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, minWidth: '2.5rem' }}>
                                  {p.Completion_Percent}%
                                </span>
                              </div>
                            </td>
                            <td style={{ color: '#64748b' }}>{p.Time_Spent} mins</td>
                            <td style={{ color: '#64748b' }}>{p.Progress_Date ? p.Progress_Date.split('T')[0] : '—'}</td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    backgroundColor: '#f1f5f9',
                                    color: '#334155',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Edit2 size={12} />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => handleOpenDelete(p)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.25rem 0.6rem',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    backgroundColor: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #f87171',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete this progress record"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Progress Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record New Progress Entry (Insert Operation)">
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Student (Foreign Key: STUDENT.Student_ID) *
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
                  #{s.Student_ID} - {s.Name} ({s.Department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Module (Foreign Key: MODULE.Module_ID) *
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
                  #{m.Module_ID} - {m.Module_Name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Completion Percent (0-100) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                className="form-input"
                value={formData.Completion_Percent}
                onChange={(e) => setFormData({ ...formData, Completion_Percent: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Time Spent (Mins)
              </label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={formData.Time_Spent}
                onChange={(e) => setFormData({ ...formData, Time_Spent: parseInt(e.target.value, 10) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Progress Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.Progress_Date}
                onChange={(e) => setFormData({ ...formData, Progress_Date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '0.375rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Inserting into MySQL...' : 'Confirm Insert into Database'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Progress Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Learning Progress">
        <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
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
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Module *
            </label>
            <select
              className="form-select"
              required
              value={formData.Module_ID}
              onChange={(e) => setFormData({ ...formData, Module_ID: e.target.value })}
            >
              {modules.map((m) => (
                <option key={m.Module_ID} value={m.Module_ID}>
                  #{m.Module_ID} - {m.Module_Name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Completion Percent (0-100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="form-input"
                value={formData.Completion_Percent}
                onChange={(e) => setFormData({ ...formData, Completion_Percent: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Time Spent (Mins)
              </label>
              <input
                type="number"
                min={0}
                className="form-input"
                value={formData.Time_Spent}
                onChange={(e) => setFormData({ ...formData, Time_Spent: parseInt(e.target.value, 10) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Progress Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.Progress_Date}
                onChange={(e) => setFormData({ ...formData, Progress_Date: e.target.value })}
              />
            </div>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedProgress ? `${selectedProgress.Student_Name} - ${selectedProgress.Module_Name}` : ''}
        itemId={selectedProgress ? selectedProgress.Progress_ID : ''}
        itemType="Progress"
        isDeleting={isDeleting}
      />
    </div>
  );
};
