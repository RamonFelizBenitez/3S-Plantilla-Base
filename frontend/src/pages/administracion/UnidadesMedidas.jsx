import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const UnidadesMedidas = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const [formData, setFormData] = useState({
    UnidadId: '',
    Descripcion: '',
    Decimales: 0
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/unidades-medida');
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
    setFormData({ UnidadId: '', Descripcion: '', Decimales: 0 });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (record) => {
    if (!(await showConfirm(`¿Seguro que desea eliminar la unidad de medida ${record.UnidadId}?`))) return;
    try {
      const res = await fetch(`/api/unidades-medida/${record.UnidadId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.UnidadId || !formData.Descripcion) {
      showToast("Todos los campos son obligatorios.");
      return;
    }
    try {
      const url = currentRecord ? `/api/unidades-medida/${currentRecord.UnidadId}` : '/api/unidades-medida';
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
    { header: 'ID UNIDAD', accessor: 'UnidadId' },
    { header: 'DESCRIPCIÓN', accessor: 'Descripcion' },
    { header: 'DECIMALES', accessor: 'Decimales' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Unidades de Medida"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
        size="sm"
        maxHeight="50vh"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>ID Unidad de Medida</label>
            <input 
              type="text" 
              name="UnidadId" 
              value={formData.UnidadId} 
              onChange={handleChange} 
              style={inputStyle} 
              disabled={!!currentRecord}
              maxLength={10}
            />
          </div>
          <div>
            <label style={labelStyle}>Descripción</label>
            <input 
              type="text" 
              name="Descripcion" 
              value={formData.Descripcion} 
              onChange={handleChange} 
              style={inputStyle} 
              maxLength={30}
            />
          </div>
          <div>
            <label style={labelStyle}>Cantidad de Decimales</label>
            <input 
              type="number" 
              name="Decimales" 
              value={formData.Decimales} 
              onChange={handleChange} 
              style={inputStyle} 
              min={0}
              max={10}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, color: '#475569', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' };

export default UnidadesMedidas;
