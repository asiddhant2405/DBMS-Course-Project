// Frontend Application Controller for Online Course Learning Progress Management System
// Developed by Siddhant Agarwal (25WU0102262)

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderStats();
    renderCourseDropdown();
    renderStudentTable();
    setupEventListeners();
}

// 1. Render KPI Ribbon Stats
function renderStats() {
    const stats = window.clientDB.getStats();
    const totalEl = document.getElementById('kpiTotalStudents');
    if (totalEl) totalEl.textContent = stats.total_students;

    const courseEl = document.getElementById('kpiTotalCourses');
    if (courseEl) courseEl.textContent = stats.total_courses;

    const avgEl = document.getElementById('kpiAvgProgress');
    if (avgEl) avgEl.textContent = `${stats.avg_progress}%`;

    const instEl = document.getElementById('kpiTotalInstructors');
    if (instEl) instEl.textContent = stats.total_instructors;
}

// 2. Render Courses in Form Dropdown
function renderCourseDropdown() {
    const select = document.getElementById('course_id');
    if (!select) return;

    const courses = window.clientDB.getCourses();
    select.innerHTML = '<option value="">-- No initial enrollment --</option>';
    courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.Course_ID;
        opt.textContent = `${c.Course_Name} (${c.Level}) - ${c.Instructor_Name}`;
        select.appendChild(opt);
    });
}

// 3. Render Student Records Table
function renderStudentTable(filterQuery = '') {
    const tbody = document.getElementById('studentTableBody');
    const countDisplay = document.getElementById('visibleStudentCount');
    const totalDisplay = document.getElementById('totalStudentCount');
    const emptyRow = document.getElementById('tableSearchEmptyState');

    if (!tbody) return;

    const allStudents = window.clientDB.getStudents();
    const query = filterQuery.toLowerCase().trim();

    const filtered = allStudents.filter(s => {
        if (!query) return true;
        const searchStr = `${s.Student_ID} ${s.Name} ${s.Email} ${s.Department} ${s.Phone} Year ${s.Year}`.toLowerCase();
        return searchStr.includes(query);
    });

    if (totalDisplay) totalDisplay.textContent = allStudents.length;
    if (countDisplay) countDisplay.textContent = filtered.length;

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        if (emptyRow) {
            emptyRow.style.display = allStudents.length > 0 ? '' : 'none';
        }
        if (allStudents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="table-empty-state">
                        <div class="empty-icon">📭</div>
                        <p>No student records found. Add a student using the form on the left.</p>
                    </td>
                </tr>
            `;
        }
        return;
    }

    if (emptyRow) emptyRow.style.display = 'none';

    tbody.innerHTML = filtered.map(s => {
        let deptClass = 'other';
        let deptShort = s.Department;
        if (s.Department === 'Computer Science') { deptClass = 'cs'; deptShort = 'CS'; }
        else if (s.Department === 'Information Tech') { deptClass = 'it'; deptShort = 'IT'; }
        else if (s.Department === 'Electronics') { deptClass = 'ece'; deptShort = 'ECE'; }

        return `
            <tr class="student-row" data-student-id="${s.Student_ID}" data-student-name="${escapeHtml(s.Name)}">
                <td class="col-id">
                    <span class="id-badge">#${s.Student_ID}</span>
                </td>
                <td class="col-name">
                    <div class="student-name-group">
                        <strong class="student-name">${escapeHtml(s.Name)}</strong>
                        <span class="student-email">${escapeHtml(s.Email)}</span>
                    </div>
                </td>
                <td class="col-dept">
                    <span class="badge-dept ${deptClass}">${deptShort}</span>
                </td>
                <td class="col-year">
                    <span class="badge-year">Year ${s.Year}</span>
                </td>
                <td class="col-phone">
                    <span class="phone-text">${escapeHtml(s.Phone)}</span>
                </td>
                <td class="col-courses">
                    <div class="course-stat-pill" title="${s.Enrolled_Count} enrolled courses &middot; ${s.Avg_Progress}% avg progress">
                        <span class="pill-count">${s.Enrolled_Count}</span>
                        <span class="pill-label">courses</span>
                        <span class="pill-prog">${s.Avg_Progress}%</span>
                    </div>
                </td>
                <td class="col-actions">
                    <div class="action-buttons-group">
                        <button 
                            type="button" 
                            class="btn-action-view" 
                            data-action="view-details" 
                            data-student-id="${s.Student_ID}"
                            title="View Full Profile &amp; Learning Progress"
                        >
                            <span>👁️</span> Details
                        </button>
                        <button 
                            type="button" 
                            class="btn-delete" 
                            data-student-id="${s.Student_ID}" 
                            data-student-name="${escapeHtml(s.Name)}" 
                            title="Delete Student #${s.Student_ID}"
                        >
                            <span>🗑️</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. Setup Event Listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('studentSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderStudentTable(e.target.value);
        });
    }

    // Add Student Form Submit
    const addForm = document.getElementById('addStudentForm');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const department = formData.get('department');
            const year = formData.get('year');
            const phone = formData.get('phone');
            const course_id = formData.get('course_id');

            try {
                const newStudent = window.clientDB.addStudent({
                    name,
                    email,
                    department,
                    year,
                    phone,
                    course_id
                });

                showToastNotification(`Student '${newStudent.Name}' was successfully registered as Student #${newStudent.Student_ID}!`, 'success');
                addForm.reset();
                renderStats();
                renderStudentTable(searchInput ? searchInput.value : '');
            } catch (err) {
                showToastNotification(err.message || 'Failed to add student.', 'warning');
            }
        });
    }

    // Table Clicks Delegation (View Details, Delete, Row Click)
    const tableBody = document.getElementById('studentTableBody');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteStudent(deleteBtn);
                return;
            }

            const detailsBtn = e.target.closest('[data-action="view-details"]');
            if (detailsBtn && detailsBtn.dataset.studentId) {
                e.stopPropagation();
                openStudentDetailsModal(detailsBtn.dataset.studentId);
                return;
            }

            if (e.target.closest('form') || e.target.closest('button') || e.target.closest('a')) {
                return;
            }

            const row = e.target.closest('tr.student-row');
            if (row && row.dataset.studentId) {
                openStudentDetailsModal(row.dataset.studentId);
            }
        });
    }

    // Modal Background & Close button
    const modal = document.getElementById('studentDetailsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeStudentDetailsModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display !== 'none') {
                closeStudentDetailsModal();
            }
        });
    }

    // Reset Database Button
    const resetBtn = document.getElementById('btnResetDatabase');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset database back to the initial 31 students? Any newly added students will be cleared.')) {
                window.clientDB.reset();
                renderStats();
                renderStudentTable();
                showToastNotification('Database restored to default 31 student records.', 'success');
            }
        });
    }

    // Export SQL Button
    const exportBtn = document.getElementById('btnExportSql');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const sql = window.clientDB.exportSql();
            const blob = new Blob([sql], { type: 'text/sql' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `OnlineLearningSystem_dump_${new Date().toISOString().slice(0, 10)}.sql`;
            a.click();
            URL.revokeObjectURL(url);
            showToastNotification('Database SQL dump downloaded successfully!', 'success');
        });
    }
}

