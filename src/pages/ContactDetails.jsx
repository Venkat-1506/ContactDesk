import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Monogram from '../components/Monogram';
import Icon from '../components/Icon';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import LogInteractionModal from '../components/LogInteractionModal';
import { getContactById, toggleFavorite, deleteContact } from '../utils/contactStorage';

export default function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalType, setLogModalType] = useState('Phone Call');
  const [toastMessage, setToastMessage] = useState('');
  const [notFound, setNotFound] = useState(false);

  const reloadContact = () => {
    const loaded = getContactById(id);
    if (loaded) {
      setContact(loaded);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  };

  useEffect(() => {
    reloadContact();
  }, [id]);

  if (notFound) {
    return (
      <div className="page-container">
        <div className="editorial-empty-box">
          <Icon name="warning" size={36} className="empty-icon" />
          <h2>Person Record Not Found</h2>
          <p>The record you requested could not be located in your People Atlas.</p>
          <Link to="/people" className="btn-editorial-primary">
            <Icon name="arrow-left" size={15} />
            <span>Return to People Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!contact) return null;

  const {
    name,
    phone,
    email,
    category,
    relationship,
    organization,
    city,
    location,
    notes,
    context,
    close,
    favorite,
    professionalTitle,
    professionalLinks = [],
    interactions = [],
    createdAt,
    updatedAt,
    lastContactedAt
  } = contact;

  const isClosePerson = Boolean(close ?? favorite);
  const locVal = city || location || '';
  const noteVal = notes || context || '';

  const formatDate = (isoString) => {
    if (!isoString) return 'Not recorded';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Not recorded';
    }
  };

  const handleToggleFav = () => {
    const isNowClose = toggleFavorite(id);
    reloadContact();
    setToastMessage(`${name} ${isNowClose ? 'marked as close contact' : 'removed from close list'}.`);
  };

  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    }
    setLogModalType('Phone Call');
    setIsLogModalOpen(true);
  };

  const handleEmail = () => {
    if (email) {
      window.location.href = `mailto:${email}?subject=Hello%20${encodeURIComponent(name)}`;
    }
    setLogModalType('Email');
    setIsLogModalOpen(true);
  };

  const handleCopyPhone = () => {
    if (!phone) return;
    navigator.clipboard.writeText(phone).then(
      () => setToastMessage('Phone number copied to clipboard!'),
      () => setToastMessage('Failed to copy phone number.')
    );
  };

  const handleCopyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email).then(
      () => setToastMessage('Email address copied to clipboard!'),
      () => setToastMessage('Failed to copy email address.')
    );
  };

  const handleDeleteConfirm = () => {
    deleteContact(id);
    setIsDeleteOpen(false);
    navigate('/people');
  };

  return (
    <div className="page-container person-dossier-layout">
      {/* Navigation Breadcrumb */}
      <div>
        <Link to="/people" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Icon name="arrow-left" size={14} />
          <span>People Directory</span>
        </Link>
      </div>

      {/* Dossier Archival Header */}
      <header className="dossier-index-head">
        <div className="dossier-identity-group">
          <Monogram name={name} size="lg" />
          <div>
            <span className="count-tag mono-font" style={{ fontSize: '0.7rem' }}>PERSON RECORD</span>
            <h1 className="dossier-name">{name}</h1>
            <p className="dossier-sub-line">
              {professionalTitle && <span className="pro-title-highlight">{professionalTitle} · </span>}
              <span className="meta-rel-highlight">{relationship || category}</span>
              {organization && <span> · {organization}</span>}
              {locVal && <span> · {locVal}</span>}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="dossier-action-cluster">
          <button
            type="button"
            onClick={handleCall}
            className="btn-editorial-primary"
            aria-label={`Call ${name}`}
          >
            <Icon name="phone" size={15} />
            <span>Call</span>
          </button>

          <button
            type="button"
            onClick={handleEmail}
            className="btn-editorial-primary"
            aria-label={`Email ${name}`}
          >
            <Icon name="email" size={15} />
            <span>Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLogModalType('Meeting');
              setIsLogModalOpen(true);
            }}
            className="btn-editorial-secondary"
            aria-label={`Log interaction with ${name}`}
          >
            <Icon name="calendar" size={15} />
            <span>Log Interaction</span>
          </button>

          <Link to={`/edit-contact/${id}`} className="btn-editorial-secondary" aria-label={`Edit ${name}`}>
            <Icon name="edit" size={15} />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={handleToggleFav}
            className={`btn-editorial-secondary ${isClosePerson ? 'is-active' : ''}`}
            aria-label={isClosePerson ? `Remove ${name} from close` : `Add ${name} to close`}
          >
            <Icon name={isClosePerson ? 'heart-filled' : 'heart'} size={15} />
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="btn-danger-outline"
            aria-label={`Delete record for ${name}`}
          >
            <Icon name="delete" size={15} />
          </button>
        </div>
      </header>

      {/* SECTION 1: CONTACT */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">CONTACT</h3>

        <div className="dossier-grid">
          <div className="dossier-card">
            <span className="dossier-card-title">PHONE NUMBER</span>
            {phone ? (
              <div className="dossier-card-value">
                <span className="mono-font">{phone}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button type="button" onClick={handleCall} className="btn-editorial-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    Call
                  </button>
                  <button type="button" onClick={handleCopyPhone} className="btn-action-touch" title="Copy Phone">
                    <Icon name="copy" size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not provided</span>
            )}
          </div>

          <div className="dossier-card">
            <span className="dossier-card-title">EMAIL ADDRESS</span>
            {email ? (
              <div className="dossier-card-value">
                <span className="mono-font" style={{ wordBreak: 'break-all', fontSize: '0.9rem' }}>{email}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button type="button" onClick={handleEmail} className="btn-editorial-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    Email
                  </button>
                  <button type="button" onClick={handleCopyEmail} className="btn-action-touch" title="Copy Email">
                    <Icon name="copy" size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not provided</span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: PROFESSIONAL */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">PROFESSIONAL</h3>

        <div className="dossier-grid">
          <div className="dossier-card">
            <span className="dossier-card-title">PROFESSIONAL TITLE</span>
            <span style={{ fontWeight: '600' }}>{professionalTitle || 'Not specified'}</span>
          </div>

          <div className="dossier-card">
            <span className="dossier-card-title">ORGANIZATION / COMPANY</span>
            <span style={{ fontWeight: '600' }}>{organization || 'Not specified'}</span>
          </div>
        </div>

        {/* Professional Links Badges */}
        <div style={{ marginTop: '1rem' }}>
          <span className="dossier-card-title" style={{ display: 'block', marginBottom: '0.5rem' }}>
            PROFESSIONAL &amp; SOCIAL PROFILES
          </span>
          {professionalLinks.length > 0 ? (
            <div className="links-badges-list">
              {professionalLinks.map((link, idx) => {
                const iconName = link.type?.toLowerCase().includes('linkedin')
                  ? 'linkedin'
                  : link.type?.toLowerCase().includes('github')
                  ? 'github'
                  : link.type?.toLowerCase().includes('instagram')
                  ? 'instagram'
                  : link.type?.toLowerCase().includes('portfolio') || link.type?.toLowerCase().includes('website')
                  ? 'portfolio'
                  : 'external';

                return (
                  <a
                    key={idx}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="professional-link-badge"
                    title={link.label || link.type}
                    aria-label={`Open ${name}'s ${link.label || link.type} profile`}
                  >
                    <Icon name={iconName} size={24} />
                  </a>
                );
              })}
            </div>
          ) : (
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              No external professional profiles linked.
            </span>
          )}
        </div>
      </section>

      {/* SECTION 3: RELATIONSHIP */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">RELATIONSHIP</h3>
        <div className="dossier-grid">
          <div className="dossier-card">
            <span className="dossier-card-title">CATEGORY</span>
            <span style={{ fontWeight: '600' }}>{category}</span>
          </div>
          <div className="dossier-card">
            <span className="dossier-card-title">RELATIONSHIP</span>
            <span style={{ fontWeight: '600' }}>{relationship || '—'}</span>
          </div>
          <div className="dossier-card">
            <span className="dossier-card-title">ORGANIZATION</span>
            <span style={{ fontWeight: '600' }}>{organization || '—'}</span>
          </div>
          <div className="dossier-card">
            <span className="dossier-card-title">LOCATION</span>
            <span style={{ fontWeight: '600' }}>{locVal || '—'}</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: CONTEXT */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">CONTEXT</h3>
        <div className="dossier-notes-box">
          {noteVal && noteVal.trim() ? noteVal : 'No context notes recorded for this person.'}
        </div>
      </section>

      {/* SECTION 5: CONTACT HISTORY & INTERACTION TIMELINE */}
      <section className="editorial-rule-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="section-rule-title" style={{ flex: '1' }}>CONTACT HISTORY</h3>
          <button
            type="button"
            onClick={() => {
              setLogModalType('Phone Call');
              setIsLogModalOpen(true);
            }}
            className="btn-editorial-secondary"
          >
            <Icon name="plus" size={14} />
            <span>Log Interaction</span>
          </button>
        </div>

        {interactions.length > 0 ? (
          <div className="interaction-timeline">
            {interactions.map((intr) => (
              <div key={intr.id} className="timeline-item">
                <div className="timeline-badge">
                  <Icon
                    name={
                      intr.type === 'Phone Call'
                        ? 'phone'
                        : intr.type === 'Email'
                        ? 'email'
                        : intr.type === 'Meeting'
                        ? 'meeting'
                        : 'message'
                    }
                    size={14}
                  />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-type">{intr.type}</span>
                    <span className="timeline-date">{formatDate(intr.date)}</span>
                  </div>
                  {intr.note && <p className="timeline-note">{intr.note}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dossier-notes-box muted" style={{ fontSize: '0.85rem' }}>
            No interaction logs recorded yet. Click "Log Interaction" to record a call, email, or meeting.
          </div>
        )}

        <div className="history-strip" style={{ marginTop: '1rem' }}>
          <div>
            <span className="text-muted">CREATED:</span> <strong>{formatDate(createdAt)}</strong>
          </div>
          <div>
            <span className="text-muted">LAST UPDATED:</span> <strong>{formatDate(updatedAt)}</strong>
          </div>
          <div>
            <span className="text-muted">LAST CONTACTED:</span> <strong>{formatDate(lastContactedAt)}</strong>
          </div>
        </div>
      </section>

      {/* Log Interaction Modal */}
      <LogInteractionModal
        isOpen={isLogModalOpen}
        contact={contact}
        initialType={logModalType}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={() => {
          reloadContact();
          setToastMessage('Interaction logged successfully!');
        }}
      />

      {/* Confirm Delete Dialog Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title={`Delete ${name}?`}
        message={`Are you sure you want to remove ${name} from your People Atlas? This action cannot be undone.`}
        confirmLabel="Delete Person"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />

      {/* Toast Feedback Notification */}
      <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />
    </div>
  );
}

