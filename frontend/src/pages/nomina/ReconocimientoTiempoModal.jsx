import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

const ReconocimientoTiempoModal = ({ isOpen, onClose, empleado, empresaId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [recordId, setRecordId] = useState(null);
  const [institucion, setInstitucion] = useState('');
  const [fechaInicial, setFechaInicial] = useState('');
  const [fechaFinal, setFechaFinal] = useState('');
  const [pension, setPension] = useState(false);
  const [vacacion, setVacacion] = useState(false);

  useEffect(() => {
    if (isOpen && empleado) {
      fetchData();
      resetForm();
    }
  }, [isOpen, empleado]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/empleado-tiempo/${empleado.EmpleadoID}?empresaId=${empresaId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los registros de tiempo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecordId(null);
    setInstitucion('');
    setFechaInicial('');
    setFechaFinal('');
    setPension(false);
    setVacacion(false);
    setIsEditing(false);
  };

  const handleEdit = (row) => {
    setRecordId(row.RecordId);
    setInstitucion(row.Institucion);
    setFechaInicial(row.FechaInicial ? row.FechaInicial.split('T')[0] : '');
    setFechaFinal(row.FechaFinal ? row.FechaFinal.split('T')[0] : '');
    setPension(row.Pension);
    setVacacion(row.Vacacion);
    setIsEditing(true);
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/empleado-tiempo/${empleado.EmpleadoID}/${row.RecordId}?empresaId=${empresaId}`);
        Swal.fire('Eliminado!', 'El registro ha sido eliminado.', 'success');
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institucion || !fechaInicial || !fechaFinal) {
      Swal.fire('Atención', 'Por favor complete Institución, Fecha Inicial y Fecha Final', 'warning');
      return;
    }

    const payload = {
      Institucion: institucion,
      FechaInicial: fechaInicial,
      FechaFinal: fechaFinal,
      Pension: pension,
      Vacacion: vacacion
    };

    try {
      if (isEditing) {
        await axios.put(`/api/empleado-tiempo/${empleado.EmpleadoID}/${recordId}?empresaId=${empresaId}`, payload);
        Swal.fire('Actualizado', 'Registro actualizado correctamente', 'success');
      } else {
        await axios.post(`/api/empleado-tiempo/${empleado.EmpleadoID}?empresaId=${empresaId}`, payload);
        Swal.fire('Guardado', 'Registro guardado correctamente', 'success');
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo guardar el registro', 'error');
    }
  };

  const columns = [
    { header: 'Institución', accessor: 'Institucion' },
    { header: 'Fecha Inicial', accessor: 'FechaInicial', render: (row) => row.FechaInicial ? new Date(row.FechaInicial).toLocaleDateString() : '' },
    { header: 'Fecha Final', accessor: 'FechaFinal', render: (row) => row.FechaFinal ? new Date(row.FechaFinal).toLocaleDateString() : '' },
    { header: 'Pensión', accessor: 'Pension', render: (row) => row.Pension ? 'SÍ' : 'NO' },
    { header: 'Vacación', accessor: 'Vacacion', render: (row) => row.Vacacion ? 'SÍ' : 'NO' }
  ];

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Reconocimiento de Tiempo: ${empleado?.Nombres} ${empleado?.Apellido1 || ''}`}
      size="lg"
      hideFooter={true}
      maxHeight="95vh"
    >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Formulario */}
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>{isEditing ? 'Editar Registro' : 'Nuevo Registro'}</h4>
          <form onSubmit={handleSubmit}>
            <BaseInputGroup label="Institución">
              <input 
                type="text" 
                value={institucion}
                onChange={(e) => setInstitucion(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                placeholder="Nombre de la institución"
              />
            </BaseInputGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <BaseInputGroup label="Fecha Inicial">
                <input 
                  type="date" 
                  value={fechaInicial}
                  onChange={(e) => setFechaInicial(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
              <BaseInputGroup label="Fecha Final">
                <input 
                  type="date" 
                  value={fechaFinal}
                  onChange={(e) => setFechaFinal(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={pension}
                  onChange={(e) => setPension(e.target.checked)}
                />
                Aplica para Pensión
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={vacacion}
                  onChange={(e) => setVacacion(e.target.checked)}
                />
                Aplica para Vacaciones
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={resetForm}
                  style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar Edición
                </button>
              )}
              <button 
                type="submit"
                style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isEditing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div>
          <DataTable 
            title="Registros de Tiempo"
            data={data}
            columns={columns}
            loading={loading}
            onEdit={handleEdit}
            editLabel="Editar"
            renderActions={(row) => (
              <button 
                onClick={() => handleDelete(row)}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Eliminar
              </button>
            )}
            hideMainHeader={true}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button 
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReconocimientoTiempoModal;
