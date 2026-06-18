import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const mockUsuarios = [
  { UsuarioID: 1, NombreUsuario: 'admin', NombreCompleto: 'Administrador Global', Correo: 'admin@rhdbw.com', Empresa: 'Global', Perfiles: 'Administrador Global', Activo: true },
  { UsuarioID: 2, NombreUsuario: 'rrhh1', NombreCompleto: 'Usuario RRHH', Correo: 'rrhh@empresa.com', Empresa: 'Empresa Principal', Perfiles: 'Especialista RRHH', Activo: true },
  { UsuarioID: 3, NombreUsuario: 'operador', NombreCompleto: 'Operador de Nómina', Correo: 'nomina@empresa.com', Empresa: 'Sucursal Norte', Perfiles: 'Operador', Activo: false }
];

const Usuarios = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  const [formData, setFormData] = useState({
    NombreUsuario: '', NombreCompleto: '', Correo: '', Password: '', Empresas: [], EsGlobal: false, Activo: true
  });
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

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const json = await response.json();
        setData(json.data || []);
      } else {
        setData(mockUsuarios);
      }
    } catch (err) {
      setData(mockUsuarios);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchEmpresas();
  }, []);

  const openModal = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setFormData({ ...record, Password: '', Empresas: record.Empresas || [] });
    } else {
      setEditingRecord(null);
      setFormData({ NombreUsuario: '', NombreCompleto: '', Correo: '', Password: '', Empresas: [], EsGlobal: false, Activo: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const method = editingRecord ? 'PUT' : 'POST';
      const url = editingRecord ? `/api/usuarios/${editingRecord.UsuarioID}` : '/api/usuarios';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchUsuarios();
      } else {
        showToast('Error al guardar el usuario');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión');
    }
  };

  const handleEmpresaToggle = (empresaId) => {
    setFormData(prev => {
      const isSelected = prev.Empresas.includes(empresaId);
      if (isSelected) {
        return { ...prev, Empresas: prev.Empresas.filter(id => id !== empresaId) };
      } else {
        return { ...prev, Empresas: [...prev.Empresas, empresaId] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const columns = [
    { header: 'USUARIO', accessor: 'NombreUsuario' },
    { header: 'NOMBRE', accessor: 'NombreCompleto' },
    { header: 'ROLES', accessor: 'Perfiles' },
    { header: 'EMPRESA', accessor: 'Empresa' },
    { 
      header: 'ESTADO', 
      accessor: 'Activo',
      render: (row) => (
        <span className="status-badge">
          <span className={`status-dot ${row.Activo ? 'active' : 'inactive'}`}></span>
          {row.Activo ? 'Activo' : 'Suspendido'}
        </span>
      )
    }
  ];

  return (
    <>
      <DataTable 
        title="Usuarios y Roles"
        columns={columns}
        data={data}
        onAdd={() => openModal()}
        onEdit={(row) => openModal(row)}
        loading={loading}
        addButtonLabel="Agregar Usuario"
      />

      <Modal 
        title={editingRecord ? 'Editar Usuario' : 'Nuevo Usuario'}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nombre de Usuario *</label>
            <input type="text" name="NombreUsuario" value={formData.NombreUsuario} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nombre Completo *</label>
            <input type="text" name="NombreCompleto" value={formData.NombreCompleto} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Correo Electrónico *</label>
            <input type="email" name="Correo" value={formData.Correo} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Contraseña (Dejar en blanco para no cambiar)</label>
            <input type="password" name="Password" value={formData.Password || ''} onChange={handleChange} placeholder="******" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Empresas Asignadas *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
              {empresasList.map(emp => (
                <label key={emp.EmpresaID} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.Empresas?.includes(emp.EmpresaID) || false}
                    onChange={() => handleEmpresaToggle(emp.EmpresaID)}
                  />
                  {emp.NombreEmpresa}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, cursor: 'pointer' }}>
              <input type="checkbox" name="Activo" checked={formData.Activo} onChange={handleChange} />
              Usuario Activo
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' };

export default Usuarios;
