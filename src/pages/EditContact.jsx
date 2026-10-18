import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import Icon from '../components/Icon';
import { getContactById, updateContact } from '../utils/contactStorage';

export default function EditContact() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loaded = getContactById(id);
    if (loaded) {
      setContact(loaded);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  }, [id]);

  const handleFormSubmit = (formData) => {
    updateContact(id, formData);
    navigate(`/contact/${id}`);
  };

  if (notFound) {
    return (
      <div className="form-page-container">
        <div className="editorial-empty-state">
          <Icon name="warning" size={36} className="empty-icon" />
          <h2>Person Record Not Found</h2>
          <p>The record you are trying to edit does not exist.</p>
          <Link to="/people" className="btn-editorial-primary">
            <Icon name="arrow-left" size={15} />
            <span>Return to People Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!contact) return null;

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <Link to={`/contact/${id}`} className="back-link">
          <Icon name="arrow-left" size={15} />
          <span>Back to Person Record</span>
        </Link>
        <h1 className="editorial-page-title">EDIT PERSON</h1>
        <p className="page-subtitle">
          Updating record for <strong>{contact.name}</strong>
        </p>
      </div>

      <main className="form-content-body">
        <ContactForm initialData={contact} onSubmit={handleFormSubmit} isEditing={true} />
      </main>
    </div>
  );
}
