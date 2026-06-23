import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { Pencil, Trash2, X } from 'lucide-react';

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

const TiposNominasEmpleadoModal = ({ isOpen, onClose, empleado, empresaId }) => {
  const [data, setData] = useState([]);
  const [tiposNominasConfig, setTiposNominasConfig] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [tipoNominaId, setTipoNominaId] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen && empleado) {
      fetchData();
      fetchConfig();
      resetForm();
    }
  }, [isOpen, empleado]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/empleado-nomina/${empleado.EmpleadoID}?empresaId=${empresaId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los tipos de nóminas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`/api/configuracion/tipos-nominas?empresaId=${empresaId}`);
      setTiposNominasConfig(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTipoNominaId('');
    setFechaInicio(new Date().toISOString().split('T')[0]);
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tipoNominaId) {
      Swal.fire('Error', 'Debe seleccionar un tipo de nómina', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        EmpleadoID: empleado.EmpleadoID,
        TipoNominaId: tipoNominaId,
        FechaInicio: fechaInicio
      };

      if (isEditing) {
        await axios.put(`/api/empleado-nomina/${empleado.EmpleadoID}/${tipoNominaId}?empresaId=${empresaId}`, payload);
        Swal.fire('Éxito', 'Fecha de inicio actualizada', 'success');
      } else {
        await axios.post(`/api/empleado-nomina?empresaId=${empresaId}`, payload);
        Swal.fire('Éxito', 'Tipo de nómina asignado', 'success');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error al guardar la información';
      Swal.fire('Atención', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (row) => {
    setTipoNominaId(row.TipoNominaId);
    setFechaInicio(row.FechaInicio.split('T')[0]);
    setIsEditing(true);
  };

  const handleDelete = async (row) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar Asignación?',
      text: `¿Seguro que desea quitar "${row.TipoNominaDesc}" de este empleado?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(`/api/empleado-nomina/${empleado.EmpleadoID}/${row.TipoNominaId}?empresaId=${empresaId}`);
        Swal.fire('Eliminado', 'El tipo de nómina fue removido', 'success');
        fetchData();
        if (isEditing && tipoNominaId === row.TipoNominaId) resetForm();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { header: 'Tipo Nómina', accessor: 'TipoNominaDesc' },
    { header: 'Fecha Inicio', accessor: 'FechaInicio', render: (row) => new Date(row.FechaInicio).toLocaleDateString() },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEditClick(row)}
            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
            title="Editar Fecha"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
            title="Remover Nómina"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Tipos de Nóminas: ${empleado?.Nombres} ${empleado?.Apellido1 || ''}`}
      size="md"
      hideFooter={true}
    >
      <div style={{ padding: '20px' }}>
        <form onSubmit={handleSave} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#334155' }}>
            {isEditing ? 'Editar Fecha de Nómina' : 'Asignar Nuevo Tipo de Nómina'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <BaseInputGroup label="Tipo de Nómina">
              <select 
                value={tipoNominaId} 
                onChange={(e) => setTipoNominaId(e.target.value)}
                required
                disabled={isEditing}
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: isEditing ? '#f1f5f9' : 'white' }}
              >
                <option value="">Seleccione...</option>
                {tiposNominasConfig.map(tn => (
                  <option key={tn.TipoNominaID} value={tn.TipoNominaID}>{tn.Descripcion}</option>
                ))}
              </select>
            </BaseInputGroup>
            
            <BaseInputGroup label="Fecha de Inicio">
              <input 
                type="date" 
                value={fechaInicio} 
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
              />
            </BaseInputGroup>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                style={{ padding: '6px 12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <X size={14} /> Cancelar
              </button>
            )}
            <button 
              type="submit"
              disabled={loading}
              style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar Fecha' : 'Agregar')}
            </button>
          </div>
        </form>

        <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>Nóminas Asignadas</h4>
        <DataTable 
          data={data}
          columns={columns}
          loading={loading}
          hideMainHeader={true}
        />
      </div>
    </Modal>
  );
};

export default TiposNominasEmpleadoModal;
