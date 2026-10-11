import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Award, Plus, Search, Edit2, Trash2, ShieldCheck, Layers, LayoutList, CheckCircle2 } from 'lucide-react';

export const ResultsPage = ({ showToast }) => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentFilter, setStudentFilter] = useState('All');
  const [assessmentFilter, setAssessmentFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('normalized-table'); // 'normalized-table' | 'normalized-grouped'

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const [formData, setFormData] = useState({
    Student_ID: '',
    Assessment_ID: '',
    Score: '',
    Attempt_No: 1,
    Result_Date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadResults();
    loadDropdowns();
  }, [studentFilter, assessmentFilter]);

  const loadResults = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await api.getResults({
        studentId: studentFilter,
        assessmentId: assessmentFilter,
        search: searchTerm
      });
      if (res.success) {
        setResults(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [sRes, aRes] = await Promise.all([api.getStudents(), api.getAssessments()]);
      if (sRes.success) setStudents(sRes.data);
      if (aRes.success) setAssessments(aRes.data);
    } catch (err) {
      console.error('Error fetching dropdowns:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadResults(search);
  };

  const handleOpenAdd = () => {
    setFormData({
      Student_ID: students.length > 0 ? students[0].Student_ID : '',
      Assessment_ID: assessments.length > 0 ? assessments[0].Assessment_ID : '',
      Score: '85.0',
      Attempt_No: 1,
      Result_Date: new Date().toISOString().split('T')[0]
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (r) => {
    setSelectedResult(r);
    setFormData({
      Student_ID: r.Student_ID,
      Assessment_ID: r.Assessment_ID,
      Score: r.Score !== null ? r.Score : '',
      Attempt_No: r.Attempt_No || 1,
      Result_Date: r.Result_Date ? r.Result_Date.split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (r) => {
    setSelectedResult(r);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.createResult(formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsAddOpen(false);
        loadResults();
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
      const res = await api.updateResult(selectedResult.Result_ID, formData);
      if (res.success) {
        showToast(res.message, 'success');
        setIsEditOpen(false);
        loadResults();
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
      const res = await api.deleteResult(selectedResult.Result_ID);
      if (res.success) {
        showToast(res.message, 'success');
        setIsDeleteOpen(false);
        setSelectedResult(null);
        loadResults();
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
    results.forEach((r) => {
      const sId = r.Student_ID;
      if (!map.has(sId)) {
        map.set(sId, {
          studentId: sId,
          studentName: r.Student_Name,
          department: r.Department,
          records: []
        });
      }
      map.get(sId).records.push(r);
    });
    return Array.from(map.values());
  }, [results]);

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
              <span>Database Normalization Applied (3NF & BCNF)</span>
              <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>Redundancy Eliminated</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '0.2rem', lineHeight: 1.4, maxWidth: '52rem' }}>
              <strong>Transitive Dependencies Removed:</strong> Assessment Type & Module details belong to the <code>ASSESSMENT</code> entity and have been eliminated from the <code>RESULT</code> relation.
              Use <strong>Normalized Grouped View</strong> to eliminate repeating student tuples.
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
                placeholder="Search by student name or assessment..."
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
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Assessment:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                value={assessmentFilter}
                onChange={(e) => setAssessmentFilter(e.target.value)}
              >
                <option value="All">All Assessments</option>
                {assessments.map((a) => (
                  <option key={a.Assessment_ID} value={a.Assessment_ID}>{a.Assessment_Name}</option>
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
              <span>+ Record New Result</span>
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
                Normalized Assessment Results Table
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                (Pure 3NF: Transitive attributes omitted)
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing <strong>{results.length}</strong> result record(s)
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Loading assessment results from MySQL...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              No assessment results found matching current criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '4.5rem' }}>Result ID</th>
                    <th>Student Name</th>
                    <th>Assessment Name</th>
                    <th>Score Obtained</th>
                    <th>Attempt #</th>
                    <th>Evaluation Date</th>
                    <th style={{ textAlign: 'center', width: '11rem' }}>Database Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.Result_ID}>
                      <td style={{ fontWeight: 600, color: '#475569' }}>#{r.Result_ID}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>
                        <div>{r.Student_Name}</div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Student ID #{r.Student_ID}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: '#1e293b' }}>{r.Assessment_Name}</span>
                      </td>
                      <td>
                        {r.Score !== null ? (
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                            {r.Score} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>/ {r.Max_Marks} marks</span>
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Pending Evaluation</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-slate">Attempt {r.Attempt_No || 1}</span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {r.Result_Date ? r.Result_Date.split('T')[0] : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {/* HIGHLY VISIBLE ACTION BUTTONS */}
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenEdit(r)}
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
                            title="Edit this score"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          {/* HIGHLY VISIBLE DELETE BUTTON */}
                          <button
                            onClick={() => handleOpenDelete(r)}
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
                            title="Delete this result record from MySQL"
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
                        Department: <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{group.department}</span>
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                    {group.records.length} Assessment(s) Completed
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '4.5rem' }}>ID</th>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Attempt</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'center', width: '10rem' }}>Database Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.records.map((r) => (
                        <tr key={r.Result_ID}>
                          <td style={{ fontWeight: 600, color: '#64748b' }}>#{r.Result_ID}</td>
                          <td style={{ fontWeight: 500, color: '#1e293b' }}>{r.Assessment_Name}</td>
                          <td>
                            <strong>{r.Score}</strong> <span style={{ color: '#64748b', fontSize: '0.75rem' }}>/ {r.Max_Marks}</span>
                          </td>
                          <td><span className="badge badge-slate">Attempt {r.Attempt_No || 1}</span></td>
                          <td style={{ color: '#64748b' }}>{r.Result_Date ? r.Result_Date.split('T')[0] : '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button
                                onClick={() => handleOpenEdit(r)}
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
                                onClick={() => handleOpenDelete(r)}
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
                                title="Delete this result"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Result Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Record New Assessment Result (Insert Operation)">
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
              Assessment (Foreign Key: ASSESSMENT.Assessment_ID) *
            </label>
            <select
              className="form-select"
              required
              value={formData.Assessment_ID}
              onChange={(e) => setFormData({ ...formData, Assessment_ID: e.target.value })}
            >
              <option value="">-- Select Assessment --</option>
              {assessments.map((a) => (
                <option key={a.Assessment_ID} value={a.Assessment_ID}>
                  {a.Assessment_Name} (Max: {a.Max_Marks} marks)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Score Obtained *
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                required
                className="form-input"
                placeholder="e.g. 85.0"
                value={formData.Score}
                onChange={(e) => setFormData({ ...formData, Score: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Attempt No
              </label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={formData.Attempt_No}
                onChange={(e) => setFormData({ ...formData, Attempt_No: parseInt(e.target.value, 10) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Evaluation Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.Result_Date}
                onChange={(e) => setFormData({ ...formData, Result_Date: e.target.value })}
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

      {/* Edit Result Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Assessment Result">
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
              Assessment *
            </label>
            <select
              className="form-select"
              required
              value={formData.Assessment_ID}
              onChange={(e) => setFormData({ ...formData, Assessment_ID: e.target.value })}
            >
              {assessments.map((a) => (
                <option key={a.Assessment_ID} value={a.Assessment_ID}>
                  {a.Assessment_Name} (Max: {a.Max_Marks})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Score
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                className="form-input"
                value={formData.Score}
                onChange={(e) => setFormData({ ...formData, Score: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Attempt No
              </label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={formData.Attempt_No}
                onChange={(e) => setFormData({ ...formData, Attempt_No: parseInt(e.target.value, 10) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Result Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.Result_Date}
                onChange={(e) => setFormData({ ...formData, Result_Date: e.target.value })}
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
        itemName={selectedResult ? `${selectedResult.Student_Name} - ${selectedResult.Assessment_Name}` : ''}
        itemId={selectedResult ? selectedResult.Result_ID : ''}
        itemType="Result"
        isDeleting={isDeleting}
      />
    </div>
  );
};
