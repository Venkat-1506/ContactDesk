import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import Icon from '../components/Icon';
import { addContact } from '../utils/contactStorage';

export default function AddContact() {
  const navigate = useNavigate();

  const handleFormSubmit = (formData) => {
    const newPerson = addContact(formData);
    navigate(`/contact/${newPerson.id}`);
  };

  return (
    <div className="form-page-container">
      <div className="form-page-header">
        <Link to="/people" className="back-link">
          <Icon name="arrow-left" size={15} />
          <span>Back to People</span>
        </Link>
        <h1 className="editorial-page-title">ADD SOMEONE</h1>
        <p className="page-subtitle">Add a new person to your personal network map.</p>
      </div>

      <main className="form-content-body">
        <ContactForm onSubmit={handleFormSubmit} />
      </main>
    </div>
  );
}
