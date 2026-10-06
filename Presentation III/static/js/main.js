// Interactive features for the Online Learning System Dashboard
// Developed by Siddhant Agarwal (25WU0102262)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Live Search/Filter for Student Table
    const searchInput = document.getElementById('studentSearchInput');
    const tableBody = document.getElementById('studentTableBody');
    const countDisplay = document.getElementById('visibleStudentCount');
    const emptyRow = document.getElementById('tableSearchEmptyState');

    if (searchInput && tableBody) {
        const rows = tableBody.querySelectorAll('tr.student-row');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            let visibleCount = 0;

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            if (countDisplay) {
                countDisplay.textContent = visibleCount;
            }

            if (emptyRow) {
                emptyRow.style.display = (visibleCount === 0 && rows.length > 0) ? '' : 'none';
            }
        });
    }

    // 2. Delegate Details Button, Delete Button, and Row Clicks
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            // Priority 1: Delete button clicked
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                deleteStudent(deleteBtn);
                return;
            }

            // Priority 2: View Details button clicked
            const detailsBtn = e.target.closest('[data-action="view-details"]');
            if (detailsBtn && detailsBtn.dataset.studentId) {
                e.stopPropagation();
                openStudentDetails(detailsBtn.dataset.studentId);
                return;
            }

            // Prevent modal if user clicked any form element
            if (e.target.closest('form')) {
                return;
            }

            // Priority 3: Table row clicked to view details
            const row = e.target.closest('tr.student-row');
            if (row && row.dataset.studentId) {
                openStudentDetails(row.dataset.studentId);
            }
        });
    }

    // Backup global click handler for delete button
    document.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn && !deleteBtn.dataset.deleting) {
            e.preventDefault();
            e.stopPropagation();
            deleteStudent(deleteBtn);
        }
    });

    // 3. Auto-dismiss flash messages after 6 seconds
    const alerts = document.querySelectorAll('.flash-alert');
    alerts.forEach(alert => {
        const closeBtn = alert.querySelector('.flash-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 200);
            });
        }

        setTimeout(() => {
            if (alert.isConnected) {
                alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                alert.style.opacity = '0';
                alert.style.transform = 'translateY(-6px)';
                setTimeout(() => alert.remove(), 400);
            }
        }, 6000);
    });

    // 4. Modal Backdrop and Escape key listeners
    const modal = document.getElementById('studentDetailsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeStudentDetails();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                closeStudentDetails();
            }
        });
    }
});

