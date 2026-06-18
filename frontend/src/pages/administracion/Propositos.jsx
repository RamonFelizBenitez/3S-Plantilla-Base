import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Propositos = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const [formData, setFormData] = useState({
    PropositoID: '',
    PropositoDescripcion: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/propositos');
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({ ...record });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({ PropositoID: '', PropositoDescripcion: '' });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (record) => {
    if (!(await showConfirm(`¿Seguro que desea eliminar el propósito ${record.PropositoID}?`))) return;
    try {
      const res = await fetch(`/api/propositos/${record.PropositoID}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.PropositoID || !formData.PropositoDescripcion) {
      showToast("Todos los campos son obligatorios.");
      return;
    }
    try {
      const url = currentRecord ? `/api/propositos/${currentRecord.PropositoID}` : '/api/propositos';
      const method = currentRecord ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      showToast(json.message);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const columns = [
    { header: 'ID PROPÓSITO', accessor: 'PropositoID' },
    { header: 'DESCRIPCIÓN', accessor: 'PropositoDescripcion' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Propósitos Contables"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Propósito' : 'Nuevo Propósito'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
        size="sm"
        maxHeight="50vh"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>ID Propósito</label>
            <input 
              type="text" 
              name="PropositoID" 
              value={formData.PropositoID} 
              onChange={handleChange} 
              style={inputStyle} 
              disabled={!!currentRecord}
              maxLength={20}
            />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <input 
              type="text" 
              name="PropositoDescripcion" 
              value={formData.PropositoDescripcion} 
              onChange={handleChange} 
              style={inputStyle} 
              maxLength={60}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, color: '#475569', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' };

export default Propositos;
