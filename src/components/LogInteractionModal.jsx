import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { logInteraction } from '../utils/contactStorage';

export default function LogInteractionModal({ isOpen, onClose, contact, initialType = 'Phone Call', onSuccess }) {
  const [type, setType] = useState(initialType);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setType(initialType);
    setDate(new Date().toISOString().slice(0, 16));
    setNote('');
  }, [isOpen, initialType, contact]);

  // Accessibility Esc key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !contact) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedContact = logInteraction(contact.id, {
        type,
        date: new Date(date).toISOString(),
        note: note.trim()
      });

      if (onSuccess) {
        onSuccess(updatedContact);
      }
      onClose();
    } catch (err) {
      console.error('Failed to log interaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-interaction-title"
    >
      <div className="modal-card editorial-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 id="log-interaction-title" className="modal-title">
              LOG INTERACTION
            </h3>
            <p className="modal-subtitle">
              Record interaction with <strong>{contact.name}</strong>
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close interaction dialog"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="interaction-type" className="form-label">
              Interaction Type
            </label>
            <select
              id="interaction-type"
              className="form-input form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="Phone Call">Phone Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
              <option value="Message">Message</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="interaction-date" className="form-label">
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="interaction-date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="interaction-note" className="form-label">
              Notes / Key Takeaways
            </label>
            <textarea
              id="interaction-note"
              className="form-input form-textarea"
              rows={3}
              placeholder="e.g. Discussed UI/UX project review, agreed on next steps..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-editorial-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-editorial-primary"
              disabled={isSubmitting}
            >
              <Icon name="check" size={16} />
              {isSubmitting ? 'Saving...' : 'Save Interaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
