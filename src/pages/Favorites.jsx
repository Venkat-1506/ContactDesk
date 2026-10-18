import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Monogram from '../components/Monogram';
import Icon from '../components/Icon';
import { getContacts, toggleFavorite } from '../utils/contactStorage';

export default function Favorites() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const loadData = () => {
    setContacts(getContacts().filter((c) => c.favorite));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcut: Pressing "/" focuses search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleFav = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    loadData();
  };

  // Filter close people by search query
  const filteredFavorites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return contacts;

    return contacts.filter((c) => {
      const nameMatch = (c.name || '').toLowerCase().includes(query);
      const phoneMatch = (c.phone || '').toLowerCase().includes(query);
      const emailMatch = (c.email || '').toLowerCase().includes(query);
      const orgMatch = (c.organization || '').toLowerCase().includes(query);
      const locMatch = (c.location || '').toLowerCase().includes(query);
      const catMatch = (c.category || '').toLowerCase().includes(query);
      const relMatch = (c.relationship || '').toLowerCase().includes(query);
      const notesMatch = (c.notes || '').toLowerCase().includes(query);

      return nameMatch || phoneMatch || emailMatch || orgMatch || locMatch || catMatch || relMatch || notesMatch;
    });
  }, [contacts, searchQuery]);

  return (
    <div className="page-container favorites-page-layout">
      <header className="page-editorial-header">
        <div className="header-titles">
          <h1 className="page-title">PEOPLE I KEEP CLOSE</h1>
          <p className="page-subtitle">
            <span className="count-tag">{filteredFavorites.length} FAVORITES</span> · Your inner circle & prioritized contacts.
          </p>
        </div>
      </header>

      {/* Search Bar for Close People */}
      {contacts.length > 0 && (
        <div className="search-controls-bar">
          <div className="editorial-search-field">
            <span className="search-icon-symbol" aria-hidden="true">⌕</span>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input-element"
              placeholder="Find in close people by name, place, relationship..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search close people"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-secondary-text)' }}
                aria-label="Clear search"
              >
                <Icon name="close" size={16} />
              </button>
            )}
            <span className="shortcut-kbd" title="Press '/' key to focus search">/</span>
          </div>
        </div>
      )}

      <div className="directory-section">
        {contacts.length === 0 ? (
          <div className="editorial-empty-box">
            <Icon name="heart" size={36} className="empty-icon" />
            <h3>No close contacts marked yet</h3>
            <p>Click the heart icon on any person in your network to mark them as a close contact.</p>
            <Link to="/people" className="btn-editorial-primary">
              Browse People Directory
            </Link>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="editorial-empty-box">
            <Icon name="search" size={36} className="empty-icon" />
            <h3>No close contacts found</h3>
            <p>No results matching "{searchQuery}".</p>
            <button
              type="button"
              className="btn-editorial-secondary"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="flat-rows-stack">
            {filteredFavorites.map((person) => {
              const cleanPhone = (person.phone || '').replace(/\s+/g, '');
              const mailSubject = encodeURIComponent(`Connecting via People Atlas`);

              return (
                <div key={person.id} className="person-archival-row">
                  <Link to={`/contact/${person.id}`} className="row-identity-group">
                    <Monogram name={person.name} size="md" />
                    <div className="row-text-stack">
                      <span className="row-person-name">{person.name}</span>
                      <span className="row-person-meta">
                        <span className="meta-rel-highlight">{person.relationship || person.category}</span>
                        {person.location && <span>· {person.location}</span>}
                      </span>
                    </div>
                  </Link>

                  {/* Desktop Action Buttons */}
                  <div className="row-actions-group desktop-only">
                    {person.phone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="btn-action-touch mono-font"
                        aria-label={`Call ${person.name}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon name="phone" size={14} />
                        <span>Call</span>
                      </a>
                    )}

                    {person.email && (
                      <a
                        href={`mailto:${person.email}?subject=${mailSubject}`}
                        className="btn-action-touch mono-font"
                        aria-label={`Email ${person.name}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon name="email" size={14} />
                        <span>Email</span>
                      </a>
                    )}

                    <button
                      type="button"
                      className="row-fav-btn is-active"
                      onClick={(e) => handleToggleFav(person.id, e)}
                      aria-label={`Remove ${person.name} from close list`}
                    >
                      <Icon name="heart-filled" size={18} />
                    </button>

                    <Link to={`/contact/${person.id}`} className="row-chevron-icon" aria-label={`View ${person.name} record`}>
                      <Icon name="chevron-right" size={18} />
                    </Link>
                  </div>

                  {/* Mobile Contact Action Bar (Call/Email on left, Heart and > on far right) */}
                  <div className="mobile-row-actions-bar mobile-only">
                    <div className="action-left">
                      {person.phone && (
                        <a
                          href={`tel:${cleanPhone}`}
                          className="btn-action-touch mono-font"
                          aria-label={`Call ${person.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name="phone" size={13} />
                          <span>Call</span>
                        </a>
                      )}

                      {person.email && (
                        <a
                          href={`mailto:${person.email}?subject=${mailSubject}`}
                          className="btn-action-touch mono-font"
                          aria-label={`Email ${person.name}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name="email" size={13} />
                          <span>Email</span>
                        </a>
                      )}
                    </div>

                    <div className="action-right">
                      <button
                        type="button"
                        className="row-fav-btn is-active"
                        onClick={(e) => handleToggleFav(person.id, e)}
                        aria-label={`Remove ${person.name} from favorites`}
                      >
                        <Icon name="heart-filled" size={18} />
                      </button>

                      <Link to={`/contact/${person.id}`} className="row-chevron-icon" aria-label={`View ${person.name} details`}>
                        <Icon name="chevron-right" size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
