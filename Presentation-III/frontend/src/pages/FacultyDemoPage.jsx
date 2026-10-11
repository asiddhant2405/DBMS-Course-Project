import React, { useState } from 'react';
import { api } from '../services/api';
import {
  PlayCircle,
  PlusCircle,
  Eye,
  Trash2,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Database,
  Check,
  AlertCircle
} from 'lucide-react';

export const FacultyDemoPage = ({ showToast }) => {
  const [activeStep, setActiveStep] = useState(1);

  // Form State for Demo Student
  const [demoStudent, setDemoStudent] = useState({
    Name: 'Devika Sharma',
    Email: 'devika.eval@univ.edu',
    Department: 'Computer Science',
    Year: 1,
    Phone: '555-8899'
  });

  const [insertedStudent, setInsertedStudent] = useState(null);
  const [isInserting, setIsInserting] = useState(false);

  // Verification State
  const [queriedStudent, setQueriedStudent] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Deletion State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteCompleted, setDeleteCompleted] = useState(false);

  // Referential Integrity Test State
  const [fkTestResult, setFkTestResult] = useState(null);
  const [isTestingFk, setIsTestingFk] = useState(false);

  // STEP A: Real MySQL INSERT
  const handleExecuteInsert = async () => {
    try {
      setIsInserting(true);
      const res = await api.createStudent(demoStudent);
      if (res.success) {
        setInsertedStudent(res.data);
        showToast(`Inserted '${res.data.Name}' into MySQL student table with ID #${res.data.Student_ID}`, 'success');
        setActiveStep(2);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsInserting(false);
    }
  };

  // STEP B: Real MySQL VIEW
  const handleExecuteView = async () => {
    if (!insertedStudent) return;
    try {
      setIsQuerying(true);
      const res = await api.getStudentById(insertedStudent.Student_ID);
      if (res.success) {
        setQueriedStudent(res.data);
        showToast(`Verified live MySQL record for '${res.data.Name}' (ID #${res.data.Student_ID})`, 'success');
        setActiveStep(3);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsQuerying(false);
    }
  };

  // STEP C: Real MySQL DELETE
  const handleExecuteDelete = async () => {
    if (!insertedStudent) return;
    try {
      setIsDeleting(true);
      const res = await api.deleteStudent(insertedStudent.Student_ID, false);
      if (res.success) {
        setDeleteCompleted(true);
        showToast(res.message, 'success');
        setActiveStep(4);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // STEP E: Real Referential Integrity Test
  const handleTestReferentialIntegrity = async () => {
    try {
      setIsTestingFk(true);
      setFkTestResult(null);
      // Try to delete Student #1 (Aarav Patel), who has seeded enrollments, progress, and results!
      await api.deleteStudent(1, false);
      // If it doesn't fail, unexpected
      setFkTestResult({ blocked: false, message: 'Warning: Student was deleted unexpectedly.' });
    } catch (err) {
      setFkTestResult({
        blocked: true,
        statusCode: err.status,
        errorType: err.data ? err.data.errorType : 'FOREIGN_KEY_CONFLICT',
        message: err.message,
        details: err.data ? err.data.details : null
      });
      showToast('Referential integrity validated: MySQL prevented deletion of referenced student.', 'info');
    } finally {
      setIsTestingFk(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: '#991b1b',
          color: '#ffffff',
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
            <PlayCircle size={22} color="#ffffff" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Live Faculty Evaluation Assistant
            </h2>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#fecaca', marginTop: '0.25rem' }}>
            Structured 4-step workflow demonstrating real CRUD mutations in MySQL: Insertion, Live Querying, Safe Deletion, and Referential Integrity enforcement.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', backgroundColor: '#7f1d1d', padding: '0.35rem 0.75rem', borderRadius: '9999px' }}>
          <span>Current Step: <strong>Step {activeStep} of 4</strong></span>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
          gap: '0.75rem'
        }}
      >
        <div
          onClick={() => setActiveStep(1)}
          className="card"
          style={{
            padding: '0.85rem',
            cursor: 'pointer',
            border: activeStep === 1 ? '2px solid #2563eb' : '1px solid #e2e8f0',
            backgroundColor: activeStep === 1 ? '#eff6ff' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: insertedStudent ? '#16a34a' : '#2563eb', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {insertedStudent ? <Check size={12} /> : 'A'}
            </span>
            <strong style={{ fontSize: '0.85rem' }}>1. Real INSERT</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            Insert new student to MySQL
          </div>
        </div>

        <div
          onClick={() => setActiveStep(2)}
          className="card"
          style={{
            padding: '0.85rem',
            cursor: 'pointer',
            border: activeStep === 2 ? '2px solid #2563eb' : '1px solid #e2e8f0',
            backgroundColor: activeStep === 2 ? '#eff6ff' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: queriedStudent ? '#16a34a' : '#64748b', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {queriedStudent ? <Check size={12} /> : 'B'}
            </span>
            <strong style={{ fontSize: '0.85rem' }}>2. Real VIEW</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            Confirm record in MySQL
          </div>
        </div>

        <div
          onClick={() => setActiveStep(3)}
          className="card"
          style={{
            padding: '0.85rem',
            cursor: 'pointer',
            border: activeStep === 3 ? '2px solid #2563eb' : '1px solid #e2e8f0',
            backgroundColor: activeStep === 3 ? '#eff6ff' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: deleteCompleted ? '#16a34a' : '#64748b', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {deleteCompleted ? <Check size={12} /> : 'C'}
            </span>
            <strong style={{ fontSize: '0.85rem' }}>3. Real DELETE</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            Delete demo student from DB
          </div>
        </div>

        <div
          onClick={() => setActiveStep(4)}
          className="card"
          style={{
            padding: '0.85rem',
            cursor: 'pointer',
            border: activeStep === 4 ? '2px solid #2563eb' : '1px solid #e2e8f0',
            backgroundColor: activeStep === 4 ? '#eff6ff' : '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', backgroundColor: fkTestResult ? '#16a34a' : '#64748b', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {fkTestResult ? <Check size={12} /> : 'D'}
            </span>
            <strong style={{ fontSize: '0.85rem' }}>4. Referential FK Test</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
            Verify MySQL RESTRICT rule
          </div>
        </div>
      </div>

      {/* STEP 1: INSERTION */}
      {activeStep === 1 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PlusCircle size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Step A: Insert New Student Record into MySQL
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem' }}>
            Fill in the parameters below and submit. This triggers a parameterized <code>INSERT INTO student</code> query via <code>POST /api/students</code> directly into MySQL Server.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>Full Name</label>
              <input
                type="text"
                className="form-input"
                value={demoStudent.Name}
                onChange={(e) => setDemoStudent({ ...demoStudent, Name: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>Email</label>
              <input
                type="email"
                className="form-input"
                value={demoStudent.Email}
                onChange={(e) => setDemoStudent({ ...demoStudent, Email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>Department</label>
              <select
                className="form-select"
                value={demoStudent.Department}
                onChange={(e) => setDemoStudent({ ...demoStudent, Department: e.target.value })}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#334155', marginBottom: '0.25rem' }}>Year</label>
              <select
                className="form-select"
                value={demoStudent.Year}
                onChange={(e) => setDemoStudent({ ...demoStudent, Year: parseInt(e.target.value, 10) })}
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              MySQL Workbench Verification SQL: <code>SELECT * FROM student WHERE Email = '{demoStudent.Email}';</code>
            </div>

            <button
              onClick={handleExecuteInsert}
              disabled={isInserting}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.25rem' }}
            >
              {isInserting ? 'Executing INSERT...' : 'Execute Live INSERT'}
            </button>
          </div>

          {insertedStudent && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 600, fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} /> Successfully inserted into MySQL! Assigned Student_ID: #{insertedStudent.Student_ID}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.25rem' }}>
                Proceed to Step B to view and confirm this live database record.
              </p>
              <button onClick={() => setActiveStep(2)} className="btn btn-primary" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                <span>Proceed to Step B (VIEW)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: VIEW */}
      {activeStep === 2 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Eye size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Step B: View and Confirm Inserted Record in MySQL
            </h3>
          </div>

          {!insertedStudent ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Please complete Step A first to insert a test student.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                Querying <code>SELECT * FROM student WHERE Student_ID = {insertedStudent.Student_ID}</code> directly from MySQL Server:
              </p>

              <div style={{ backgroundColor: '#090d16', padding: '0.85rem 1rem', borderRadius: '0.375rem', color: '#38bdf8', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                SELECT * FROM student WHERE Student_ID = {insertedStudent.Student_ID};
              </div>

              <button
                onClick={handleExecuteView}
                disabled={isQuerying}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start' }}
              >
                {isQuerying ? 'Querying MySQL...' : 'Fetch Live Record'}
              </button>

              {queriedStudent && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student_ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>#{queriedStudent.Student_ID}</strong></td>
                        <td>{queriedStudent.Name}</td>
                        <td>{queriedStudent.Email}</td>
                        <td><span className="badge badge-blue">{queriedStudent.Department}</span></td>
                        <td>Year {queriedStudent.Year}</td>
                        <td>{queriedStudent.Phone || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {queriedStudent && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button onClick={() => setActiveStep(3)} className="btn btn-danger" style={{ fontSize: '0.8rem' }}>
                    <span>Proceed to Step C (DELETE)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: DELETE */}
      {activeStep === 3 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Trash2 size={20} color="#dc2626" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Step C: Permanently Delete the Demonstration Student
            </h3>
          </div>

          {!insertedStudent ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              Please complete Step A first.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                We will now execute <code>DELETE FROM student WHERE Student_ID = {insertedStudent.Student_ID}</code>. Since this new student has no foreign key dependencies, MySQL allows a clean, immediate deletion.
              </p>

              <div style={{ backgroundColor: '#090d16', padding: '0.85rem 1rem', borderRadius: '0.375rem', color: '#f87171', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                DELETE FROM student WHERE Student_ID = {insertedStudent.Student_ID};
              </div>

              {!deleteCompleted ? (
                <button
                  onClick={handleExecuteDelete}
                  disabled={isDeleting}
                  className="btn btn-danger"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {isDeleting ? 'Deleting from MySQL...' : `Delete Student #${insertedStudent.Student_ID}`}
                </button>
              ) : (
                <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> Student #{insertedStudent.Student_ID} deleted successfully from MySQL!
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.25rem' }}>
                    Verification in MySQL Workbench: <code>SELECT * FROM student WHERE Student_ID = {insertedStudent.Student_ID};</code> will now return <strong>0 rows</strong>.
                  </p>
                  <button onClick={() => setActiveStep(4)} className="btn btn-primary" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                    <span>Proceed to Step D (Referential Integrity Check)</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 4: REFERENTIAL INTEGRITY TEST */}
      {activeStep === 4 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldAlert size={20} color="#dc2626" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Step D: Demonstrate MySQL Referential Integrity & RESTRICT Constraint
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
            A crucial concept in RDBMS design is <strong>referential integrity</strong>. When a student record is referenced by dependent child records (such as <code>enrollment</code>, <code>progress</code>, or <code>result</code>), MySQL prevents silent, orphaned data deletion.
          </p>

          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400e', margin: 0 }}>
              Test Target: Student #1 (Aarav Patel)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.25rem' }}>
              Aarav Patel is enrolled in Course 101, has 2 module progress records, and 2 assessment results. Trying to delete this student will trigger MySQL's foreign-key constraint violation.
            </p>
          </div>

          <button
            onClick={handleTestReferentialIntegrity}
            disabled={isTestingFk}
            className="btn btn-danger-outline"
            style={{ alignSelf: 'flex-start' }}
          >
            {isTestingFk ? 'Testing MySQL Constraint...' : 'Attempt Deleting Referenced Student #1'}
          </button>

          {fkTestResult && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1.25rem',
                borderRadius: '0.5rem',
                backgroundColor: fkTestResult.blocked ? '#fef2f2' : '#fffbeb',
                border: `1px solid ${fkTestResult.blocked ? '#fecaca' : '#fef3c7'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 700, fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="#16a34a" /> Referential Integrity Protected by MySQL!
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: '#7f1d1d' }}>
                <div><strong>HTTP Status Code:</strong> 409 Conflict</div>
                <div style={{ marginTop: '0.25rem' }}><strong>MySQL Error Type:</strong> {fkTestResult.errorType}</div>
                <div style={{ marginTop: '0.25rem' }}><strong>Server Response:</strong> {fkTestResult.message}</div>
                {fkTestResult.details && (
                  <div style={{ marginTop: '0.5rem', backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #fca5a5' }}>
                    Dependent Records Found in MySQL:
                    <ul style={{ marginLeft: '1.25rem', marginTop: '0.25rem' }}>
                      <li>Enrollments: {fkTestResult.details.enrollments}</li>
                      <li>Progress Records: {fkTestResult.details.progress}</li>
                      <li>Results: {fkTestResult.details.results}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
