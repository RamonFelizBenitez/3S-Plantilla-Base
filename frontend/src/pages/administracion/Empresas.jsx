import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const mockEmpresas = [
  { EmpresaID: 1, NombreEmpresa: 'Empresa Principal', Activa: true },
  { EmpresaID: 2, NombreEmpresa: 'Sucursal Norte', Activa: true },
  { EmpresaID: 3, NombreEmpresa: 'Distribuidora Este', Activa: false }
];

const Empresas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    NombreEmpresa: '', Activa: true
  });

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/empresas');
      if (response.ok) {
        const json = await response.json();
        setData(json.data || []);
        
        // Mantener sincronizado el selector global del Header
        localStorage.setItem('empresas', JSON.stringify(json.data || []));
        window.dispatchEvent(new Event('empresasUpdated'));
      } else {
        // Fallback al mock si la API no está lista
        console.warn("API de empresas no disponible, usando datos simulados.");
        setData(mockEmpresas);
      }
    } catch (err) {
      console.warn("Error conectando a la API, usando datos simulados.", err);
      setData(mockEmpresas);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ NombreEmpresa: record.NombreEmpresa, Activa: record.Activa });
    } else {
      setEditingRecord(null);
      setFormData({ NombreEmpresa: '', Activa: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingRecord ? `/api/empresas/${editingRecord.EmpresaID}` : '/api/empresas';
      const method = editingRecord ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Error al guardar la empresa');
      
      setIsModalOpen(false);
      fetchEmpresas();
    } catch (error) {
      showToast(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const columns = [
    { header: 'ID', accessor: 'EmpresaID' },
    { header: 'NOMBRE DE EMPRESA', accessor: 'NombreEmpresa' },
    { 
      header: 'ESTADO', 
      accessor: 'Activa',
      render: (row) => (
        <span className="status-badge">
          <span className={`status-dot ${row.Activa ? 'active' : 'inactive'}`}></span>
          {row.Activa ? 'Activo' : 'Suspendido'}
        </span>
      )
    }
  ];

  return (
    <>
      <DataTable 
        title="Gestión de Empresas"
        columns={columns}
        data={data}
        onAdd={() => openModal()}
        onEdit={(row) => openModal(row)}
        loading={loading}
        addButtonLabel="Agregar Empresa"
      />

      <Modal 
        title={editingRecord ? 'Editar Empresa' : 'Nueva Empresa'}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nombre de la Empresa *</label>
            <input type="text" name="NombreEmpresa" value={formData.NombreEmpresa} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
              <input type="checkbox" name="Activa" checked={formData.Activa} onChange={handleChange} />
              Empresa Activa en el Sistema
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Empresas;
