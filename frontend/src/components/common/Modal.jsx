import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, isOpen, onClose, children, onSubmit, auditData, size = 'default', maxHeight = '70vh', hideFooter = false, headerActions = null, submitLabel = 'Guardar' }) => {
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('general');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: size === 'xl' ? '1200px' : size === 'lg' ? '1000px' : size === 'md' ? '800px' : '600px' }}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#0369a1', fontWeight: 'bold' }}>{title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {headerActions}
            <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
          </div>
        </div>
        
        {auditData && (
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 20px', background: '#f8fafc' }}>
            <button 
              onClick={() => setActiveTab('general')}
              style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'general' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'general' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'general' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              General
            </button>
            <button 
              onClick={() => setActiveTab('auditoria')}
              style={{ padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: activeTab === 'auditoria' ? '2px solid #2563eb' : '2px solid transparent', color: activeTab === 'auditoria' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'auditoria' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Auditoría
            </button>
          </div>
        )}

        <div style={{ padding: '20px', maxHeight: maxHeight, overflowY: 'auto' }}>
          {activeTab === 'general' && children}
          
          {activeTab === 'auditoria' && auditData && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#64748b' }}>Creado por</label>
                <input type="text" readOnly value={auditData.CreadoPor || 'Sistema'} style={auditInputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#64748b' }}>Fecha de creación</label>
                <input type="text" readOnly value={auditData.FechaCreado ? new Date(auditData.FechaCreado).toLocaleString() : ''} style={auditInputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#64748b' }}>Modificado por</label>
                <input type="text" readOnly value={auditData.ModificadoPor || ''} style={auditInputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#64748b' }}>Fecha de modificación</label>
                <input type="text" readOnly value={auditData.FechaModificado ? new Date(auditData.FechaModificado).toLocaleString() : ''} style={auditInputStyle} />
              </div>
            </div>
          )}
        </div>
        
        {activeTab === 'general' && !hideFooter && (
          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancelar</button>
            <button type="button" onClick={onSubmit} className="btn-primary" style={{ padding: '10px 16px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>{submitLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(2px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalStyle = {
  background: '#fff', borderRadius: '8px', width: '90%', maxWidth: '600px',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden'
};
const headerStyle = {
  padding: '16px 24px', borderBottom: '1px solid #93c5fd', display: 'flex',
  justifyContent: 'space-between', alignItems: 'center', background: '#bfdbfe'
};
const closeBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1' };
const cancelBtnStyle = { background: 'none', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' };
const auditInputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', outline: 'none' };

export default Modal;
