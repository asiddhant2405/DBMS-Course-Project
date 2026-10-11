import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  let bg = '#ffffff';
  let border = '#e2e8f0';
  let Icon = Info;
  let iconColor = '#2563eb';

  if (isSuccess) {
    border = '#86efac';
    Icon = CheckCircle2;
    iconColor = '#16a34a';
  } else if (isError) {
    border = '#fca5a5';
    Icon = AlertCircle;
    iconColor = '#dc2626';
  } else if (isWarning) {
    border = '#fde047';
    Icon = AlertCircle;
    iconColor = '#ca8a04';
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 100,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '0.5rem',
        padding: '0.85rem 1.25rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '28rem',
        animation: 'slideIn 0.2s ease-out'
      }}
    >
      <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: '0.875rem', color: '#0f172a' }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '0.2rem',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
