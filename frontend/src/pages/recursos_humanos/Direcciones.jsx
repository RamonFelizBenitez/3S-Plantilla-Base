import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';
import DependenciasModal from './DependenciasModal';

const Direcciones = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null); // 'editId' contains the DireccionID if we are editing
  const [formData, setFormData] = useState({ DireccionID: '', Descripcion: '' });
  const [auditData, setAuditData] = useState(null);
  
  // Dependencias Modal states
  const [isDepModalOpen, setIsDepModalOpen] = useState(false);
  const [selectedDirId, setSelectedDirId] = useState(null);
  const [selectedDirDesc, setSelectedDirDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/configuracion/direcciones');
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json);
      } else {
        throw new Error(json.message || 'Error del servidor');
      }
    } catch (err) {
      setData([]);
      Swal.fire('Error', 'Error al cargar direcciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessor: 'DireccionID', header: 'Código (ID)' },
    { accessor: 'Descripcion', header: 'Descripción' }
  ];

  const handleOpenForm = (row = null) => {
    if (row) {
      setEditId(row.DireccionID);
      setFormData({ DireccionID: row.DireccionID, Descripcion: row.Descripcion });
      setAuditData({
        CreadoPor: row.CreadoPor,
        FechaCreado: row.FechaCreado,
        ModificadoPor: row.ModificadoPor,
        FechaModificado: row.FechaModificado
      });
    } else {
      setEditId(null);
      setFormData({ DireccionID: '', Descripcion: '' });
      setAuditData(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ DireccionID: '', Descripcion: '' });
    setAuditData(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.DireccionID || !formData.Descripcion) {
      Swal.fire('Atención', 'Por favor complete todos los campos', 'warning');
      return;
    }

    try {
      const url = editId 
        ? `/api/configuracion/direcciones/${editId}` 
        : '/api/configuracion/direcciones';
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

      Swal.fire('Éxito', editId ? 'Dirección actualizada' : 'Dirección creada exitosamente', 'success');
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
      const response = await fetch(`/api/configuracion/direcciones/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      Swal.fire('Eliminado', 'Dirección eliminada', 'success');
      fetchData();
    } catch (err) {
      Swal.fire('Error', 'Error al eliminar', 'error');
    }
  };

  return (
    <>
      <DataTable 
        title="Direcciones de la Empresa" 
        columns={columns} 
        data={data} 
        loading={loading}
        onAdd={() => handleOpenForm()} 
        onEdit={handleOpenForm}
        renderActions={(row) => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-action-pill" 
              onClick={() => handleDelete(row.DireccionID)}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Eliminar
            </button>
            <button 
              className="btn-action-pill" 
              onClick={() => {
                setSelectedDirId(row.DireccionID);
                setSelectedDirDesc(row.Descripcion);
                setIsDepModalOpen(true);
              }}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Dependencias
            </button>
          </div>
        )}
      />

      <Modal 
        title={editId ? "Editar Dirección" : "Nueva Dirección"} 
        isOpen={isModalOpen} 
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        auditData={auditData}
      >
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#475569' }}>
              Código (ID) *
            </label>
            <input 
              type="text" 
              name="DireccionID" 
              value={formData.DireccionID} 
              onChange={handleChange}
              placeholder="Ej: DIR-01, FINANZAS, etc."
              maxLength={20}
              required
              readOnly={!!editId} // Si es edición, el ID no se puede cambiar
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: editId ? '#f1f5f9' : '#fff' }}
            />
            {editId && <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>El código de dirección no se puede modificar.</small>}
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
              placeholder="Ej: Dirección de Finanzas"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

        </form>
      </Modal>

      {/* Dependencias Modal */}
      <DependenciasModal 
        isOpen={isDepModalOpen}
        onClose={() => setIsDepModalOpen(false)}
        direccionId={selectedDirId}
        direccionDesc={selectedDirDesc}
      />
    </>
  );
};

export default Direcciones;
