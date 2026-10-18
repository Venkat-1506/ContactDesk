import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContacts, switchToPersonal } from '../utils/contactStorage';
import Icon from '../components/Icon';

export default function AppWorkspace() {
  const navigate = useNavigate();
  const [contactCount, setContactCount] = useState(null);

  useEffect(() => {
    switchToPersonal();
    try {
      setContactCount(getContacts().length);
    } catch {
      setContactCount(0);
    }
  }, []);

  if (contactCount === null) {
    return (
      <div className="workspace-choice-page">
        <p className="workspace-loading mono-font">OPENING YOUR WORKSPACE…</p>
      </div>
    );
  }

  if (contactCount === 0) {
    return (
      <div className="workspace-choice-page">
        <div className="workspace-choice-card fade-in-up">
          <span className="workspace-eyebrow mono-font">PERSONAL WORKSPACE · EMPTY</span>
          <h1 className="workspace-title">Build your atlas from scratch</h1>
          <p className="workspace-text">
            Your personal workspace starts empty and stays private to this browser. Add your first
            person, import a backup you exported earlier, or explore the demo dataset first.
          </p>
          <div className="workspace-actions">
            <button type="button" className="btn-editorial-primary btn-lg" onClick={() => navigate('/add-contact')}>
              <Icon name="plus" size={18} />
              <span>Add Your First Person</span>
            </button>
            <button type="button" className="btn-editorial-secondary btn-lg" onClick={() => navigate('/data')}>
              <Icon name="data" size={18} />
              <span>Import a Backup</span>
            </button>
            <button type="button" className="btn-editorial-secondary btn-lg" onClick={() => navigate('/demo')}>
              <Icon name="insights" size={18} />
              <span>Explore Demo First</span>
            </button>
          </div>
          <button type="button" className="workspace-home-link" onClick={() => navigate('/')}>
            ← Back to product page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-choice-page">
      <div className="workspace-choice-card fade-in-up">
        <span className="workspace-eyebrow mono-font">PERSONAL WORKSPACE</span>
        <h1 className="workspace-title">Welcome back</h1>
        <p className="workspace-text">
          You have <strong>{contactCount}</strong> {contactCount === 1 ? 'person' : 'people'} saved in this
          browser. Pick up where you left off.
        </p>
        <div className="workspace-actions">
          <button type="button" className="btn-editorial-primary btn-lg" onClick={() => navigate('/insights')}>
            <Icon name="insights" size={18} />
            <span>Go to Insights</span>
          </button>
          <button type="button" className="btn-editorial-secondary btn-lg" onClick={() => navigate('/people')}>
            <Icon name="people" size={18} />
            <span>Browse People</span>
          </button>
          <button type="button" className="btn-editorial-secondary btn-lg" onClick={() => navigate('/demo')}>
            <Icon name="atlas" size={18} />
            <span>Open Demo Workspace</span>
          </button>
        </div>
        <button type="button" className="workspace-home-link" onClick={() => navigate('/')}>
          ← Back to product page
        </button>
      </div>
    </div>
  );
}
