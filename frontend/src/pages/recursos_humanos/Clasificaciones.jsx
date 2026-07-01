import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';
import axios from 'axios';

const Clasificaciones = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ Descripcion: '', Grado: '', Estatus: 1 });
  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/configuracion/clasificaciones?empresaId=1');
      setData(res.data || []);
    } catch (err) {
      setData([]);
      Swal.fire('Error', 'Error al cargar clasificaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessor: 'ClasificacionID', header: 'ID' },
    { accessor: 'Descripcion', header: 'Descripción' },
    { accessor: 'Grado', header: 'Grado' },
    { 
      accessor: 'Estatus', 
      header: 'Estado',
      render: (row) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px', 
          fontWeight: '500',
          background: row.Estatus === 1 ? '#dcfce7' : '#fee2e2',
          color: row.Estatus === 1 ? '#166534' : '#991b1b'
        }}>
          {row.Estatus === 1 ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  const handleOpenForm = (row = null) => {
    if (row) {
      setEditId(row.ClasificacionID);
      setFormData({ Descripcion: row.Descripcion, Grado: row.Grado || '', Estatus: row.Estatus });
      setAuditData({
        CreadoPor: row.CreadoPor,
        FechaCreado: row.FechaCreado,
        ModificadoPor: row.ModificadoPor,
        FechaModificado: row.FechaModificado
      });
    } else {
      setEditId(null);
      setFormData({ Descripcion: '', Grado: '', Estatus: 1 });
      setAuditData(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ Descripcion: '', Grado: '', Estatus: 1 });
    setAuditData(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Descripcion) {
      Swal.fire('Atención', 'Por favor ingrese la descripción', 'warning');
      return;
    }
    if (!formData.Grado) {
      Swal.fire('Atención', 'Por favor seleccione un grado', 'warning');
      return;
    }

    try {
      const url = editId 
        ? `/api/configuracion/clasificaciones/${editId}?empresaId=1` 
        : `/api/configuracion/clasificaciones?empresaId=1`;
      const method = editId ? 'put' : 'post';

      await axios[method](url, formData);

      Swal.fire('Éxito', editId ? 'Clasificacion actualizado' : 'Clasificacion creado exitosamente', 'success');
      fetchData();
      handleCloseForm();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "Se eliminará permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      await axios.delete(`/api/configuracion/clasificaciones/${id}?empresaId=1`);
      Swal.fire('Eliminado', 'Clasificacion eliminado', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error al eliminar', 'error');
    }
  };

  return (
    <>
      <DataTable 
        title="Clasificaciones" 
        columns={columns} 
        data={data} 
        loading={loading}
        addButtonLabel="Nuevo Clasificacion"
        onAdd={() => handleOpenForm()} 
        onEdit={handleOpenForm}
        renderActions={(row) => (
          <button 
            className="btn-action-pill" 
            onClick={() => handleDelete(row.ClasificacionID)}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Eliminar
          </button>
        )}
      />

      <Modal 
        title={editId ? "Editar Clasificación" : "Nuevo Clasificación"} 
        isOpen={isModalOpen} 
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        auditData={auditData}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
              Descripción *
            </label>
            <input 
              type="text" 
              name="Descripcion" 
              value={formData.Descripcion} 
              onChange={handleChange}
              placeholder="Ej: RENUNCIA"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
              Grado
            </label>
            <select 
              name="Grado" 
              value={formData.Grado} 
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="">Seleccionar Grado</option>
              <option value="Primer Grado">Primer Grado</option>
              <option value="Segundo Grado">Segundo Grado</option>
              <option value="Tercer Grado">Tercer Grado</option>
              <option value="Cuarto Grado">Cuarto Grado</option>
              <option value="Quinto Grado">Quinto Grado</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              id="Estatus"
              name="Estatus" 
              checked={formData.Estatus === 1} 
              onChange={handleChange}
              style={{ marginRight: '8px', width: '16px', height: '16px' }}
            />
            <label htmlFor="Estatus" style={{ fontWeight: '500', color: '#475569', cursor: 'pointer' }}>
              Activo
            </label>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Clasificaciones;
