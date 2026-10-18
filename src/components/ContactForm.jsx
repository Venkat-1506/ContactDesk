import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

export default function ContactForm({ initialData = null, onSubmit, isEditing = false }) {
  const navigate = useNavigate();

  // Extract initial professional links
  const initialLinks = () => {
    if (initialData?.professionalLinks && Array.isArray(initialData.professionalLinks)) {
      return [...initialData.professionalLinks];
    }
    const links = [];
    if (initialData?.linkedin) links.push({ type: 'LinkedIn', label: 'LinkedIn', url: initialData.linkedin });
    if (initialData?.instagram) links.push({ type: 'Instagram', label: 'Instagram', url: initialData.instagram });
    if (initialData?.github) links.push({ type: 'GitHub', label: 'GitHub', url: initialData.github });
    if (initialData?.portfolio) links.push({ type: 'Portfolio', label: 'Portfolio', url: initialData.portfolio });
    return links;
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    category: initialData?.category || 'College',
    relationship: initialData?.relationship || 'Classmate',
    organization: initialData?.organization || '',
    location: initialData?.location || initialData?.city || '',
    notes: initialData?.notes || initialData?.context || '',
    favorite: initialData?.favorite ?? initialData?.close ?? false,
    professionalTitle: initialData?.professionalTitle || initialData?.role || ''
  });

  // Dedicated states for standard professional links
  const getExistingUrl = (type) => {
    const found = initialLinks().find((l) => l.type?.toLowerCase() === type.toLowerCase());
    return found ? found.url : '';
  };

  const [linkedinUrl, setLinkedinUrl] = useState(() => getExistingUrl('LinkedIn'));
  const [instagramUrl, setInstagramUrl] = useState(() => getExistingUrl('Instagram'));
  const [githubUrl, setGithubUrl] = useState(() => getExistingUrl('GitHub'));
  const [portfolioUrl, setPortfolioUrl] = useState(() => getExistingUrl('Portfolio'));

  // Additional custom professional links
  const [extraLinks, setExtraLinks] = useState(() => {
    const standardTypes = ['linkedin', 'instagram', 'github', 'portfolio'];
    return initialLinks().filter((l) => !standardTypes.includes(l.type?.toLowerCase()));
  });

  const [errors, setErrors] = useState({});

  const categories = ['College', 'Work', 'Family', 'Personal', 'Other'];
  const relationshipPresets = [
    'Classmate',
    'Project Teammate',
    'Colleague',
    'Family',
    'Friend',
    'Mentor',
    'Client',
    'Neighbor',
    'Book Club Member',
    'Consultant',
    'Alumni',
    'Other'
  ];

  const linkTypes = [
    'X / Twitter',
    'Behance',
    'Dribbble',
    'YouTube',
    'Company Website',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddExtraLink = () => {
    setExtraLinks((prev) => [
      ...prev,
      { type: 'X / Twitter', label: 'X / Twitter', url: '' }
    ]);
  };

  const handleExtraLinkChange = (index, field, value) => {
    setExtraLinks((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
        label: field === 'type' ? value : copy[index].label
      };
      return copy;
    });
  };

  const handleRemoveExtraLink = (index) => {
    setExtraLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;
  const URL_REGEX = /^https?:\/\/.+\..+/i;

  const validateUrl = (value) => {
    if (!value.trim()) return true;
    const candidate = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
    if (!URL_REGEX.test(candidate)) return false;
    try {
      new URL(candidate);
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (formData.phone.trim() && !PHONE_REGEX.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number (digits, spaces, +, - only).';
    }

    const urlFields = [
      ['linkedinUrl', linkedinUrl, 'LinkedIn'],
      ['instagramUrl', instagramUrl, 'Instagram'],
      ['githubUrl', githubUrl, 'GitHub'],
      ['portfolioUrl', portfolioUrl, 'Portfolio']
    ];

    urlFields.forEach(([field, value, label]) => {
      if (!validateUrl(value || '')) {
        newErrors[field] = `${label} URL must be a valid link (e.g. https://…).`;
      }
    });

    extraLinks.forEach((l, idx) => {
      if (!validateUrl(l.url || '')) {
        newErrors[`extraLink_${idx}`] = 'Enter a valid URL (e.g. https://…).';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normalizeUrl = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const professionalLinks = [];

    if (linkedinUrl.trim()) {
      professionalLinks.push({ type: 'LinkedIn', label: 'LinkedIn', url: normalizeUrl(linkedinUrl) });
    }
    if (instagramUrl.trim()) {
      professionalLinks.push({ type: 'Instagram', label: 'Instagram', url: normalizeUrl(instagramUrl) });
    }
    if (githubUrl.trim()) {
      professionalLinks.push({ type: 'GitHub', label: 'GitHub', url: normalizeUrl(githubUrl) });
    }
    if (portfolioUrl.trim()) {
      professionalLinks.push({ type: 'Portfolio', label: 'Portfolio', url: normalizeUrl(portfolioUrl) });
    }

    extraLinks.forEach((l) => {
      if (l.url && l.url.trim()) {
        professionalLinks.push({
          type: l.type || 'Other',
          label: l.label || l.type || 'Link',
          url: normalizeUrl(l.url)
        });
      }
    });

    const finalPayload = {
      ...formData,
      close: formData.favorite,
      city: formData.location,
      professionalLinks
    };

    onSubmit(finalPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="editorial-form-stack">
      {/* 1. IDENTITY */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">1. IDENTITY</h3>

        <div className="form-num-section">
          <label htmlFor="name" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input-box"
            placeholder="e.g. Abhinav Murugan"
            value={formData.name}
            onChange={handleChange}
            autoFocus
          />
          {errors.name && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.name}</span>}
        </div>

        <div className="form-grid-two">
          <div className="form-num-section">
            <label htmlFor="phone" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="form-input-box mono-font"
              placeholder="e.g. +91 90348 59380"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.phone}</span>}
          </div>

          <div className="form-num-section">
            <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input-box"
              placeholder="e.g. abhinav@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.email}</span>}
          </div>
        </div>
      </section>

      {/* 2. RELATIONSHIP */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">2. RELATIONSHIP</h3>

        <div className="form-grid-two">
          <div className="form-num-section">
            <label htmlFor="relationship" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              Relationship Tag
            </label>
            <select
              id="relationship"
              name="relationship"
              className="form-select-box"
              value={formData.relationship}
              onChange={handleChange}
            >
              {relationshipPresets.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>

          <div className="form-num-section">
            <label htmlFor="category" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              Broad Category
            </label>
            <select
              id="category"
              name="category"
              className="form-select-box"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 3. LOCATION & ORGANIZATION */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">3. LOCATION &amp; ORGANIZATION</h3>

        <div className="form-grid-two">
          <div className="form-num-section">
            <label htmlFor="organization" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              Organization / College / Company
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              className="form-input-box"
              placeholder="e.g. Green Earth NGO"
              value={formData.organization}
              onChange={handleChange}
            />
          </div>

          <div className="form-num-section">
            <label htmlFor="location" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              City / Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-input-box"
              placeholder="e.g. Coimbatore"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* 4. CONTEXT */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">4. CONTEXT</h3>

        <div className="form-num-section">
          <label htmlFor="notes" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            Personal Notes &amp; Field Context
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            className="form-textarea-box"
            placeholder="e.g. UI/UX consultant for project aesthetic review."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              name="favorite"
              checked={formData.favorite}
              onChange={handleChange}
            />
            <span>Keep this person close (Mark as Favorite / Close)</span>
          </label>
        </div>
      </section>

      {/* 5. PROFESSIONAL PROFILE */}
      <section className="editorial-rule-section">
        <h3 className="section-rule-title">5. PROFESSIONAL PROFILE (OPTIONAL)</h3>

        <div className="form-num-section">
          <label htmlFor="professionalTitle" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            Professional Title / Role
          </label>
          <input
            id="professionalTitle"
            name="professionalTitle"
            type="text"
            className="form-input-box"
            placeholder="e.g. UI/UX Consultant"
            value={formData.professionalTitle}
            onChange={handleChange}
          />
        </div>

        <div className="form-grid-two">
          <div className="form-num-section">
            <label htmlFor="linkedinUrl" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              LinkedIn URL
            </label>
            <input
              id="linkedinUrl"
              type="url"
              className="form-input-box"
              placeholder="https://linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
            {errors.linkedinUrl && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.linkedinUrl}</span>}
          </div>

          <div className="form-num-section">
            <label htmlFor="instagramUrl" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              Instagram URL
            </label>
            <input
              id="instagramUrl"
              type="url"
              className="form-input-box"
              placeholder="https://instagram.com/username"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
            {errors.instagramUrl && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.instagramUrl}</span>}
          </div>
        </div>

        <div className="form-grid-two">
          <div className="form-num-section">
            <label htmlFor="githubUrl" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              GitHub URL
            </label>
            <input
              id="githubUrl"
              type="url"
              className="form-input-box"
              placeholder="https://github.com/username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            {errors.githubUrl && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.githubUrl}</span>}
          </div>

          <div className="form-num-section">
            <label htmlFor="portfolioUrl" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              Portfolio URL
            </label>
            <input
              id="portfolioUrl"
              type="url"
              className="form-input-box"
              placeholder="https://portfolio.design"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
            {errors.portfolioUrl && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors.portfolioUrl}</span>}
          </div>
        </div>

        {/* Dynamic Additional Professional Links */}
        {extraLinks.length > 0 && (
          <div className="extra-links-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Additional Professional Links</span>
            {extraLinks.map((link, idx) => (
              <div key={idx} className="form-grid-two" style={{ alignItems: 'center' }}>
                <select
                  className="form-select-box"
                  value={link.type}
                  onChange={(e) => handleExtraLinkChange(idx, 'type', e.target.value)}
                >
                  {linkTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <input
                    type="url"
                    className="form-input-box"
                    placeholder="https://example.com"
                    value={link.url}
                    onChange={(e) => handleExtraLinkChange(idx, 'url', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-editorial-ghost"
                    onClick={() => handleRemoveExtraLink(idx)}
                    aria-label="Remove link"
                    style={{ padding: '0.5rem', color: 'var(--color-danger)' }}
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
                {errors[`extraLink_${idx}`] && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{errors[`extraLink_${idx}`]}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            className="btn-editorial-secondary"
            onClick={handleAddExtraLink}
          >
            <Icon name="plus" size={14} />
            <span>+ Add another professional link</span>
          </button>
        </div>
      </section>

      {/* Form Submission Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="button" onClick={() => navigate(-1)} className="btn-editorial-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-editorial-primary">
          <Icon name="check" size={16} />
          <span>{isEditing ? 'Save Changes' : 'Add Person'}</span>
        </button>
      </div>
    </form>
  );
}
