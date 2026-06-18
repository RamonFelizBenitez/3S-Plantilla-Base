import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const CentroCostos = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const [formData, setFormData] = useState({
    CentroCostoID: '',
    CCostosDescripcion: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/centro-costos');
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
    setFormData({ CentroCostoID: '', CCostosDescripcion: '' });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (record) => {
    if (!(await showConfirm(`¿Seguro que desea eliminar el centro de costo ${record.CentroCostoID}?`))) return;
    try {
      const res = await fetch(`/api/centro-costos/${record.CentroCostoID}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.CentroCostoID || !formData.CCostosDescripcion) {
      showToast("Todos los campos son obligatorios.");
      return;
    }
    try {
      const url = currentRecord ? `/api/centro-costos/${currentRecord.CentroCostoID}` : '/api/centro-costos';
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
    { header: 'ID CENTRO COSTO', accessor: 'CentroCostoID' },
    { header: 'DESCRIPCIÓN', accessor: 'CCostosDescripcion' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Centros de Costo Contables"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
        size="sm"
        maxHeight="50vh"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>ID Centro Costo</label>
            <input 
              type="text" 
              name="CentroCostoID" 
              value={formData.CentroCostoID} 
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
              name="CCostosDescripcion" 
              value={formData.CCostosDescripcion} 
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

export default CentroCostos;
