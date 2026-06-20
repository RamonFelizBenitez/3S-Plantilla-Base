import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const GruposOcupacionales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ Descripcion: '', Grupo: '' });
  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/configuracion/grupos-ocupacionales');
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      } else {
        throw new Error(json.message || 'Error del servidor');
      }
    } catch (err) {
      setData([]);
      Swal.fire('Error', 'Error al cargar grupos ocupacionales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessor: 'Descripcion', header: 'Descripción' },
    { accessor: 'Grupo', header: 'Grupo' }
  ];

  const handleOpenForm = (row = null) => {
    if (row) {
      setEditId(row.GrupoOcupacionalID);
      setFormData({ Descripcion: row.Descripcion, Grupo: row.Grupo });
      setAuditData({
        CreadoPor: row.CreadoPor,
        FechaCreado: row.FechaCreado,
        ModificadoPor: row.ModificadoPor,
        FechaModificado: row.FechaModificado
      });
    } else {
      setEditId(null);
      setFormData({ Descripcion: '', Grupo: '' });
      setAuditData(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ Descripcion: '', Grupo: '' });
    setAuditData(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Descripcion || !formData.Grupo) {
      Swal.fire('Atención', 'Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    try {
      const url = editId 
        ? `/api/configuracion/grupos-ocupacionales/${editId}` 
        : '/api/configuracion/grupos-ocupacionales';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EmpresaID: 1, // Empresa default por ahora
          ...formData
        })
      });

      if (!response.ok) throw new Error('Error al guardar');

      Swal.fire('Éxito', editId ? 'Grupo actualizado' : 'Grupo creado exitosamente', 'success');
      fetchData();
      handleCloseForm();
    } catch (err) {
      Swal.fire('Error', 'Error al guardar grupo ocupacional', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "No podrá revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const response = await fetch(`/api/configuracion/grupos-ocupacionales/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      Swal.fire('Eliminado', 'Grupo ocupacional eliminado', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Error al eliminar', 'error');
    }
  };

  return (
    <>
      <DataTable 
        title="Grupos Ocupacionales" 
        columns={columns} 
        data={data} 
        loading={loading}
        onAdd={() => handleOpenForm()} 
        onEdit={handleOpenForm}
        renderActions={(row) => (
          <button 
            className="btn-action-pill" 
            onClick={() => handleDelete(row.GrupoOcupacionalID)}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Eliminar
          </button>
        )}
      />

      <Modal 
        title={editId ? "Editar Grupo Ocupacional" : "Nuevo Grupo Ocupacional"} 
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
              placeholder="Ej: SERVICIOS GENERALES"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
              Grupo *
            </label>
            <input 
              type="text" 
              name="Grupo" 
              value={formData.Grupo} 
              onChange={handleChange}
              placeholder="Ej: I, II, III"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default GruposOcupacionales;
