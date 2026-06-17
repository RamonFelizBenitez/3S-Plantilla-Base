import React from 'react';
import { Settings } from 'lucide-react';

const Placeholder = ({ title }) => {
  return (
    <div className="placeholder-page">
      <div className="card">
        <Settings size={64} color="var(--primary-color)" style={{ marginBottom: '1.5rem', animation: 'spin 10s linear infinite' }} />
        <h1>{title}</h1>
        <p style={{ fontSize: '1.1rem', marginTop: '1rem', lineHeight: '1.6' }}>
          Funcionalidad pendiente de implementación.
        </p>
        <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
          Esta sección será desarrollada en las próximas fases del proyecto RHDBW.
        </p>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default Placeholder;
