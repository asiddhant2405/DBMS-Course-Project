import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';

import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { InstructorsPage } from './pages/InstructorsPage';
import { CoursesPage } from './pages/CoursesPage';
import { ModulesPage } from './pages/ModulesPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { EnrollmentsPage } from './pages/EnrollmentsPage';
import { ProgressPage } from './pages/ProgressPage';
import { ResultsPage } from './pages/ResultsPage';
import { DatabaseOverviewPage } from './pages/DatabaseOverviewPage';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} showToast={showToast} />;
      case 'students':
        return <StudentsPage showToast={showToast} />;
      case 'instructors':
        return <InstructorsPage showToast={showToast} />;
      case 'courses':
        return <CoursesPage showToast={showToast} />;
      case 'modules':
        return <ModulesPage showToast={showToast} />;
      case 'assessments':
        return <AssessmentsPage showToast={showToast} />;
      case 'enrollments':
        return <EnrollmentsPage showToast={showToast} />;
      case 'progress':
        return <ProgressPage showToast={showToast} />;
      case 'results':
        return <ResultsPage showToast={showToast} />;
      case 'database':
        return <DatabaseOverviewPage showToast={showToast} />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} showToast={showToast} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar
          activeTab={activeTab}
        />

        <main style={{ flex: 1, padding: '1.5rem 1.75rem', overflowY: 'auto' }}>
          {renderActivePage()}
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;
