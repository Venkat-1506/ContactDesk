import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Monogram from '../components/Monogram';
import Icon from '../components/Icon';
import { getContacts } from '../utils/contactStorage';

export default function Places() {
  const [contacts, setContacts] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState('ALL');

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  // Group contacts by location
  const locationGroups = useMemo(() => {
    const map = new Map();

    contacts.forEach((c) => {
      const raw = c.location && c.location.trim() ? c.location.trim() : 'Unspecified Location';
      const key = raw.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { label: raw, people: [] });
      }
      map.get(key).people.push(c);
    });

    return Array.from(map.values())
      .map(({ label, people }) => ({
        place: label,
        people,
        count: people.length
      }))
      .sort((a, b) => b.count - a.count);
  }, [contacts]);

  const filteredGroups = useMemo(() => {
    if (selectedPlace === 'ALL') return locationGroups;
    return locationGroups.filter((g) => g.place === selectedPlace);
  }, [locationGroups, selectedPlace]);

  return (
    <div className="page-container places-page-layout">
      <header className="page-editorial-header">
        <div className="header-titles">
          <h1 className="page-title">PLACES</h1>
          <p className="page-subtitle">Explore the people in your network by where they are.</p>
        </div>
      </header>

      {/* Places Category Filter Strip */}
      <div className="category-nav-wrapper">
        <nav className="category-nav-strip" aria-label="Filter by place">
          <button
            type="button"
            className={`category-tab-btn ${selectedPlace === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedPlace('ALL')}
          >
            ALL PLACES ({locationGroups.length})
          </button>
          {locationGroups.map((g) => (
            <button
              key={g.place}
              type="button"
              className={`category-tab-btn ${selectedPlace === g.place ? 'active' : ''}`}
              onClick={() => setSelectedPlace(g.place)}
            >
              {g.place.toUpperCase()} ({g.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Location Sections with Strong Typography & Structural Rules */}
      <div className="places-list-stack">
        {filteredGroups.length === 0 ? (
          <div className="editorial-empty-box">
            <Icon name="places" size={36} className="empty-icon" />
            <p>No contacts found for this location.</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.place} className="place-group-block">
              <div className="place-header-rule">
                <h3 className="place-heading">{group.place.toUpperCase()}</h3>
                <span className="count-tag">
                  {group.count < 10 ? `0${group.count}` : group.count} {group.count === 1 ? 'PERSON' : 'PEOPLE'}
                </span>
              </div>

              <div className="place-people-grid">
                {group.people.map((person) => (
                  <div key={person.id} className="person-archival-row">
                    <Link to={`/contact/${person.id}`} className="row-identity-group">
                      <Monogram name={person.name} size="sm" />
                      <div className="row-text-stack">
                        <span className="row-person-name">{person.name}</span>
                        <span className="row-person-meta">
                          <span className="meta-rel-highlight">{person.relationship || person.category}</span>
                          {person.organization && <span>· {person.organization}</span>}
                        </span>
                      </div>
                    </Link>

                    {/* Touch-friendly Call/Email actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {person.phone && (
                        <a
                          href={`tel:${person.phone.replace(/\s+/g, '')}`}
                          className="btn-action-touch mono-font"
                          aria-label={`Call ${person.name}`}
                        >
                          <Icon name="phone" size={14} />
                          <span>Call</span>
                        </a>
                      )}
                      {person.email && (
                        <a
                          href={`mailto:${person.email}?subject=${encodeURIComponent('Connecting via People Atlas')}`}
                          className="btn-action-touch mono-font"
                          aria-label={`Email ${person.name}`}
                        >
                          <Icon name="email" size={14} />
                          <span>Email</span>
                        </a>
                      )}
                      <Link to={`/contact/${person.id}`} style={{ color: 'var(--color-secondary-text)', display: 'inline-flex', padding: '0.3rem' }} aria-label={`View ${person.name} record`}>
                        <Icon name="chevron-right" size={18} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
