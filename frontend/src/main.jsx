import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Interceptor global de fetch para inyectar token y x-empresa-id
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (!config) {
    config = {};
  }
  if (!config.headers) {
    config.headers = {};
  }
  
  // No inyectar en las llamadas a login para evitar bloqueos
  if (typeof resource === 'string' && !resource.includes('/api/auth/login')) {
    const token = localStorage.getItem('token');
    const empresaId = localStorage.getItem('empresaId');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (empresaId) {
      config.headers['x-empresa-id'] = empresaId;
    }
  }
  
  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
