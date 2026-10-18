import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function NotFound() {
  return (
    <div className="directory-page">
      <div className="directory-empty-state" style={{ margin: '3rem auto', maxWidth: '520px' }}>
        <Icon name="warning" size={40} className="empty-icon" />
        <h1 className="editorial-page-title" style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>404</h1>
        <h3 className="empty-title">This page doesn't exist</h3>
        <p className="empty-desc">
          The address you visited could not be found or may have been moved.
        </p>
        <Link to="/people" className="btn-add-contact" style={{ display: 'inline-flex', marginTop: '1rem' }}>
          <Icon name="arrow-left" size={15} />
          <span>Back to People</span>
        </Link>
      </div>
    </div>
  );
}
