import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContacts } from '../utils/contactStorage';
import InsightsDonutChart from '../components/InsightsDonutChart';
import Icon from '../components/Icon';
import {
  getGroupStats,
  getPlaceStats,
  getRelationshipStats,
  getCloseContactStats,
  getDataCompleteness,
  generateInsights,
  getNetworkBalance
} from '../utils/insightCalculations';

export default function Atlas() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    setContacts(getContacts());
  }, []);

  const totalPeople = contacts.length;
  const groupStats = getGroupStats(contacts);
  const { topPlaces, totalPlaces } = getPlaceStats(contacts);
  const relationshipStats = getRelationshipStats(contacts);
  const closeStats = getCloseContactStats(contacts);
  const completeness = getDataCompleteness(contacts);
  const insightsList = generateInsights(contacts);
  const networkBalance = getNetworkBalance(contacts);

  if (totalPeople === 0) {
    return (
      <div className="page-container insights-page-layout">
        <header className="page-editorial-header">
          <div className="header-titles">
            <h1 className="page-title">NETWORK INSIGHTS</h1>
            <p className="page-subtitle">
              Understand your network through the patterns in your people, places, and relationships.
            </p>
          </div>
        </header>

        <div className="editorial-empty-box fade-in-up">
          <Icon name="insights" size={40} className="brand-icon" />
          <h3 style={{ fontFamily: 'var(--font-display)', margin: 0, textTransform: 'uppercase' }}>
            NO CONTACTS AVAILABLE
          </h3>
          <p style={{ color: 'var(--color-secondary-text)', maxWidth: '420px', margin: 0 }}>
            Add people to start discovering patterns in your network, or explore the demo dataset first.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" className="btn-editorial-primary" onClick={() => navigate('/add-contact')}>
              <Icon name="plus" size={16} />
              <span>+ ADD PERSON</span>
            </button>
            <button type="button" className="btn-editorial-secondary" onClick={() => navigate('/demo')}>
              <Icon name="atlas" size={16} />
              <span>EXPLORE DEMO</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const maxGroupCount = groupStats.length > 0 ? Math.max(...groupStats.map((g) => g.count)) : 1;
  const maxPlaceCount = topPlaces.length > 0 ? Math.max(...topPlaces.map((p) => p.count)) : 1;
  const maxRelCount = relationshipStats.length > 0 ? Math.max(...relationshipStats.map((r) => r.count)) : 1;

  return (
    <div className="page-container insights-page-layout">
      <header className="page-editorial-header">
        <div className="header-titles">
          <h1 className="page-title">NETWORK INSIGHTS</h1>
          <p className="page-subtitle">
            Understand your network through the patterns in your people, places, and relationships.
          </p>
        </div>
      </header>

      <div className="landscape-stats-line mono-font">
        <span><strong>{totalPeople}</strong> PEOPLE</span>
        <span className="stats-sep">/</span>
        <span><strong>{groupStats.length}</strong> GROUPS</span>
        <span className="stats-sep">/</span>
        <span><strong>{totalPlaces}</strong> PLACES</span>
        <span className="stats-sep">/</span>
        <span><strong>{closeStats.closeCount}</strong> CLOSE</span>
      </div>

      <section className="editorial-rule-section" style={{ gap: '0.4rem' }}>
        <h3 className="section-rule-title">NETWORK SNAPSHOT</h3>
        <p className="snapshot-text">
          Your contact network spans <strong>{groupStats.length} groups</strong> and <strong>{totalPlaces} places</strong>.
        </p>
      </section>

      <div className="insights-editorial-grid">
        <section className="editorial-rule-section insights-grid-item chart-card-anim">
          <h3 className="section-rule-title">CONTACTS BY GROUP</h3>
          <div className="vertical-bar-chart">
            {groupStats.map((group, idx) => {
              const heightPct = Math.max(12, Math.round((group.count / maxGroupCount) * 100));
              return (
                <div key={group.category} className="bar-column">
                  <span className="bar-val mono-font">{group.count}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill bar-grow"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: group.color,
                        animationDelay: `${idx * 90}ms`
                      }}
                      title={`${group.category}: ${group.count} contacts (${group.percentage}%)`}
                    />
                  </div>
                  <span className="bar-cat-label mono-font">{group.category.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="editorial-rule-section insights-grid-item chart-card-anim" style={{ animationDelay: '90ms' }}>
          <h3 className="section-rule-title">NETWORK COMPOSITION</h3>
          <InsightsDonutChart groupStats={groupStats} />
        </section>
      </div>

      <div className="insights-editorial-grid">
        <section className="editorial-rule-section insights-grid-item chart-card-anim" style={{ animationDelay: '120ms' }}>
          <h3 className="section-rule-title">WHERE YOUR PEOPLE ARE</h3>
          <p className="insights-subnote mono-font">{totalPlaces} places across your network.</p>
          <div className="horizontal-bar-stack">
            {topPlaces.map((place, idx) => {
              const widthPct = Math.max(8, Math.round((place.count / maxPlaceCount) * 100));
              return (
                <div key={place.location} className="horizontal-bar-row">
                  <span className="hbar-label">{place.location.toUpperCase()}</span>
                  <div className="hbar-track">
                    <div
                      className="hbar-fill hbar-grow"
                      style={{ width: `${widthPct}%`, animationDelay: `${idx * 70}ms` }}
                      title={`${place.location}: ${place.count} contacts`}
                    />
                  </div>
                  <span className="hbar-val mono-font">{place.count}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="editorial-rule-section insights-grid-item chart-card-anim" style={{ animationDelay: '160ms' }}>
          <h3 className="section-rule-title">RELATIONSHIP MIX</h3>
          <div className="horizontal-bar-stack">
            {relationshipStats.map((rel, idx) => {
              const widthPct = Math.max(8, Math.round((rel.count / maxRelCount) * 100));
              return (
                <div key={rel.relationship} className="horizontal-bar-row">
                  <span className="hbar-label">{rel.relationship.toUpperCase()}</span>
                  <div className="hbar-track">
                    <div
                      className="hbar-fill hbar-fill-accent hbar-grow"
                      style={{ width: `${widthPct}%`, animationDelay: `${idx * 70}ms` }}
                      title={`${rel.relationship}: ${rel.count} contacts`}
                    />
                  </div>
                  <span className="hbar-val mono-font">{rel.count}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="editorial-rule-section">
        <h3 className="section-rule-title">PEOPLE YOU KEEP CLOSE</h3>
        <div className="close-analysis-box">
          <div className="close-stat-headline">
            <span className="close-big-num mono-font">{closeStats.closeCount}</span>
            <div className="close-stat-text">
              <strong style={{ textTransform: 'uppercase', fontSize: '0.95rem' }}>Close Contacts</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-secondary-text)' }}>
                {closeStats.closePercentage}% of your network is marked as close ({closeStats.closeCount} / {totalPeople}).
              </p>
            </div>
          </div>

          <div className="close-indicator-bar-track">
            <div
              className="close-indicator-bar-fill hbar-grow"
              style={{ width: `${closeStats.closePercentage}%` }}
            />
          </div>
        </div>
      </section>

      <section className="editorial-rule-section">
        <h3 className="section-rule-title">CONTACT DATA HEALTH</h3>
        <div className="health-grid">
          {completeness.map((item) => (
            <div key={item.field} className="health-item-card">
              <div className="health-item-header">
                <span className="health-field-name mono-font">{item.field}</span>
                <span className="health-field-pct mono-font">{item.percentage}%</span>
              </div>
              <div className="health-track">
                <div
                  className="health-fill hbar-grow"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <span className="health-count-sub mono-font">{item.count} / {totalPeople} records</span>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-rule-section">
        <h3 className="section-rule-title">WHAT STANDS OUT</h3>
        <div className="standout-list-stack">
          {insightsList.map((item, idx) => (
            <div key={idx} className="standout-item-row fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <span className="standout-num mono-font">0{idx + 1}</span>
              <p className="standout-text">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-rule-section">
        <h3 className="section-rule-title">NETWORK BALANCE</h3>
        <div className="network-balance-table">
          <div className="balance-row">
            <span className="balance-key">GROUP DIVERSITY</span>
            <span className="balance-val mono-font">{networkBalance.groupDiversity}</span>
          </div>
          <div className="balance-row">
            <span className="balance-key">PLACE DIVERSITY</span>
            <span className="balance-val mono-font">{networkBalance.placeDiversity}</span>
          </div>
          <div className="balance-row">
            <span className="balance-key">CLOSE CIRCLE SHARE</span>
            <span className="balance-val mono-font">{networkBalance.closeCircle}</span>
          </div>
          <div className="balance-row">
            <span className="balance-key">DATA COMPLETENESS</span>
            <span className="balance-val mono-font">{networkBalance.dataCompleteness}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
