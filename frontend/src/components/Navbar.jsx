import React from 'react';

const TAB_TITLES = {
  dashboard: { title: 'Executive Overview', subtitle: '' },
  students: { title: 'Student Management', subtitle: 'Learner profile records, academic cohorts, and relational details' },
  instructors: { title: 'Instructor Faculty', subtitle: 'Faculty profiles and course assignments' },
  courses: { title: 'Course Catalog', subtitle: 'Curriculum offerings linked to instructors and instructional modules' },
  modules: { title: 'Course Modules', subtitle: 'Curriculum structure, learning topics, and sequence mapping' },
  assessments: { title: 'Assessments & Exams', subtitle: 'Quizzes, assignments, and semester examinations' },
  enrollments: { title: 'Student Enrollments', subtitle: 'Course registration records with completion tracking' },
  progress: { title: 'Learning Progress Tracker', subtitle: 'Granular module completion percentage and study duration' },
  results: { title: 'Assessment Results', subtitle: 'Grading scores, examination attempts, and evaluation dates' },
  database: { title: 'Database Relational Overview', subtitle: 'Interactive data dictionary, table schemas, and foreign key relations' }
};

export const Navbar = ({ activeTab }) => {
  const meta = TAB_TITLES[activeTab] || { title: 'Learning Management System', subtitle: '' };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.85rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
          {meta.title}
        </h1>
        {meta.subtitle ? (
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, marginTop: '0.1rem' }}>
            {meta.subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
};

