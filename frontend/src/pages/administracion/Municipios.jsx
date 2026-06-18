import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Municipios = () => {
  const [data, setData] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({ Nombre: '', CiudadID: '' });

  const fetchMunicipios = () => {
    fetch('/api/geografia/municipios')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMunicipios();
      
    fetch('/api/geografia/ciudades')
      .then(res => res.json())
      .then(json => setCiudades(json.data || []))
      .catch(() => setCiudades([{ CiudadID: 1, Nombre: 'Distrito Nacional' }]));
  }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({ Nombre: record.Nombre, CiudadID: record.CiudadID });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({ Nombre: '', CiudadID: '' });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.Nombre || !formData.CiudadID) {
        showToast("Todos los campos son obligatorios");
        return;
    }

    try {
      const method = currentRecord ? 'PUT' : 'POST';
      const url = currentRecord ? `/api/geografia/municipios/${currentRecord.MunicipioID}` : '/api/geografia/municipios';
      
      const payload = {
        ...formData,
        CiudadID: parseInt(formData.CiudadID)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchMunicipios();
      } else {
        showToast("Error al guardar");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión");
    }
  };

  const columns = [
    { header: 'ID', accessor: 'MunicipioID' },
    { header: 'MUNICIPIO', accessor: 'Nombre' },
    { header: 'CIUDAD / PROVINCIA', accessor: 'NombreCiudad' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Municipios"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Municipio' : 'Nuevo Municipio'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Ciudad / Provincia</label>
            <select name="CiudadID" value={formData.CiudadID} onChange={handleChange} style={inputStyle}>
              <option value="">-- Seleccionar --</option>
              {ciudades.map(c => <option key={c.CiudadID} value={c.CiudadID}>{c.Nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Nombre de Municipio</label>
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
export default Municipios;
