import React from 'react';
import { useNavigate } from 'react-router-dom';
import { switchToDemo } from '../utils/contactStorage';

export default function DemoEntry() {
  const navigate = useNavigate();

  React.useEffect(() => {
    switchToDemo();
    navigate('/insights', { replace: true });
  }, [navigate]);

  return (
    <div
      className="page-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '0.75rem'
      }}
    >
      <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
        PREPARING DEMO
      </h1>
      <p style={{ color: 'var(--color-secondary-text)' }}>Loading the sample network atlas…</p>
    </div>
  );
}