// Asynchronously delete a student from the database and remove their row
async function deleteStudent(deleteBtn) {
    if (!deleteBtn || deleteBtn.dataset.deleting === 'true') return;

    const row = deleteBtn.closest('tr.student-row');
    const form = deleteBtn.closest('.delete-student-form');
    const studentId = deleteBtn.dataset.studentId || form?.dataset.studentId || row?.dataset.studentId;
    const studentName = deleteBtn.dataset.studentName || form?.dataset.studentName || row?.dataset.studentName || 'Student';

    if (!studentId) return;

    // Set loading state on button
    deleteBtn.dataset.deleting = 'true';
    deleteBtn.disabled = true;
    const originalContent = deleteBtn.innerHTML;
    deleteBtn.innerHTML = '<span>⏳</span>';

    try {
        const response = await fetch(`/students/delete/${studentId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Animate and remove the row
            if (row) {
                row.style.transition = 'all 0.35s ease';
                row.style.opacity = '0';
                row.style.transform = 'translateX(25px)';
                setTimeout(() => {
                    row.remove();
                    updateTableCountsAfterDelete();
                }, 350);
            }

            // Update KPI metrics on page
            updateKpiStats(data.total_students, data.avg_progress);

            // Display floating success toast alert
            showToastNotification(data.message || `Student '${studentName}' (ID: #${studentId}) was successfully deleted from database.`, 'success');

            // Close student modal if this student was currently inspected
            const modal = document.getElementById('studentDetailsModal');
            if (modal && modal.style.display !== 'none') {
                closeStudentDetails();
            }
        } else {
            showToastNotification(data.error || 'Failed to delete student.', 'warning');
            deleteBtn.disabled = false;
            deleteBtn.dataset.deleting = 'false';
            deleteBtn.innerHTML = originalContent;
        }
    } catch (err) {
        console.error('Delete error:', err);
        // Fallback: If fetch encounters an issue, try form submit
        if (form) {
            form.submit();
        } else {
            showToastNotification('Network error while deleting student.', 'error');
            deleteBtn.disabled = false;
            deleteBtn.dataset.deleting = 'false';
            deleteBtn.innerHTML = originalContent;
        }
    }
}

// Update table counters and handle empty table state after deletion
function updateTableCountsAfterDelete() {
    const rows = document.querySelectorAll('#studentTableBody tr.student-row');
    const count = rows.length;
    const visibleCountEl = document.getElementById('visibleStudentCount');
    const tableStatsEl = document.querySelector('.table-stats-count');

    if (visibleCountEl) {
        visibleCountEl.textContent = count;
    }
    if (tableStatsEl) {
        tableStatsEl.innerHTML = `Showing <strong id="visibleStudentCount">${count}</strong> of <strong>${count}</strong> students`;
    }

    if (count === 0) {
        const tbody = document.getElementById('studentTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="table-empty-state">
                        <div class="empty-icon">📭</div>
                        <p>No student records found in the database.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Update KPI cards in header ribbon
function updateKpiStats(totalStudents, avgProgress) {
    const totalEl = document.getElementById('kpiTotalStudents');
    if (totalEl && totalStudents !== undefined) {
        totalEl.textContent = totalStudents;
    }
    const avgEl = document.getElementById('kpiAvgProgress');
    if (avgEl && avgProgress !== undefined) {
        avgEl.textContent = `${avgProgress}%`;
    }
}

// Display floating toast alert notification
function showToastNotification(message, category = 'success') {
    let container = document.querySelector('.flash-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-container';
        const main = document.querySelector('.main-wrapper') || document.body;
        main.prepend(container);
    }

    const alert = document.createElement('div');
    alert.className = `flash-alert ${category}`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>${category === 'success' ? '✓' : '⚠'}</span>
            <span>${escapeHtml(message)}</span>
        </div>
        <button type="button" class="flash-close-btn" aria-label="Close notification">&times;</button>
    `;

    const closeBtn = alert.querySelector('.flash-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => alert.remove());
    }

    container.appendChild(alert);

    setTimeout(() => {
        if (alert.isConnected) {
            alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-6px)';
            setTimeout(() => alert.remove(), 400);
        }
    }, 5000);
}

// Function to open and populate the Student Details Modal
async function openStudentDetails(studentId) {
    const modal = document.getElementById('studentDetailsModal');
    const content = document.getElementById('modalStudentContent');
    if (!modal || !content) return;

    // Show modal in loading state
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    content.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 0.8rem; animation: pulse 1s infinite;">⏳</div>
            <p style="font-weight: 500;">Loading live learning progress from MySQL for Student #${studentId}...</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/students/${studentId}/details`);
        if (!response.ok) {
            throw new Error(`Failed to load details (Status: ${response.status})`);
        }

        const data = await response.json();
        renderStudentModal(data);
    } catch (err) {
        console.error('Error fetching student details:', err);
        content.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--accent-danger);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
                <p style="font-weight: 600;">Could not retrieve student records.</p>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">${err.message}</p>
                <button type="button" class="btn-primary" onclick="closeStudentDetails()" style="margin-top: 1rem; max-width: 140px; margin-inline: auto;">Close</button>
            </div>
        `;
    }
}

// Function to close the Student Details Modal
function closeStudentDetails() {
    const modal = document.getElementById('studentDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Function to render the student information into the modal
function renderStudentModal(data) {
    const s = data.student;
    const sum = data.summary;
    const enrollments = data.enrollments || [];
    const progressList = data.progress || [];
    const results = data.results || [];

    // Header Initials
    const initials = s.Name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Department badge class
    let deptClass = 'other';
    let deptShort = s.Department;
    if (s.Department === 'Computer Science') { deptClass = 'cs'; deptShort = 'CS'; }
    else if (s.Department === 'Information Tech') { deptClass = 'it'; deptShort = 'IT'; }
    else if (s.Department === 'Electronics') { deptClass = 'ece'; deptShort = 'ECE'; }

    // Update Modal Header Profile
    const headerProfile = document.getElementById('modalHeaderProfile');
    if (headerProfile) {
        headerProfile.innerHTML = `
            <div class="student-modal-avatar">${initials}</div>
            <div class="student-modal-title">
                <h2>${escapeHtml(s.Name)}</h2>
                <div class="student-modal-meta">
                    <span class="id-badge">ID #${s.Student_ID}</span>
                    <span class="badge-dept ${deptClass}">${deptShort}</span>
                    <span class="badge-year">Year ${s.Year}</span>
                    <span>✉️ ${escapeHtml(s.Email)}</span>
                    <span>📞 ${escapeHtml(s.Phone)}</span>
                </div>
            </div>
        `;
    }

    const content = document.getElementById('modalStudentContent');
    if (!content) return;

    // Render HTML content
    content.innerHTML = `
        <!-- Analytics Summary Ribbon -->
        <div class="student-summary-grid">
            <div class="student-summary-card">
                <span class="summary-card-label">Courses Enrolled</span>
                <span class="summary-card-val">${sum.total_courses}</span>
            </div>
            <div class="student-summary-card">
                <span class="summary-card-label">Avg. Progress</span>
                <span class="summary-card-val">${sum.avg_completion_percent}%</span>
            </div>
            <div class="student-summary-card">
                <span class="summary-card-label">Study Time</span>
                <span class="summary-card-val">${sum.total_time_spent_mins} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-secondary);">mins</span></span>
            </div>
            <div class="student-summary-card">
                <span class="summary-card-label">Avg. Assessment</span>
                <span class="summary-card-val">${sum.avg_score_percent}%</span>
            </div>
        </div>

        <!-- 1. Enrolled Courses -->
        <div class="detail-section">
            <div class="detail-section-title">
                <span>📚 Course Enrollments</span>
                <span class="detail-count-badge">${enrollments.length} Enrolled</span>
            </div>
            ${enrollments.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                    ${enrollments.map(e => `
                        <div style="background: #FCFBF9; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.9rem 1.1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.35rem;">
                                <div>
                                    <strong style="font-size: 0.94rem; color: var(--text-primary);">${escapeHtml(e.Course_Name)}</strong>
                                    <span style="font-size: 0.74rem; margin-left: 0.4rem; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); background: var(--bg-card-subtle); color: var(--text-secondary); border: 1px solid var(--border-color);">${escapeHtml(e.Course_Category)} &middot; ${escapeHtml(e.Course_Level)}</span>
                                </div>
                                <span style="font-size: 0.76rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); background-color: ${e.Enrollment_Status === 'Completed' ? 'var(--accent-sage-light)' : 'var(--accent-amber-light)'}; color: ${e.Enrollment_Status === 'Completed' ? 'var(--accent-sage)' : 'var(--accent-amber)'};">
                                    ${escapeHtml(e.Enrollment_Status)}
                                </span>
                            </div>
                            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${escapeHtml(e.Course_Description || '')}</p>
                            <div style="display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 0.45rem;">
                                <span>📅 Enrolled: <strong>${e.Enroll_Date || 'N/A'}</strong> ${e.Completion_Date ? `&middot; Completed: <strong>${e.Completion_Date}</strong>` : ''}</span>
                                <span>👨‍🏫 Faculty: <strong style="color: var(--accent-terracotta);">${escapeHtml(e.Instructor_Name || 'Unassigned')}</strong> (${escapeHtml(e.Instructor_Specialization || '')})</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <p style="font-size: 0.84rem; color: var(--text-muted); text-align: center; padding: 1rem;">No course enrollments found for this student.</p>
            `}
        </div>

        <!-- 2. Learning Progress by Module -->
        <div class="detail-section">
            <div class="detail-section-title">
                <span>📈 Avg. Progress &amp; Module Tracking</span>
                <span class="detail-count-badge">${progressList.length} Modules</span>
            </div>
            ${progressList.length > 0 ? `
                <div>
                    ${progressList.map(p => {
                        const pct = parseFloat(p.Completion_Percent) || 0;
                        const isDone = pct >= 100 || p.Progress_Status === 'Completed';
                        return `
                            <div class="progress-item-box">
                                <div class="progress-item-header">
                                    <div class="progress-mod-name">
                                        <span>Seq #${p.Sequence_No}: ${escapeHtml(p.Module_Name)}</span>
                                        <span style="font-size: 0.74rem; font-weight: normal; color: var(--text-muted); margin-left: 0.4rem;">(${escapeHtml(p.Course_Name)})</span>
                                    </div>
                                    <span class="progress-pct-text">${pct}%</span>
                                </div>
                                <div class="progress-bar-track">
                                    <div class="progress-bar-fill ${isDone ? 'completed' : ''}" style="width: ${pct}%;"></div>
                                </div>
                                <div class="progress-meta-info">
                                    <span>Status: <strong style="color: ${isDone ? 'var(--accent-sage)' : 'var(--accent-terracotta)'};">${escapeHtml(p.Progress_Status)}</strong></span>
                                    <span>⏱️ Time Logged: <strong>${p.Time_Spent} mins</strong> &middot; Last Update: <strong>${p.Progress_Date || 'Recent'}</strong></span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <p style="font-size: 0.84rem; color: var(--text-muted); text-align: center; padding: 1rem;">No module progress logged yet.</p>
            `}
        </div>

        <!-- 3. Assessment Results -->
        <div class="detail-section">
            <div class="detail-section-title">
                <span>📝 Assessment Results &amp; Exam History</span>
                <span class="detail-count-badge">${results.length} Taken</span>
            </div>
            ${results.length > 0 ? `
                <div style="overflow-x: auto;">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>Assessment</th>
                                <th>Type</th>
                                <th>Attempt</th>
                                <th>Score Obtained</th>
                                <th>Percentage</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(r => {
                                const pct = parseFloat(r.Percentage) || 0;
                                let badgeClass = 'mid';
                                if (pct >= 75) badgeClass = 'high';
                                else if (pct < 50) badgeClass = 'low';

                                return `
                                    <tr>
                                        <td>
                                            <strong>${escapeHtml(r.Assessment_Name)}</strong>
                                            <div style="font-size: 0.74rem; color: var(--text-muted);">${escapeHtml(r.Course_Name)} &middot; ${escapeHtml(r.Module_Name)}</div>
                                        </td>
                                        <td>
                                            <span style="font-size: 0.75rem; padding: 0.15rem 0.45rem; border-radius: var(--radius-sm); background: var(--bg-card-subtle); color: var(--text-secondary); border: 1px solid var(--border-color);">
                                                ${escapeHtml(r.Assessment_Type)}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="attempt-pill">Attempt #${r.Attempt_No}</span>
                                        </td>
                                        <td>
                                            <strong>${r.Score}</strong> <span style="font-size: 0.74rem; color: var(--text-muted);">/ ${r.Max_Marks}</span>
                                        </td>
                                        <td>
                                            <span class="score-badge ${badgeClass}">${pct}%</span>
                                        </td>
                                        <td>
                                            <span style="font-weight: 600; color: ${r.Performance_Grade === 'Pass' ? 'var(--accent-sage)' : 'var(--accent-danger)'};">
                                                ${r.Performance_Grade === 'Pass' ? '✓ Passed' : '✕ Needs Retake'}
                                            </span>
                                        </td>
                                        <td style="color: var(--text-muted); font-size: 0.76rem;">
                                            ${r.Result_Date || 'N/A'}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <p style="font-size: 0.84rem; color: var(--text-muted); text-align: center; padding: 1rem;">No assessment results logged yet.</p>
            `}
        </div>
    `;
}

// Utility to escape HTML and prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
