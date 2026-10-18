import React, { useEffect } from 'react';
import Icon from './Icon';

export default function ConfirmDialog({
  isOpen,
  title = 'Delete Contact?',
  message = 'Are you sure you want to delete this contact? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div
        className="confirm-dialog-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <div className="dialog-warning-icon">
            <Icon name="warning" size={20} />
          </div>
          <h3 className="dialog-title">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="dialog-close-btn"
            aria-label="Close dialog"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="dialog-body">
          <p className="dialog-message">{message}</p>
        </div>

        <div className="dialog-actions">
          <button type="button" onClick={onCancel} className="btn-dialog-cancel">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="btn-dialog-delete">
            <Icon name="delete" size={15} />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
