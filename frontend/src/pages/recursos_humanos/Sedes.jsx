import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const Sedes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ Descripcion: '' });
  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/configuracion/cedes');
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      } else {
        throw new Error(json.message || 'Error del servidor');
      }
    } catch (err) {
      setData([]);
      Swal.fire('Error', 'Error al cargar sedes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessor: 'Descripcion', header: 'Descripción de la Sede' }
  ];

  const handleOpenForm = (row = null) => {
    if (row) {
      setEditId(row.CedeID);
      setFormData({ Descripcion: row.Descripcion });
      setAuditData({
        CreadoPor: row.CreadoPor,
        FechaCreado: row.FechaCreado,
        ModificadoPor: row.ModificadoPor,
        FechaModificado: row.FechaModificado
      });
    } else {
      setEditId(null);
      setFormData({ Descripcion: '' });
      setAuditData(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ Descripcion: '' });
    setAuditData(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Descripcion) {
      Swal.fire('Atención', 'Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    try {
      const url = editId 
        ? `/api/configuracion/cedes/${editId}` 
        : '/api/configuracion/cedes';
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

      Swal.fire('Éxito', editId ? 'Sede actualizada' : 'Sede creada exitosamente', 'success');
      fetchData();
      handleCloseForm();
    } catch (err) {
      Swal.fire('Error', 'Error al guardar sede', 'error');
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
      const response = await fetch(`/api/configuracion/cedes/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      Swal.fire('Eliminado', 'Sede eliminada', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Error al eliminar', 'error');
    }
  };

  return (
    <>
      <DataTable 
        title="Sedes (Sucursales)" 
        columns={columns} 
        data={data} 
        loading={loading}
        onAdd={() => handleOpenForm()} 
        onEdit={handleOpenForm}
        renderActions={(row) => (
          <button 
            className="btn-action-pill" 
            onClick={() => handleDelete(row.CedeID)}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Eliminar
          </button>
        )}
      />

      <Modal 
        title={editId ? "Editar Sede" : "Nueva Sede"} 
        isOpen={isModalOpen} 
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        auditData={auditData}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
              Descripción de la Sede *
            </label>
            <input 
              type="text" 
              name="Descripcion" 
              value={formData.Descripcion} 
              onChange={handleChange}
              placeholder="Ej: OFICINA PRINCIPAL"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Sedes;
