import React from 'react';

/**
 * Gets 1-2 letter initials from a person's name.
 * e.g., "Aravind Swamy" -> "AS", "Arun" -> "A", "Deepa Raman" -> "DR"
 */
function getInitials(name = '') {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Editorial Archival Monogram Component
 */
export default function Monogram({ name, size = 'md', className = '' }) {
  const initials = getInitials(name);

  return (
    <div className={`monogram-box monogram-${size} ${className}`} aria-hidden="true">
      <span className="monogram-text">{initials}</span>
    </div>
  );
}
