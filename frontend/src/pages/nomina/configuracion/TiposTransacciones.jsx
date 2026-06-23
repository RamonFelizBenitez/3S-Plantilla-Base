import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import useEmpresa from '../../../hooks/useEmpresa';

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

const TiposTransacciones = () => {
  const { empresaId } = useEmpresa();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    TipoTransId: '',
    Descripcion: '',
    Tipo: 0,
    ISR: false,
    AFP: false,
    ARS: false,
    Excento: false,
    Dependiente: false
  });

  useEffect(() => {
    if (empresaId) fetchData();
  }, [empresaId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/tipos-transacciones?empresaId=${empresaId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los tipos de transacciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (row = null) => {
    if (row) {
      setFormData({
        TipoTransId: row.TipoTransId,
        Descripcion: row.Descripcion,
        Tipo: row.Tipo,
        ISR: row.ISR,
        AFP: row.AFP,
        ARS: row.ARS,
        Excento: row.Excento,
        Dependiente: row.Dependiente
      });
      setIsEditing(true);
    } else {
      setFormData({
        TipoTransId: '',
        Descripcion: '',
        Tipo: 0,
        ISR: false,
        AFP: false,
        ARS: false,
        Excento: false,
        Dependiente: false
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing) {
        await axios.put(`/api/tipos-transacciones/${formData.TipoTransId}?empresaId=${empresaId}`, formData);
        Swal.fire('Actualizado', 'Registro actualizado correctamente', 'success');
      } else {
        await axios.post(`/api/tipos-transacciones?empresaId=${empresaId}`, formData);
        Swal.fire('Creado', 'Registro creado correctamente', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(`/api/tipos-transacciones/${id}?empresaId=${empresaId}`);
        Swal.fire('Eliminado', 'Registro eliminado exitosamente.', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const columns = [
    { header: 'Código', accessor: 'TipoTransId' },
    { header: 'Descripción', accessor: 'Descripcion' },
    { 
      header: 'Tipo', 
      accessor: 'Tipo',
      render: (row) => row.Tipo === 0 ? 'Ingresos' : 'Egresos'
    },
    { header: 'ISR', accessor: 'ISR', render: (row) => row.ISR ? 'Sí' : 'No' },
    { header: 'AFP', accessor: 'AFP', render: (row) => row.AFP ? 'Sí' : 'No' },
    { header: 'ARS', accessor: 'ARS', render: (row) => row.ARS ? 'Sí' : 'No' },
    { header: 'Excento ISR', accessor: 'Excento', render: (row) => row.Excento ? 'Sí' : 'No' },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleOpenModal(row)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(row.TipoTransId)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Tipos de Transacciones</h2>
        <button 
          onClick={() => handleOpenModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Nuevo Tipo
        </button>
      </div>

      <DataTable 
        data={data}
        columns={columns}
        loading={loading}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Tipo de Transacción" : "Nuevo Tipo de Transacción"}
        size="md"
        hideFooter={true}
      >
        <form onSubmit={handleSave} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
            <BaseInputGroup label="Código (ID)">
              <input 
                type="text" 
                name="TipoTransId"
                value={formData.TipoTransId} 
                onChange={handleChange}
                required
                disabled={isEditing}
                maxLength="10"
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: isEditing ? '#f1f5f9' : 'white' }} 
              />
            </BaseInputGroup>
            
            <BaseInputGroup label="Descripción">
              <input 
                type="text" 
                name="Descripcion"
                value={formData.Descripcion} 
                onChange={handleChange}
                required
                maxLength="50"
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
              />
            </BaseInputGroup>
          </div>

          <BaseInputGroup label="Tipo">
            <select 
              name="Tipo"
              value={formData.Tipo} 
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              <option value={0}>Ingresos</option>
              <option value={1}>Egresos</option>
            </select>
          </BaseInputGroup>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '15px', padding: '15px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" name="ISR" checked={formData.ISR} onChange={handleChange} /> ISR
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" name="AFP" checked={formData.AFP} onChange={handleChange} /> AFP
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" name="ARS" checked={formData.ARS} onChange={handleChange} /> ARS
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
              <input type="checkbox" name="Dependiente" checked={formData.Dependiente} onChange={handleChange} /> Dependiente
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer', gridColumn: 'span 2' }}>
              <input type="checkbox" name="Excento" checked={formData.Excento} onChange={handleChange} /> Excento ISR
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TiposTransacciones;
