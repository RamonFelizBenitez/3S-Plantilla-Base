import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Ciudades = () => {
  const [data, setData] = useState([]);
  const [paises, setPaises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({ Nombre: '', PaisID: '' });

  const fetchCiudades = () => {
    fetch('/api/geografia/ciudades')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCiudades();
      
    fetch('/api/geografia/paises')
      .then(res => res.json())
      .then(json => setPaises(json.data || []))
      .catch(() => setPaises([{ PaisID: 1, Nombre: 'República Dominicana' }]));
  }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({ Nombre: record.Nombre, PaisID: record.PaisID });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({ Nombre: '', PaisID: '' });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.Nombre || !formData.PaisID) {
        showToast("Todos los campos son obligatorios");
        return;
    }

    try {
      const method = currentRecord ? 'PUT' : 'POST';
      const url = currentRecord ? `/api/geografia/ciudades/${currentRecord.CiudadID}` : '/api/geografia/ciudades';
      
      const payload = {
        ...formData,
        PaisID: parseInt(formData.PaisID)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchCiudades();
      } else {
        showToast("Error al guardar");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión");
    }
  };

  const columns = [
    { header: 'ID', accessor: 'CiudadID' },
    { header: 'CIUDAD / PROVINCIA', accessor: 'Nombre' },
    { header: 'PAÍS', accessor: 'NombrePais' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Ciudades y Provincias"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Ciudad' : 'Nueva Ciudad'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>País</label>
            <select name="PaisID" value={formData.PaisID} onChange={handleChange} style={inputStyle}>
              <option value="">-- Seleccionar --</option>
              {paises.map(p => <option key={p.PaisID} value={p.PaisID}>{p.Nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Nombre de Ciudad/Provincia</label>
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
export default Ciudades;
