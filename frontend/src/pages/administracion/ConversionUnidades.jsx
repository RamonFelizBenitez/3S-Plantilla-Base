import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const ConversionUnidades = () => {
  const [data, setData] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const [formData, setFormData] = useState({
    UnidadIdDesde: '',
    UnidadIdHasta: '',
    Factor: 0,
    CantidadSumar: 0
  });

  const fetchData = async () => {
    try {
      const [convRes, uniRes] = await Promise.all([
        fetch('/api/conversion-unidades').then(r => r.json()),
        fetch('/api/unidades-medida').then(r => r.json())
      ]);
      setData(convRes.data || []);
      setUnidades(uniRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({ 
        ...record,
        Factor: parseFloat(record.Factor) || 0,
        CantidadSumar: parseFloat(record.CantidadSumar) || 0
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({ UnidadIdDesde: '', UnidadIdHasta: '', Factor: 0, CantidadSumar: 0 });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (record) => {
    if (!(await showConfirm(`¿Seguro que desea eliminar la conversión de ${record.UnidadIdDesde} a ${record.UnidadIdHasta}?`))) return;
    try {
      const res = await fetch(`/api/conversion-unidades/${record.UnidadIdDesde}/${record.UnidadIdHasta}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.UnidadIdDesde || !formData.UnidadIdHasta) {
      showToast("Debe seleccionar la unidad de origen y de destino.");
      return;
    }
    if (formData.UnidadIdDesde === formData.UnidadIdHasta) {
      showToast("La unidad de origen y destino no pueden ser la misma.");
      return;
    }
    try {
      const url = currentRecord 
        ? `/api/conversion-unidades/${currentRecord.UnidadIdDesde}/${currentRecord.UnidadIdHasta}` 
        : '/api/conversion-unidades';
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
    { header: 'DESDE', accessor: 'UnidadIdDesde' },
    { header: 'HASTA', accessor: 'UnidadIdHasta' },
    { header: 'FACTOR MULTIPLICAR', accessor: 'Factor' },
    { header: 'CANTIDAD SUMAR', accessor: 'CantidadSumar' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Conversión de Unidades de Medida"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Conversión' : 'Nueva Conversión'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={labelStyle}>Convertir Desde (Unidad)</label>
              <select 
                name="UnidadIdDesde" 
                value={formData.UnidadIdDesde} 
                onChange={handleChange} 
                style={inputStyle}
                disabled={!!currentRecord}
              >
                <option value="">-- Seleccionar Unidad --</option>
                {unidades.map(u => <option key={u.UnidadId} value={u.UnidadId}>{u.UnidadId} - {u.Descripcion}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Convertir Hasta (Unidad)</label>
              <select 
                name="UnidadIdHasta" 
                value={formData.UnidadIdHasta} 
                onChange={handleChange} 
                style={inputStyle}
                disabled={!!currentRecord}
              >
                <option value="">-- Seleccionar Unidad --</option>
                {unidades.map(u => <option key={u.UnidadId} value={u.UnidadId}>{u.UnidadId} - {u.Descripcion}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Factor (Multiplicador)</label>
              <input 
                type="number" 
                name="Factor" 
                value={formData.Factor} 
                onChange={handleChange} 
                style={inputStyle} 
                step="0.000001"
              />
            </div>
            <div>
              <label style={labelStyle}>Cantidad a Sumar</label>
              <input 
                type="number" 
                name="CantidadSumar" 
                value={formData.CantidadSumar} 
                onChange={handleChange} 
                style={inputStyle} 
                step="0.000001"
              />
            </div>
          </div>

        </div>
      </Modal>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, color: '#475569', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' };

export default ConversionUnidades;
