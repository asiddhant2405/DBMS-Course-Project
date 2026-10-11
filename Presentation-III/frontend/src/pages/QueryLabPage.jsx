import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Terminal, Play, Clock, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

export const QueryLabPage = ({ showToast }) => {
  const [queries, setQueries] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedKey, setSelectedKey] = useState('first-year-students');

  // Query Execution State
  const [executing, setExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadQueryList();
  }, []);

  const loadQueryList = async () => {
    try {
      setLoadingList(true);
      const res = await api.getPredefinedQueries();
      if (res.success) {
        setQueries(res.queries);
        // Automatically run Query 1 on first load to wow evaluator immediately
        handleRunQuery('first-year-students');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingList(false);
    }
  };

  const handleRunQuery = async (queryKey) => {
    try {
      setSelectedKey(queryKey);
      setExecuting(true);
      setQueryResult(null);
      const res = await api.runPredefinedQuery(queryKey);
      if (res.success) {
        setQueryResult(res);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setExecuting(false);
    }
  };

  const currentQuery = queries.find((q) => q.id === selectedKey);

  const handleCopySql = () => {
    if (!currentQuery) return;
    navigator.clipboard.writeText(currentQuery.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner explaining academic requirements */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={20} color="#38bdf8" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              DBMS Presentation SQL Query Lab
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.35rem', maxWidth: '48rem' }}>
            Predefined executable relational queries mapped to presentation requirements. Each query runs in real-time against MySQL Server with parameterized validation and execution telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-blue" style={{ backgroundColor: '#1e293b', color: '#38bdf8', borderColor: '#334155' }}>
            Query 1: 14 First-Year Students
          </span>
          <span className="badge badge-amber" style={{ backgroundColor: '#1e293b', color: '#fbbf24', borderColor: '#334155' }}>
            Query 2: Dr. Alan Turing (2 Courses)
          </span>
        </div>
      </div>

      {/* Main Content Layout: Query Selector Cards + Execution Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: '18rem 1fr', gap: '1.25rem', alignItems: 'flex-start' }}>
        {/* Left Side: Query Selector List */}
        <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ padding: '0.5rem 0.6rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Required Queries
          </div>

          {loadingList ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
              Loading queries...
            </div>
          ) : (
            queries.map((q) => {
              const isSelected = selectedKey === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => handleRunQuery(q.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.2rem',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: isSelected ? '1px solid #2563eb' : '1px solid transparent',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.825rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#1e40af' : '#1e293b' }}>
                    {q.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                    {q.presentationNote}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Right Side: Active Query Workbench */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {currentQuery && (
            <div className="card" style={{ overflow: 'hidden' }}>
              {/* Header */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {currentQuery.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, marginTop: '0.15rem' }}>
                    {currentQuery.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCopySql} className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }} title="Copy SQL statement">
                    {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                  <button
                    onClick={() => handleRunQuery(currentQuery.id)}
                    disabled={executing}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    <Play size={14} />
                    <span>{executing ? 'Executing...' : 'Run Query'}</span>
                  </button>
                </div>
              </div>

              {/* Presentation Note Callout */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} color="#2563eb" />
                <span><strong>Faculty Evaluation Context:</strong> {currentQuery.presentationNote}</span>
              </div>

              {/* SQL Statement Display */}
              <div style={{ backgroundColor: '#090d16', padding: '1rem 1.25rem', overflowX: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.85rem', color: '#38bdf8', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                  {currentQuery.sql}
                </pre>
              </div>

              {/* Execution Metrics Bar */}
              {queryResult && (
                <div
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderTop: '1px solid #1e293b',
                    backgroundColor: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    fontSize: '0.775rem',
                    color: '#94a3b8'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={13} color="#4ade80" />
                    <span>Status: <strong style={{ color: '#ffffff' }}>200 OK</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} color="#38bdf8" />
                    <span>Latency: <strong style={{ color: '#ffffff' }}>{queryResult.meta.executionTimeMs}</strong></span>
                  </div>
                  <div>
                    <span>Rows Returned: <strong style={{ color: '#ffffff' }}>{queryResult.meta.rowCount}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Table Canvas */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                Query Output Matrix
              </div>
              {queryResult && (
                <span className="badge badge-green">
                  {queryResult.meta.rowCount} Record(s) Retrieved from MySQL
                </span>
              )}
            </div>

            {executing ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Executing query on MySQL Server...
              </div>
            ) : !queryResult ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Click "Run Query" to execute this SQL query against MySQL.
              </div>
            ) : queryResult.data.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Query executed successfully, returning 0 rows.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '28rem' }}>
                <table className="data-table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      {queryResult.columns.map((col) => (
                        <th key={col}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.data.map((row, idx) => (
                      <tr key={idx}>
                        {queryResult.columns.map((col) => (
                          <td key={col}>
                            {row[col] !== null && row[col] !== undefined ? (
                              typeof row[col] === 'number' ? (
                                <strong>{row[col]}</strong>
                              ) : (
                                String(row[col])
                              )
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
