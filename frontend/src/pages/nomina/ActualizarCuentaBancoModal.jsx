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

const ActualizarCuentaBancoModal = ({ isOpen, onClose, empleado, empresaId, onUpdateSuccess }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [cuentaBanco, setCuentaBanco] = useState('');
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    if (isOpen && empleado) {
      fetchData();
      setShowForm(false);
      setCuentaBanco('');
      setNombre(`${empleado.Nombres} ${empleado.Apellido1 || ''}`.trim());
    }
  }, [isOpen, empleado]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/actualiza-banco/${empleado.EmpleadoID}?empresaId=${empresaId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo cargar el historial de cuentas de banco', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!cuentaBanco) {
      Swal.fire('Error', 'Debe ingresar la nueva cuenta de banco', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        Empleadoid: empleado.EmpleadoID,
        Nombre: nombre,
        CuentaBancoAnterior: empleado.CuentaBanco,
        CuentaBanco: cuentaBanco
      };
      await axios.post(`/api/actualiza-banco?empresaId=${empresaId}`, payload);
      Swal.fire('Éxito', 'Registro creado', 'success');
      setShowForm(false);
      setCuentaBanco('');
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo guardar el registro', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProcesar = async (row) => {
    const confirm = await Swal.fire({
      title: '¿Procesar Cambio?',
      text: `¿Seguro que desea aplicar la cuenta ${row.CuentaBanco} a este empleado? Esta acción no se puede deshacer.`,
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
          CuentaBanco: row.CuentaBanco
        };
        await axios.put(`/api/actualiza-banco/procesar/${row.Actualizabancoid}?empresaId=${empresaId}`, payload);
        Swal.fire('Éxito', 'Cuenta actualizada correctamente en el empleado', 'success');
        fetchData();
        if (onUpdateSuccess) onUpdateSuccess();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo procesar el cambio', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { header: 'Fecha Creado', accessor: 'FechaCreado', render: (row) => new Date(row.FechaCreado).toLocaleString() },
    { header: 'Cuenta Anterior', accessor: 'CuentaBancoAnterior' },
    { header: 'Nueva Cuenta', accessor: 'CuentaBanco' },
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
      title={`Actualizar Cuenta Banco: ${empleado?.Nombres} ${empleado?.Apellido1 || ''}`}
      size="lg"
      hideFooter={true}
    >
      <div style={{ padding: '20px' }}>
        {!showForm ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#334155' }}>Historial de Solicitudes</h4>
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
              Nueva Solicitud de Cambio de Cuenta
            </h4>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <BaseInputGroup label="Cuenta Actual (Asignada)">
                  <input 
                    type="text" 
                    value={empleado?.CuentaBanco || 'Ninguna'} 
                    disabled 
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} 
                  />
                </BaseInputGroup>
                
                <BaseInputGroup label="Nueva Cuenta de Banco">
                  <input 
                    type="text" 
                    value={cuentaBanco} 
                    onChange={(e) => setCuentaBanco(e.target.value)}
                    required
                    maxLength={20}
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                    placeholder="Ej. 1234567890"
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

export default ActualizarCuentaBancoModal;