// Handle Student Deletion
function handleDeleteStudent(deleteBtn) {
    const studentId = deleteBtn.dataset.studentId;
    const studentName = deleteBtn.dataset.studentName || 'Student';
    if (!studentId) return;

    try {
        const row = deleteBtn.closest('tr.student-row');
        if (row) {
            row.style.transition = 'all 0.35s ease';
            row.style.opacity = '0';
            row.style.transform = 'translateX(25px)';
        }

        setTimeout(() => {
            const res = window.clientDB.deleteStudent(studentId);
            renderStats();
            const searchInput = document.getElementById('studentSearchInput');
            renderStudentTable(searchInput ? searchInput.value : '');
            showToastNotification(res.message, 'success');

            const modal = document.getElementById('studentDetailsModal');
            if (modal && modal.style.display !== 'none') {
                closeStudentDetailsModal();
            }
        }, 300);
    } catch (err) {
        showToastNotification(err.message || 'Failed to delete student.', 'warning');
    }
}

// Open and Render Student Modal
function openStudentDetailsModal(studentId) {
    const modal = document.getElementById('studentDetailsModal');
    const content = document.getElementById('modalStudentContent');
    if (!modal || !content) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
        const data = window.clientDB.getStudentDetails(studentId);
        renderStudentModalContent(data);
    } catch (err) {
        content.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem; color: var(--accent-danger);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
                <p style="font-weight: 600;">Could not retrieve student records.</p>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">${err.message}</p>
                <button type="button" class="btn-primary" onclick="closeStudentDetailsModal()" style="margin-top: 1rem; max-width: 140px; margin-inline: auto;">Close</button>
            </div>
        `;
    }
}

function closeStudentDetailsModal() {
    const modal = document.getElementById('studentDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function renderStudentModalContent(data) {
    const s = data.student;
    const sum = data.summary;
    const enrollments = data.enrollments || [];
    const progressList = data.progress || [];
    const results = data.results || [];

    const initials = s.Name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    let deptClass = 'other';
    let deptShort = s.Department;
    if (s.Department === 'Computer Science') { deptClass = 'cs'; deptShort = 'CS'; }
    else if (s.Department === 'Information Tech') { deptClass = 'it'; deptShort = 'IT'; }
    else if (s.Department === 'Electronics') { deptClass = 'ece'; deptShort = 'ECE'; }

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

    content.innerHTML = `
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

// Toast Notifications
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

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
