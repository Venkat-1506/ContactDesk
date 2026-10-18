import React, { useState, useEffect, useRef } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import Icon from '../components/Icon';
import {
  getContacts,
  exportContactsJSON,
  importContactsJSON,
  clearAllContacts,
  resetDemoData,
  getWorkspaceMode,
  switchToDemo
} from '../utils/contactStorage';

export default function Data() {
  const workspaceMode = getWorkspaceMode();
  const [contacts, setContacts] = useState([]);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [pendingImport, setPendingImport] = useState(null);
  const fileInputRef = useRef(null);

  const loadData = () => {
    setContacts(getContacts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPeople = contacts.length;
  const totalGroups = new Set(contacts.map((c) => c.relationship || c.category).filter(Boolean)).size;
  const totalPlaces = new Set(contacts.map((c) => c.location).filter(Boolean)).size;
  const totalFavorites = contacts.filter((c) => c.favorite).length;

  const workspaceLabel = workspaceMode === 'demo' ? 'DEMO' : 'PERSONAL';

  const handleExport = () => {
    const jsonStr = exportContactsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `people_atlas_${workspaceMode}_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage('Backup file downloaded successfully!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') return;
      try {
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.contacts) ? parsed.contacts : null;
        if (!list) {
          setImportError('Invalid file format. Backup must contain a list of contacts.');
          return;
        }
        const validCount = list.filter((i) => i && typeof i === 'object' && i.name).length;
        if (validCount === 0) {
          setImportError('No valid contacts found in this file.');
          return;
        }
        setPendingImport({ raw: content, count: validCount, fileName: file.name });
      } catch {
        setImportError('Could not parse this file as JSON.');
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read file.');
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const completeImport = (mode) => {
    if (!pendingImport) return;
    const result = importContactsJSON(pendingImport.raw, mode);
    setPendingImport(null);
    if (result.success) {
      loadData();
      setToastMessage(
        mode === 'replace'
          ? `Replaced workspace with ${result.count} people from backup.`
          : `Merged ${result.count} people into your ${workspaceMode} workspace.`
      );
    } else {
      setImportError(result.error || 'Failed to import backup file.');
    }
  };

  const handleClearConfirm = () => {
    clearAllContacts();
    setIsClearOpen(false);
    loadData();
    setToastMessage(`${workspaceLabel.charAt(0) + workspaceLabel.slice(1).toLowerCase()} workspace cleared.`);
  };

  const handleResetDemo = () => {
    resetDemoData();
    loadData();
    setToastMessage('Demo dataset restored to its original state.');
  };

  const handleOpenDemo = () => {
    switchToDemo();
    setToastMessage('Demo workspace opened. Use Exit Demo in the banner to return.');
  };

  return (
    <div className="page-container data-page-layout">
      <header className="page-editorial-header">
        <div className="header-titles">
          <div className="title-with-count">
            <h1 className="page-title">DATA &amp; PRIVACY</h1>
            <span className="count-tag mono-font">{workspaceLabel} WORKSPACE</span>
          </div>
          <p className="page-subtitle">Your people, stored locally on this device.</p>
        </div>
      </header>

      <div className="atlas-stats-strip mono-font">
        <span><strong>{totalPeople}</strong> PEOPLE</span>
        <span>/</span>
        <span><strong>{totalGroups}</strong> GROUPS</span>
        <span>/</span>
        <span><strong>{totalPlaces}</strong> PLACES</span>
        <span>/</span>
        <span><strong>{totalFavorites}</strong> KEEP CLOSE</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section className="editorial-rule-section">
          <h3 className="section-rule-title">BACKUP &amp; RESTORE</h3>

          <div className="dossier-grid">
            <div className="dossier-card">
              <span className="dossier-card-title">EXPORT PEOPLE ATLAS</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-text)', margin: '0.2rem 0' }}>
                Download portable JSON backup of the {workspaceLabel.toLowerCase()} workspace
              </p>
              <button type="button" onClick={handleExport} className="btn-editorial-primary" style={{ alignSelf: 'flex-start' }}>
                <span>EXPORT →</span>
              </button>
            </div>

            <div className="dossier-card">
              <span className="dossier-card-title">IMPORT PEOPLE ATLAS</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-text)', margin: '0.2rem 0' }}>
                Restore contacts from a saved JSON file (merge or replace)
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-editorial-secondary"
                style={{ alignSelf: 'flex-start' }}
              >
                <span>IMPORT →</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                style={{ display: 'none' }}
              />
            </div>
          </div>
          {importError && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.75rem' }}>{importError}</p>
          )}
        </section>

        <section className="editorial-rule-section">
          <h3 className="section-rule-title">STORAGE &amp; PRIVACY</h3>
          <div className="journal-entry-row">
            <div>
              <strong>LOCAL BROWSER STORAGE</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-text)', margin: 0 }}>
                Data remains strictly inside your browser. No external cloud server.
              </p>
            </div>
            <span className="mono-font" style={{ fontWeight: '700', color: 'var(--color-accent-deep)' }}>● LOCAL</span>
          </div>

          <div className="journal-entry-row">
            <div>
              <strong>{workspaceMode === 'demo' ? 'RESET DEMO DATASET' : 'DEMO WORKSPACE'}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-text)', margin: 0 }}>
                {workspaceMode === 'demo'
                  ? 'Restore the original sample dataset and activity logs for this demo workspace.'
                  : 'Explore the full sample network in an isolated demo workspace. Your personal contacts stay untouched.'}
              </p>
            </div>
            {workspaceMode === 'demo' ? (
              <button type="button" onClick={handleResetDemo} className="btn-editorial-secondary">
                <Icon name="data" size={15} />
                <span>Reset Demo Data</span>
              </button>
            ) : (
              <button type="button" onClick={handleOpenDemo} className="btn-editorial-secondary">
                <Icon name="atlas" size={15} />
                <span>Open Demo</span>
              </button>
            )}
          </div>
        </section>

        <section className="editorial-rule-section">
          <h3 className="section-rule-title" style={{ color: 'var(--color-danger)' }}>DANGER ZONE</h3>
          <div className="journal-entry-row">
            <div>
              <strong>CLEAR {workspaceLabel} WORKSPACE</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-text)', margin: 0 }}>
                Permanently delete all contacts in the {workspaceLabel.toLowerCase()} workspace from this browser.
                The other workspace is not affected.
              </p>
            </div>
            <button type="button" onClick={() => setIsClearOpen(true)} className="btn-danger-outline">
              CLEAR WORKSPACE →
            </button>
          </div>
        </section>
      </div>

      {/* Merge / Replace import choice */}
      {pendingImport && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setPendingImport(null)}>
          <div className="confirm-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-warning-icon">
                <Icon name="data" size={20} />
              </div>
              <h3 className="dialog-title">IMPORT {pendingImport.count} PEOPLE</h3>
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="dialog-close-btn"
                aria-label="Close import dialog"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="dialog-body">
              <p className="dialog-message">
                File <strong>{pendingImport.fileName}</strong> contains {pendingImport.count}{' '}
                {pendingImport.count === 1 ? 'contact' : 'contacts'}. How should they be added to your{' '}
                {workspaceLabel.toLowerCase()} workspace?
              </p>
              <p className="dialog-message" style={{ fontSize: '0.8rem', color: 'var(--color-secondary-text)' }}>
                <strong>Merge</strong> keeps your existing people and adds the imported ones (duplicate IDs are given new
                IDs). <strong>Replace</strong> clears this workspace first, then imports.
              </p>
            </div>
            <div className="dialog-actions dialog-actions-three">
              <button type="button" onClick={() => setPendingImport(null)} className="btn-dialog-cancel">
                Cancel
              </button>
              <button type="button" onClick={() => completeImport('replace')} className="btn-dialog-cancel">
                Replace All
              </button>
              <button type="button" onClick={() => completeImport('merge')} className="btn-dialog-delete" style={{ backgroundColor: 'var(--color-accent-deep)' }}>
                <Icon name="check" size={15} />
                <span>Merge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isClearOpen}
        title={`Clear entire ${workspaceLabel.toLowerCase()} workspace?`}
        message={`This will permanently delete all contacts stored in the ${workspaceLabel.toLowerCase()} workspace. Your ${workspaceMode === 'demo' ? 'personal' : 'demo'} workspace is not affected. Export a backup first if needed!`}
        confirmLabel="Yes, Clear Everything"
        cancelLabel="Cancel"
        onConfirm={handleClearConfirm}
        onCancel={() => setIsClearOpen(false)}
      />

      <Toast message={toastMessage} type="success" onClose={() => setToastMessage('')} />
    </div>
  );
}
