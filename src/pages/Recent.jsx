import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Monogram from '../components/Monogram';
import { getContacts, getActivityLogs } from '../utils/contactStorage';

function formatTimestamp(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function groupLogsByDate(logs) {
  const groups = {
    TODAY: [],
    YESTERDAY: [],
    'THIS WEEK': [],
    EARLIER: []
  };

  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  logs.forEach((item) => {
    const itemDate = new Date(item.timestamp || item.date || item.createdAt);
    const itemDateStr = itemDate.toDateString();

    if (itemDateStr === todayStr) {
      groups.TODAY.push(item);
    } else if (itemDateStr === yesterdayStr) {
      groups.YESTERDAY.push(item);
    } else if (itemDate >= weekAgo) {
      groups['THIS WEEK'].push(item);
    } else {
      groups.EARLIER.push(item);
    }
  });

  return groups;
}

export default function Recent() {
  const [activeTab, setActiveTab] = useState('ACTIVITY'); // 'ACTIVITY' | 'ADDED' | 'UPDATED'
  const contacts = getContacts();
  const activityLogs = getActivityLogs();

  const groupedActivity = groupLogsByDate(activityLogs);

  const recentlyAdded = [...contacts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const recentlyUpdated = [...contacts]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="page-container recent-page-layout">
      {/* Editorial Header */}
      <header className="page-editorial-header">
        <div className="header-titles">
          <div className="title-with-count">
            <h1 className="page-title">RECENT</h1>
            <span className="count-tag">ACTIVITY JOURNAL</span>
          </div>
          <p className="page-subtitle">Personal activity and connection history.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="filter-tabs-scroll-container" role="tablist" aria-label="Recent activity navigation">
        <button
          role="tab"
          aria-selected={activeTab === 'ACTIVITY'}
          className={`editorial-tab ${activeTab === 'ACTIVITY' ? 'active' : ''}`}
          onClick={() => setActiveTab('ACTIVITY')}
        >
          ACTIVITY ({activityLogs.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'ADDED'}
          className={`editorial-tab ${activeTab === 'ADDED' ? 'active' : ''}`}
          onClick={() => setActiveTab('ADDED')}
        >
          RECENTLY ADDED ({recentlyAdded.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'UPDATED'}
          className={`editorial-tab ${activeTab === 'UPDATED' ? 'active' : ''}`}
          onClick={() => setActiveTab('UPDATED')}
        >
          RECENTLY UPDATED ({recentlyUpdated.length})
        </button>
      </div>

      {/* Activity Feed */}
      {activeTab === 'ACTIVITY' && (
        <div className="activity-journal-feed">
          {Object.entries(groupedActivity).map(([groupName, items]) => {
            if (items.length === 0) return null;

            return (
              <section key={groupName} className="editorial-rule-section">
                <h3 className="section-rule-title">{groupName}</h3>
                <div className="journal-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="activity-log-item">
                      <div className="activity-time-col">
                        <span className="mono-font activity-time">{formatTimestamp(item.timestamp)}</span>
                      </div>

                      <div className="activity-icon-badge">
                        <Icon
                          name={
                            item.interactionType === 'Phone Call'
                              ? 'phone'
                              : item.interactionType === 'Email'
                              ? 'email'
                              : item.type === 'ADDED'
                              ? 'plus'
                              : item.type === 'TOGGLE_CLOSE'
                              ? 'heart-filled'
                              : 'clock'
                          }
                          size={14}
                        />
                      </div>

                      <div className="activity-desc-col">
                        <div className="activity-desc">
                          {item.contactId ? (
                            <Link to={`/contact/${item.contactId}`} className="activity-contact-link">
                              {item.description}
                            </Link>
                          ) : (
                            <span>{item.description}</span>
                          )}
                        </div>
                        {item.relationship && <span className="activity-rel-sub">{item.relationship}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {activityLogs.length === 0 && (
            <div className="editorial-empty-box">
              <Icon name="clock" size={32} />
              <h3>No Activity Logged Yet</h3>
              <p>Log a call, email, or meeting from the Contact Desk or Person Profile to record your activity journal.</p>
            </div>
          )}
        </div>
      )}

      {/* Recently Added */}
      {activeTab === 'ADDED' && (
        <div className="recent-list-container">
          {recentlyAdded.map((person) => (
            <div key={person.id} className="journal-entry-row">
              <Link to={`/contact/${person.id}`} className="journal-identity">
                <Monogram name={person.name} size="sm" />
                <div>
                  <span className="row-person-name">{person.name}</span>
                  <span className="row-person-meta">
                    {person.relationship} {person.organization ? `· ${person.organization}` : ''}
                  </span>
                </div>
              </Link>
              <span className="journal-timestamp">Added {new Date(person.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recently Updated */}
      {activeTab === 'UPDATED' && (
        <div className="recent-list-container">
          {recentlyUpdated.map((person) => (
            <div key={person.id} className="journal-entry-row">
              <Link to={`/contact/${person.id}`} className="journal-identity">
                <Monogram name={person.name} size="sm" />
                <div>
                  <span className="row-person-name">{person.name}</span>
                  <span className="row-person-meta">
                    {person.relationship} {person.organization ? `· ${person.organization}` : ''}
                  </span>
                </div>
              </Link>
              <span className="journal-timestamp">Updated {new Date(person.updatedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

