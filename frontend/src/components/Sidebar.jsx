import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  BookOpen,
  Layers,
  ClipboardCheck,
  UserPlus,
  TrendingUp,
  Award,
  Terminal,
  Database,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  DatabaseBackup
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'instructors', label: 'Instructors', icon: UserCheck },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'modules', label: 'Modules', icon: Layers },
  { id: 'assessments', label: 'Assessments', icon: ClipboardCheck },
  { id: 'enrollments', label: 'Enrollments', icon: UserPlus },
  { id: 'progress', label: 'Learning Progress', icon: TrendingUp },
  { id: 'results', label: 'Assessment Results', icon: Award }
];

export const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  return (
    <aside
      style={{
        width: collapsed ? '4.5rem' : '17rem',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRight: '1px solid #1e293b',
        flexShrink: 0
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #1e293b',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.5rem',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <DatabaseBackup size={20} color="#ffffff" />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                DBMS Portal
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Online Course System
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          let btnBg = 'transparent';
          let textColor = '#94a3b8';
          let iconColor = '#94a3b8';

          if (isActive) {
            btnBg = item.highlightDemo ? '#dc2626' : item.highlight ? '#2563eb' : '#1e293b';
            textColor = '#ffffff';
            iconColor = '#ffffff';
          } else if (item.highlightDemo) {
            textColor = '#f87171';
            iconColor = '#f87171';
          } else if (item.highlight) {
            textColor = '#60a5fa';
            iconColor = '#60a5fa';
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: collapsed ? '0.65rem 0' : '0.65rem 0.85rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: btnBg,
                color: textColor,
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'background 0.15s ease',
                position: 'relative'
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.highlightDemo && !isActive && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem',
                    backgroundColor: '#7f1d1d',
                    color: '#fecaca',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    fontWeight: 600
                  }}
                >
                  DEMO
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
