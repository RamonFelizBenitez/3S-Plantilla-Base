import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Paises = () => {
  const [data, setData] = useState([]);
  const [continentes, setContinentes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({ Nombre: '', ContinenteID: '' });

  const fetchPaises = () => {
    fetch('/api/geografia/paises')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPaises();
      
    fetch('/api/geografia/continentes')
      .then(res => res.json())
      .then(json => setContinentes(json.data || []))
      .catch(() => setContinentes([{ ContinenteID: 1, Nombre: 'América' }]));
  }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({ Nombre: record.Nombre, ContinenteID: record.ContinenteID });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({ Nombre: '', ContinenteID: '' });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.Nombre || !formData.ContinenteID) {
        showToast("Todos los campos son obligatorios");
        return;
    }

    try {
      const method = currentRecord ? 'PUT' : 'POST';
      const url = currentRecord ? `/api/geografia/paises/${currentRecord.PaisID}` : '/api/geografia/paises';
      
      const payload = {
        ...formData,
        ContinenteID: parseInt(formData.ContinenteID)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchPaises();
      } else {
        showToast("Error al guardar");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión");
    }
  };

  const columns = [
    { header: 'ID', accessor: 'PaisID' },
    { header: 'PAÍS', accessor: 'Nombre' },
    { header: 'CONTINENTE', accessor: 'NombreContinente' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Países"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar País' : 'Nuevo País'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Continente</label>
            <select name="ContinenteID" value={formData.ContinenteID} onChange={handleChange} style={inputStyle}>
              <option value="">-- Seleccionar --</option>
              {continentes.map(c => <option key={c.ContinenteID} value={c.ContinenteID}>{c.Nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Nombre del País</label>
            <input 
              type="text" 
              name="Nombre"
              value={formData.Nombre} 
              onChange={handleChange}
              style={inputStyle} 
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' };
export default Paises;
