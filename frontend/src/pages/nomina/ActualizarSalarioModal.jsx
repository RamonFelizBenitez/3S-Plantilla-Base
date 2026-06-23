import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

const ActualizarSalarioModal = ({ isOpen, onClose, empleado, empresaId, onUpdateSuccess }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [sueldoActual, setSueldoActual] = useState(0);
  const [sueldoPropuesto, setSueldoPropuesto] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen && empleado) {
      fetchData();
      fetchSueldoActual();
      setShowForm(false);
      setSueldoPropuesto('');
      setFechaInicio(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, empleado]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/actualiza-salario/${empleado.EmpleadoID}?empresaId=${empresaId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo cargar el historial de salarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSueldoActual = async () => {
    try {
      const res = await axios.get(`/api/actualiza-salario/actual/${empleado.EmpleadoID}?empresaId=${empresaId}`);
      setSueldoActual(res.data.sueldo);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!sueldoPropuesto || sueldoPropuesto <= 0) {
      Swal.fire('Error', 'Debe ingresar un sueldo propuesto válido mayor a 0', 'error');
      return;
    }
    if (!fechaInicio) {
      Swal.fire('Error', 'Debe indicar la fecha de inicio', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        Empleadoid: empleado.EmpleadoID,
        Nombre: `${empleado.Nombres} ${empleado.Apellido1 || ''}`.trim(),
        SueldoActual: sueldoActual,
        SueldoPropuesto: parseFloat(sueldoPropuesto),
        FechaInicio: fechaInicio
      };
      await axios.post(`/api/actualiza-salario?empresaId=${empresaId}`, payload);
      Swal.fire('Éxito', 'Solicitud registrada', 'success');
      setShowForm(false);
      setSueldoPropuesto('');
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo registrar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProcesar = async (row) => {
    const confirm = await Swal.fire({
      title: '¿Procesar Cambio?',
      text: `¿Seguro que desea establecer el salario a RD$ ${parseFloat(row.SueldoPropuesto).toLocaleString()}? Los salarios anteriores quedarán inactivos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, procesar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        const payload = {
          Empleadoid: empleado.EmpleadoID,
          SueldoPropuesto: row.SueldoPropuesto,
          FechaInicio: row.FechaInicio
        };
        await axios.put(`/api/actualiza-salario/procesar/${row.Actualizasueldoid}?empresaId=${empresaId}`, payload);
        Swal.fire('Éxito', 'Salario procesado y actualizado correctamente', 'success');
        fetchData();
        fetchSueldoActual(); // Refresh read-only current salary
        if (onUpdateSuccess) onUpdateSuccess();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo procesar el salario', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { header: 'Fecha Creado', accessor: 'FechaCreado', render: (row) => new Date(row.FechaCreado).toLocaleString() },
    { header: 'Efectivo Desde', accessor: 'FechaInicio', render: (row) => new Date(row.FechaInicio).toLocaleDateString() },
    { header: 'Sueldo Actual', accessor: 'SueldoActual', render: (row) => `RD$ ${parseFloat(row.SueldoActual).toLocaleString()}` },
    { header: 'Sueldo Propuesto', accessor: 'SueldoPropuesto', render: (row) => `RD$ ${parseFloat(row.SueldoPropuesto).toLocaleString()}` },
    { 
      header: 'Estatus', 
      accessor: 'Estatus',
      render: (row) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px', 
          backgroundColor: row.Estatus ? '#dcfce3' : '#fef9c3', 
          color: row.Estatus ? '#166534' : '#854d0e',
          fontWeight: 'bold'
        }}>
          {row.Estatus ? 'Procesado' : 'Pendiente'}
        </span>
      )
    },
    {
      header: 'Acción',
      accessor: 'acciones',
      render: (row) => (
        !row.Estatus ? (
          <button
            onClick={() => handleProcesar(row)}
            style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            Procesar
          </button>
        ) : <span style={{ color: '#94a3b8', fontSize: '12px' }}>Sin acción</span>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Actualizar Salario: ${empleado?.Nombres} ${empleado?.Apellido1 || ''}`}
      size="lg"
      hideFooter={true}
    >
      <div style={{ padding: '20px' }}>
        {!showForm ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#334155' }}>Historial de Salarios Propuestos</h4>
              <button 
                onClick={() => setShowForm(true)}
                style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Nueva Solicitud
              </button>
            </div>
            
            <DataTable 
              data={data}
              columns={columns}
              loading={loading}
              hideMainHeader={true}
            />
          </>
        ) : (
          <div>
            <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', color: '#334155' }}>
              Nueva Solicitud de Cambio de Salario
            </h4>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <BaseInputGroup label="Sueldo Actual (RD$)">
                  <input 
                    type="text" 
                    value={parseFloat(sueldoActual).toLocaleString()} 
                    disabled 
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} 
                  />
                </BaseInputGroup>
                
                <BaseInputGroup label="Sueldo Propuesto (RD$)">
                  <input 
                    type="number" 
                    step="0.01"
                    min="1"
                    value={sueldoPropuesto} 
                    onChange={(e) => setSueldoPropuesto(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                    placeholder="Ej. 50000.00"
                  />
                </BaseInputGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginTop: '10px' }}>
                <BaseInputGroup label="Fecha Inicio (Efectivo Desde)">
                  <input 
                    type="date" 
                    value={fechaInicio} 
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                  />
                </BaseInputGroup>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {loading ? 'Guardando...' : 'Guardar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ActualizarSalarioModal;
