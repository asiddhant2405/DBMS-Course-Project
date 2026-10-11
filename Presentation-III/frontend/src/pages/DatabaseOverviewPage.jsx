import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Database,
  RefreshCw,
  Key,
  Link,
  Table,
  CheckCircle2,
  HardDrive,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const DatabaseOverviewPage = ({ showToast }) => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reseedModalOpen, setReseedModalOpen] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getDatabaseOverview();
      if (res.success) {
        setOverview(res);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReseedConfirm = async () => {
    try {
      setReseeding(true);
      const res = await api.resetSeedData();
      if (res.success) {
        showToast(res.message, 'success');
        setReseedModalOpen(false);
        loadOverview();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setReseeding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        Querying MySQL <code>information_schema</code> and table metadata...
      </div>
    );
  }

  if (!overview) return null;

  const { server, tableCounts, schemas } = overview;
  const tableNames = Object.keys(schemas);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Database Status Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.65rem', borderRadius: '0.5rem', backgroundColor: '#1e293b' }}>
            <HardDrive size={24} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pulse-dot" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                MySQL 9.7 Database: <code>{server.database}</code>
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, marginTop: '0.2rem' }}>
              Full referential integrity enforced across 8 relational tables via primary and foreign key constraints.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadOverview} className="btn btn-secondary" style={{ backgroundColor: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
            <RefreshCw size={14} />
            <span>Refresh Schema</span>
          </button>
          <button onClick={() => setReseedModalOpen(true)} className="btn btn-primary" style={{ backgroundColor: '#475569' }}>
            <RotateCcw size={14} />
            <span>Reseed Sample Data</span>
          </button>
        </div>
      </div>

      {/* 8-Table Live Record Count Badges Grid */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
          Table-by-Table Live Row Counts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '0.75rem' }}>
          {tableNames.map((tbl) => (
            <div key={tbl} className="card" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                  {tbl}
                </span>
                <Table size={14} color="#94a3b8" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem' }}>
                {tableCounts[tbl]}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {schemas[tbl].columns.length} columns defined
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual ER Relationship Architecture Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
          Relational ER Architecture Map
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Mapped directly from Presentation Slide 02 & 03. Primary and foreign key dependencies governing data integrity:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1rem' }}>
          {/* Master Entities Card */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc' }}>
            <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>Master Entities</span>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem' }}>
              <li>
                <strong>STUDENT</strong> (PK: <code>Student_ID</code>)
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Anchors student profiles, year levels, contact numbers.</div>
              </li>
              <li>
                <strong>INSTRUCTOR</strong> (PK: <code>Instructor_ID</code>)
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Faculty details including Dr. Alan Turing, Dr. Ada Lovelace.</div>
              </li>
            </ul>
          </div>

          {/* Organizing Entities Card */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc' }}>
            <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>Organizing Entities</span>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem' }}>
              <li>
                <strong>COURSE</strong> (PK: <code>Course_ID</code>)
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>FK: <code>Instructor_ID → INSTRUCTOR</code></div>
              </li>
              <li>
                <strong>MODULE</strong> (PK: <code>Module_ID</code>)
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>FK: <code>Course_ID → COURSE</code></div>
              </li>
              <li>
                <strong>ASSESSMENT</strong> (PK: <code>Assessment_ID</code>)
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>FK: <code>Module_ID → MODULE</code></div>
              </li>
            </ul>
          </div>

          {/* Transactional Entities Card */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc' }}>
            <span className="badge badge-green" style={{ marginBottom: '0.5rem' }}>Transactional / Associative</span>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem' }}>
              <li>
                <strong>ENROLLMENT</strong> (PK: <code>Enrollment_ID</code>)
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>FKs: <code>Student_ID → STUDENT</code>, <code>Course_ID → COURSE</code></div>
              </li>
              <li>
                <strong>PROGRESS</strong> (PK: <code>Progress_ID</code>)
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>FKs: <code>Student_ID → STUDENT</code>, <code>Module_ID → MODULE</code></div>
              </li>
              <li>
                <strong>RESULT</strong> (PK: <code>Result_ID</code>)
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>FKs: <code>Student_ID → STUDENT</code>, <code>Assessment_ID → ASSESSMENT</code></div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Schemas Accordion / Tables */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
          Data Dictionary & Table Structures (information_schema)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(28rem, 1fr))', gap: '1.25rem' }}>
          {tableNames.map((tbl) => {
            const tableMeta = schemas[tbl];
            return (
              <div key={tbl} className="card" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', textTransform: 'uppercase' }}>{tbl}</strong>
                    <span className="badge badge-slate">{tableMeta.rowCount} Rows</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>InnoDB • UTF8MB4</span>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Column</th>
                      <th>Type</th>
                      <th>Key</th>
                      <th>Nullable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableMeta.columns.map((c) => (
                      <tr key={c.name}>
                        <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {c.name}
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                          {c.type}
                        </td>
                        <td>
                          {c.isPrimaryKey && (
                            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                              <Key size={10} /> PK
                            </span>
                          )}
                          {c.isForeignKey && (
                            <span className="badge badge-blue" style={{ fontSize: '0.65rem', marginLeft: c.isPrimaryKey ? '0.25rem' : 0 }}>
                              <Link size={10} /> FK
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: c.isNullable ? '#64748b' : '#dc2626' }}>
                          {c.isNullable ? 'YES' : 'NO'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reseed Confirmation Modal */}
      <Modal isOpen={reseedModalOpen} onClose={() => setReseedModalOpen(false)} title="Reseed Database with Deterministic Sample Data" maxWidth="28rem">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#fffbeb', color: '#d97706' }}>
              <RotateCcw size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500, margin: 0 }}>
                Reset to Presentation Seed Data?
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.45 }}>
                This will re-run <code>database/seed.sql</code> to restore the exact 30 student records, 3 instructors (Dr. Alan Turing with 2 courses), and 60 progress/result records.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setReseedModalOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={reseeding}
              onClick={handleReseedConfirm}
            >
              {reseeding ? 'Executing seed.sql in MySQL...' : 'Confirm Reseed'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
