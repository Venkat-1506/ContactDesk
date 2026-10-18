import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Monogram from '../components/Monogram';
import Icon from '../components/Icon';
import { getContacts, toggleFavorite } from '../utils/contactStorage';

export default function People() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('name-asc');
  const searchInputRef = useRef(null);

  const loadData = () => {
    setContacts(getContacts());
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

  const handleToggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    loadData();
  };

  // Filter & Search logic across 8 attributes
  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return contacts.filter((c) => {
      if (activeCategory !== 'ALL') {
        const cat = (c.category || '').toUpperCase();
        if (cat !== activeCategory) return false;
      }

      if (!query) return true;

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
  }, [contacts, searchQuery, activeCategory]);

  // Sort logic
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'updated') return new Date(b.updatedAt) - new Date(a.updatedAt);
      return 0;
    });
  }, [filteredContacts, sortBy]);

  // Alphabetical Grouping (when sorted A-Z)
  const groupedByAlpha = useMemo(() => {
    if (sortBy !== 'name-asc') return null;

    const groups = new Map();
    sortedContacts.forEach((person) => {
      const letter = (person.name[0] || '#').toUpperCase();
      if (!groups.has(letter)) {
        groups.set(letter, []);
      }
      groups.get(letter).push(person);
    });

    return Array.from(groups.entries());
  }, [sortedContacts, sortBy]);

  const categories = ['ALL', 'COLLEGE', 'WORK', 'FAMILY', 'PERSONAL', 'OTHER'];

  return (
    <div className="page-container people-page-layout">
      {/* Page Header */}
      <header className="page-editorial-header">
        <div className="header-titles">
          <div className="title-with-count">
            <h1 className="page-title">PEOPLE</h1>
            <span className="count-tag mono-font">
              {filteredContacts.length} {filteredContacts.length === 1 ? 'PERSON FOUND' : 'PEOPLE FOUND'}
            </span>
          </div>
          <p className="page-subtitle">Complete directory of your personal network.</p>
        </div>
      </header>

      {/* Search & Sort Controls Bar */}
      <div className="search-controls-bar">
        <div className="editorial-search-field">
          <span className="search-icon-symbol" aria-hidden="true">⌕</span>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input-element"
            placeholder="Find someone by name, place, relationship..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search people in network"
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

        <div className="editorial-sort-wrapper">
          <Icon name="sort" size={15} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select-input"
            aria-label="Sort options"
          >
            <option value="name-asc">Sort: A to Z</option>
            <option value="name-desc">Sort: Z to A</option>
            <option value="recent">Sort: Recently Added</option>
            <option value="updated">Sort: Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Category Navigation (Horizontally Swipeable Strip for Mobile) */}
      <div className="category-nav-wrapper">
        <nav className="category-nav-strip" aria-label="Filter people by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>

      {/* People Directory Content */}
      <div className="directory-section">
        {sortedContacts.length === 0 ? (
          <div className="editorial-empty-box">
            <Icon name="users" size={36} className="empty-icon" />
            <h3>No people found</h3>
            <p>
              {searchQuery
                ? `No results matching "${searchQuery}".`
                : 'Your directory is empty.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                className="btn-editorial-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('ALL');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : groupedByAlpha ? (
          /* Alphabetical Sections with Rule Separators */
          groupedByAlpha.map(([letter, peopleList]) => (
            <div key={letter} className="alpha-group-block">
              <div className="alpha-label-line">
                <span className="alpha-char">{letter}</span>
                <div className="alpha-rule" />
              </div>
              <div className="alpha-rows-stack">
                {peopleList.map((person) => (
                  <PersonRow key={person.id} person={person} onToggleFavorite={handleToggleFavorite} />
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Flat list */
          <div className="flat-rows-stack">
            {sortedContacts.map((person) => (
              <PersonRow key={person.id} person={person} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PersonRow({ person, onToggleFavorite }) {
  const cleanPhone = (person.phone || '').replace(/\s+/g, '');
  const mailSubject = encodeURIComponent(`Connecting via People Atlas`);

  return (
    <div className="person-archival-row">
      <Link to={`/contact/${person.id}`} className="row-identity-group">
        <Monogram name={person.name} size="md" />
        <div className="row-text-stack">
          <span className="row-person-name">{person.name}</span>
          <span className="row-person-meta">
            <span className="meta-rel-highlight">{person.relationship || person.category}</span>
            {person.location && <span>· {person.location}</span>}
            {person.organization && <span>· {person.organization}</span>}
          </span>
        </div>
      </Link>

      {/* Desktop Right Action Buttons */}
      <div className="row-actions-group desktop-only">
        {person.phone && (
          <a
            href={`tel:${cleanPhone}`}
            className="btn-action-touch mono-font"
            title={`Call ${person.name}`}
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
            title={`Email ${person.name}`}
            aria-label={`Email ${person.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon name="email" size={14} />
            <span>Email</span>
          </a>
        )}

        <button
          type="button"
          className={`row-fav-btn ${person.favorite ? 'is-active' : ''}`}
          onClick={(e) => onToggleFavorite(person.id, e)}
          title={person.favorite ? 'Remove from close list' : 'Keep close'}
          aria-label={person.favorite ? `Remove ${person.name} from close list` : `Mark ${person.name} as close`}
        >
          <Icon name={person.favorite ? 'heart-filled' : 'heart'} size={18} />
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
            className={`row-fav-btn ${person.favorite ? 'is-active' : ''}`}
            onClick={(e) => onToggleFavorite(person.id, e)}
            aria-label={person.favorite ? `Remove ${person.name} from favorites` : `Add ${person.name} to favorites`}
          >
            <Icon name={person.favorite ? 'heart-filled' : 'heart'} size={18} />
          </button>

          <Link to={`/contact/${person.id}`} className="row-chevron-icon" aria-label={`View ${person.name} details`}>
            <Icon name="chevron-right" size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
