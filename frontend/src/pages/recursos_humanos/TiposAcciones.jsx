import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const TIPOS_DISPONIBLES = [
  'Designacion',
  'Cambios',
  'Separacion',
  'Amonestacion',
  'Vacaciones',
  'Ausencias'
];

const TiposAcciones = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ Descripcion: '', Tipo: '' });
  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/configuracion/tipos-acciones');
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      } else {
        throw new Error(json.message || 'Error del servidor');
      }
    } catch (err) {
      setData([]);
      Swal.fire('Error', 'Error al cargar tipos de acciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessor: 'TipoAccionID', header: 'ID (Auto)' },
    { accessor: 'Tipo', header: 'Tipo (Categoría)' },
    { accessor: 'Descripcion', header: 'Descripción' }
  ];

  const handleOpenForm = (row = null) => {
    if (row) {
      setEditId(row.TipoAccionID);
      setFormData({ Descripcion: row.Descripcion, Tipo: row.Tipo });
      setAuditData({
        CreadoPor: row.CreadoPor,
        FechaCreado: row.FechaCreado,
        ModificadoPor: row.ModificadoPor,
        FechaModificado: row.FechaModificado
      });
    } else {
      setEditId(null);
      setFormData({ Descripcion: '', Tipo: '' });
      setAuditData(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ Descripcion: '', Tipo: '' });
    setAuditData(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Descripcion || !formData.Tipo) {
      Swal.fire('Atención', 'Por favor complete todos los campos', 'warning');
      return;
    }

    try {
      const url = editId 
        ? `/api/configuracion/tipos-acciones/${editId}` 
        : '/api/configuracion/tipos-acciones';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EmpresaID: 1,
          ...formData
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Error al guardar');
      }

      Swal.fire('Éxito', editId ? 'Acción actualizada' : 'Acción creada exitosamente', 'success');
      fetchData();
      handleCloseForm();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
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
      const response = await fetch(`/api/configuracion/tipos-acciones/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      Swal.fire('Eliminado', 'Acción eliminada', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Error al eliminar', 'error');
    }
  };

  return (
    <>
      <DataTable 
        title="Tipos de Acciones de RRHH" 
        columns={columns} 
        data={data} 
        loading={loading}
        onAdd={() => handleOpenForm()} 
        onEdit={handleOpenForm}
        renderActions={(row) => (
          <button 
            className="btn-action-pill" 
            onClick={() => handleDelete(row.TipoAccionID)}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Eliminar
          </button>
        )}
      />

      <Modal 
        title={editId ? "Editar Acción" : "Nueva Acción"} 
        isOpen={isModalOpen} 
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        auditData={auditData}
      >
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
              Categoría (Tipo) *
            </label>
            <select 
              name="Tipo" 
              value={formData.Tipo} 
              onChange={handleChange}
              disabled={!!editId} // No permitir cambiar tipo si estamos editando
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: editId ? '#f1f5f9' : '#fff' }}
            >
              <option value="">Seleccione un Tipo...</option>
              {TIPOS_DISPONIBLES.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {editId && <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>El tipo no se puede cambiar porque determina el ID.</small>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
              Descripción *
            </label>
            <input 
              type="text" 
              name="Descripcion" 
              value={formData.Descripcion} 
              onChange={handleChange}
              placeholder="Ej: AUMENTO DE SUELDO"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

        </form>
      </Modal>
    </>
  );
};

export default TiposAcciones;
