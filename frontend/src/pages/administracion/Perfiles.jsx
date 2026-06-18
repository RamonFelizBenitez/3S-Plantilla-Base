import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const mockPerfiles = [
  { PerfilID: 1, Descripcion: 'Administrador Global', Empresa: 'Global' },
  { PerfilID: 2, Descripcion: 'Especialista RRHH', Empresa: 'Empresa Principal' },
  { PerfilID: 3, Descripcion: 'Operador', Empresa: 'Sucursal Norte' }
];

const Perfiles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [formData, setFormData] = useState({ Descripcion: '', EmpresaID: '' });
  const [empresasList, setEmpresasList] = useState([]);

  const fetchEmpresas = async () => {
    try {
      const res = await fetch('/api/empresas');
      if (res.ok) {
        const json = await res.json();
        setEmpresasList(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPerfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/perfiles');
      if (response.ok) {
        const json = await response.json();
        setData(json.data || []);
      } else {
        setData(mockPerfiles);
      }
    } catch (err) {
      setData(mockPerfiles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfiles();
    fetchEmpresas();
  }, []);

  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ ...record });
    } else {
      setEditingRecord(null);
      setFormData({ Descripcion: '', EmpresaID: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const method = editingRecord ? 'PUT' : 'POST';
      const url = editingRecord ? `/api/perfiles/${editingRecord.PerfilID}` : '/api/perfiles';
      
      const payload = {
          ...formData,
          EmpresaID: formData.EmpresaID ? parseInt(formData.EmpresaID) : null
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchPerfiles();
      } else {
        showToast('Error al guardar el perfil');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const columns = [
    { header: 'ID', accessor: 'PerfilID' },
    { header: 'DESCRIPCIÓN DEL PERFIL', accessor: 'Descripcion' },
    { header: 'EMPRESA', accessor: 'Empresa' }
  ];

  return (
    <>
      <DataTable 
        title="Perfiles de Usuarios (Roles)"
        columns={columns}
        data={data}
        onAdd={() => openModal()}
        onEdit={(row) => openModal(row)}
        loading={loading}
        addButtonLabel="Agregar Perfil"
      />

      <Modal 
        title={editingRecord ? 'Editar Perfil' : 'Nuevo Perfil'}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Descripción del Perfil *</label>
            <input type="text" name="Descripcion" value={formData.Descripcion} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Empresa Asociada</label>
            <select name="EmpresaID" value={formData.EmpresaID || ''} onChange={handleChange} style={inputStyle}>
              <option value="">Global (Todas las empresas)</option>
              {empresasList.map(emp => (
                <option key={emp.EmpresaID} value={emp.EmpresaID}>{emp.NombreEmpresa}</option>
              ))}
            </select>
            <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>Deje en "Global" si este rol aplica a todo el sistema.</small>
          </div>
        </div>
      </Modal>
    </>
  );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' };

export default Perfiles;
