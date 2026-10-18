import React, { useEffect } from 'react';
import Icon from './Icon';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-notification toast-${type}`}>
      <Icon name={type === 'success' ? 'check' : 'check'} size={16} className="toast-icon" />
      <span className="toast-message">{message}</span>
      <button type="button" onClick={onClose} className="toast-close" aria-label="Dismiss message">
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
