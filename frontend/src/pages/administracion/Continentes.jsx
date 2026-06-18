import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Continentes = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({ Nombre: '' });

  const fetchContinentes = () => {
    fetch('/api/geografia/continentes')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchContinentes();
  }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({ Nombre: record.Nombre });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({ Nombre: '' });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, Nombre: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const method = currentRecord ? 'PUT' : 'POST';
      const url = currentRecord ? `/api/geografia/continentes/${currentRecord.ContinenteID}` : '/api/geografia/continentes';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchContinentes();
      } else {
        showToast("Error al guardar");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión");
    }
  };

  const columns = [
    { header: 'ID', accessor: 'ContinenteID' },
    { header: 'NOMBRE', accessor: 'Nombre' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Continentes"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Continente' : 'Nuevo Continente'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
      >
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Nombre del Continente</label>
          <input 
            type="text" 
            value={formData.Nombre} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
          />
        </div>
      </Modal>
    </div>
  );
};

export default Continentes;
