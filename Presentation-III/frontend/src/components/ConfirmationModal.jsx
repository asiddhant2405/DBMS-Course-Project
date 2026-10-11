import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertTriangle, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  itemName,
  itemId,
  itemType = 'Record',
  dependencyData = null,
  isDeleting = false
}) => {
  const [cascadeChecked, setCascadeChecked] = useState(false);

  const hasDependencies = dependencyData && dependencyData.hasDependencies;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="30rem">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: '0.5rem',
              backgroundColor: hasDependencies ? '#fef2f2' : '#fffbeb',
              color: hasDependencies ? '#dc2626' : '#d97706',
              flexShrink: 0
            }}
          >
            {hasDependencies ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
          </div>

          <div>
            <p style={{ fontSize: '0.925rem', color: '#1e293b', fontWeight: 500, margin: 0 }}>
              Are you sure you want to permanently delete this {itemType.toLowerCase()}?
            </p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
              Target: <strong style={{ color: '#0f172a' }}>{itemName}</strong> (ID: {itemId})
            </p>
          </div>
        </div>

        {/* Foreign Key Dependency Warning */}
        {hasDependencies ? (
          <div
            style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '0.5rem',
              padding: '0.85rem',
              fontSize: '0.825rem',
              color: '#9f1239'
            }}
          >
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={15} /> Foreign-Key Referential Integrity Warning
            </div>
            <p style={{ marginTop: '0.35rem', lineHeight: 1.45 }}>
              This record has dependent foreign-key records in MySQL:
            </p>
            <ul style={{ marginLeft: '1.25rem', marginTop: '0.35rem' }}>
              {dependencyData.counts.enrollments > 0 && (
                <li>{dependencyData.counts.enrollments} Course Enrollment(s)</li>
              )}
              {dependencyData.counts.progress > 0 && (
                <li>{dependencyData.counts.progress} Module Progress Record(s)</li>
              )}
              {dependencyData.counts.results > 0 && (
                <li>{dependencyData.counts.results} Assessment Result(s)</li>
              )}
            </ul>
            <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#be123c' }}>
              MySQL RESTRICT foreign-key constraint will block standard deletion to preserve historical data integrity.
            </p>

            <label
              style={{
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#4c0519',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <input
                type="checkbox"
                checked={cascadeChecked}
                onChange={(e) => setCascadeChecked(e.target.checked)}
              />
              <span>Explicitly cascade-delete related records inside a single MySQL transaction</span>
            </label>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              padding: '0.65rem 0.85rem',
              fontSize: '0.8rem',
              color: '#475569'
            }}
          >
            No foreign-key dependencies detected. The record will be cleanly removed via <code>DELETE FROM {itemType.toLowerCase()} WHERE ...</code>.
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={isDeleting || (hasDependencies && !cascadeChecked)}
            onClick={() => onConfirm(cascadeChecked)}
          >
            <Trash2 size={15} />
            <span>{isDeleting ? 'Deleting in MySQL...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
