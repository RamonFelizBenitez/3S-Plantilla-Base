import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Eye, MoreVertical } from 'lucide-react';
import ReconocimientoTiempoModal from './ReconocimientoTiempoModal';
import ActualizarDatosEmpleadoModal from './ActualizarDatosEmpleadoModal';
import ActualizarCuentaBancoModal from './ActualizarCuentaBancoModal';
import ActualizarSalarioModal from './ActualizarSalarioModal';
import TiposNominasEmpleadoModal from './TiposNominasEmpleadoModal';
import EmpleadoDependientesModal from './EmpleadoDependientesModal';
import EmpleadoTransaccionesModal from './EmpleadoTransaccionesModal';

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

const formatDateStr = (dateString) => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  } catch (e) {
    return new Date(dateString).toLocaleDateString();
  }
};

const ActionMenu = ({ empleado, onActionClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPos({ top: rect.bottom, right: window.innerWidth - rect.right });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const closeMenu = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener('click', closeMenu);
      window.addEventListener('scroll', closeMenu, true);
    }
    return () => {
      document.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [isOpen]);

  return (
    <>
      <button 
        type="button"
        onClick={toggleMenu}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', color: '#64748b' }}
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ 
            position: 'fixed', right: menuPos.right, top: menuPos.top, 
            background: 'white', border: '1px solid #e2e8f0', 
            borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
            zIndex: 9999, minWidth: '220px', padding: '4px 0' 
          }}
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {['Actualizar datos empleados', 'Actualizar Cuenta Banco', 'Actualizar Salario', 'Tipos de Nominas', 'Dependientes', 'Transacciones de Empleados', 'Reconocimiento de Tiempo'].map((opt, i) => (
            <li key={i} style={{ borderBottom: i < 6 ? '1px solid #e2e8f0' : 'none' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onActionClick(opt, empleado);
                }}
                style={{ 
                  display: 'block', width: '100%', textAlign: 'left', 
                  padding: '8px 16px', background: 'none', border: 'none', 
                  cursor: 'pointer', fontSize: '13px', color: '#334155' 
                }}
                onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                {opt}
              </button>
            </li>
          ))}
          </ul>
        </div>
      )}
    </>
  );
};

const Empleados = () => {
  const empresaId = localStorage.getItem('empresaId') || '1';
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  
  const [isActualizarDatosModalOpen, setIsActualizarDatosModalOpen] = useState(false);
  const [actualizarEmpleado, setActualizarEmpleado] = useState(null);
  
  const [isCuentaBancoModalOpen, setIsCuentaBancoModalOpen] = useState(false);
  const [cuentaBancoEmpleado, setCuentaBancoEmpleado] = useState(null);

  const [isSalarioModalOpen, setIsSalarioModalOpen] = useState(false);
  const [salarioEmpleado, setSalarioEmpleado] = useState(null);

  const [isTiposNominasModalOpen, setIsTiposNominasModalOpen] = useState(false);
  const [tiposNominasEmpleado, setTiposNominasEmpleado] = useState(null);

  // Modal de Transacciones
  const [isTransaccionesModalOpen, setIsTransaccionesModalOpen] = useState(false);
  const [transaccionesEmpleado, setTransaccionesEmpleado] = useState(null);

  // Modal de Dependientes
  const [isDependientesModalOpen, setIsDependientesModalOpen] = useState(false);
  const [dependientesEmpleado, setDependientesEmpleado] = useState(null);
  
  const [isTiempoModalOpen, setIsTiempoModalOpen] = useState(false);
  const [tiempoEmpleado, setTiempoEmpleado] = useState(null);

  const [activeTab, setActiveTab] = useState(1);
  const [salarios, setSalarios] = useState([]);
  const [loadingSalarios, setLoadingSalarios] = useState(false);
  const [acciones, setAcciones] = useState([]);
  const [loadingAcciones, setLoadingAcciones] = useState(false);

  const currentYear = new Date().getFullYear();
  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [periodoPagos, setPeriodoPagos] = useState(currentYear);

  const [isPagoDetalleModalOpen, setIsPagoDetalleModalOpen] = useState(false);
  const [pagoDetalleLineas, setPagoDetalleLineas] = useState([]);
  const [loadingPagoDetalle, setLoadingPagoDetalle] = useState(false);

  useEffect(() => {
    if (activeTab === 3 && selectedEmpleado) {
      const fetchSalarios = async () => {
        try {
          setLoadingSalarios(true);
          const res = await axios.get(`/api/empleados/${selectedEmpleado.EmpleadoID}/salario?empresaId=${empresaId}`);
          setSalarios(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingSalarios(false);
        }
      };
      fetchSalarios();
    }
  }, [activeTab, selectedEmpleado, empresaId]);

  useEffect(() => {
    if (activeTab === 4 && selectedEmpleado) {
      const fetchAcciones = async () => {
        try {
          setLoadingAcciones(true);
          const res = await axios.get(`/api/empleados/${selectedEmpleado.EmpleadoID}/acciones?empresaId=${empresaId}`);
          setAcciones(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingAcciones(false);
        }
      };
      fetchAcciones();
    }
  }, [activeTab, selectedEmpleado, empresaId]);

  useEffect(() => {
    if (activeTab === 5 && selectedEmpleado) {
      const fetchPagos = async () => {
        try {
          setLoadingPagos(true);
          const res = await axios.get(`/api/empleados/${selectedEmpleado.EmpleadoID}/pagos?empresaId=${empresaId}&periodo=${periodoPagos}`);
          setPagos(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingPagos(false);
        }
      };
      fetchPagos();
    }
  }, [activeTab, selectedEmpleado, empresaId, periodoPagos]);

  const handleVerDetallePago = async (pago) => {
    try {
      setLoadingPagoDetalle(true);
      setIsPagoDetalleModalOpen(true);
      const res = await axios.get(`/api/empleados/${selectedEmpleado.EmpleadoID}/pagos/detalle?empresaId=${empresaId}&codigoPeriodo=${pago.CodigoPeriodo}&nominaNumero=${pago.Secuencia}&secuencia=${pago.Secuencia}&tipoNominaId=${pago.TipoNominaID}`);
      setPagoDetalleLineas(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo cargar el detalle del pago', 'error');
    } finally {
      setLoadingPagoDetalle(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/empleados?empresaId=${empresaId}`);
      setEmpleados(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los empleados', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, [empresaId]);

  useEffect(() => {
    if (selectedEmpleado) {
      const updated = empleados.find(e => e.EmpleadoID === selectedEmpleado.EmpleadoID);
      if (updated) {
        setSelectedEmpleado(updated);
      }
    }
  }, [empleados]);

  const handleConsultar = (empleado) => {
    setSelectedEmpleado(empleado);
    setActiveTab(1);
    setIsModalOpen(true);
  };

  const handleActionClick = (action, empleado) => {
    if (action === 'Reconocimiento de Tiempo') {
      setTiempoEmpleado(empleado);
      setIsTiempoModalOpen(true);
    } else if (action === 'Actualizar datos empleados') {
      setActualizarEmpleado(empleado);
      setIsActualizarDatosModalOpen(true);
    } else if (action === 'Actualizar Cuenta Banco') {
      setCuentaBancoEmpleado(empleado);
      setIsCuentaBancoModalOpen(true);
    } else if (action === 'Actualizar Salario') {
      setSalarioEmpleado(empleado);
      setIsSalarioModalOpen(true);
    } else if (action === 'Tipos de Nominas') {
      setTiposNominasEmpleado(empleado);
      setIsTiposNominasModalOpen(true);
    } else if (action === 'Dependientes') {
      setDependientesEmpleado(empleado);
      setIsDependientesModalOpen(true);
    } else if (action === 'Transacciones de Empleados') {
      setTransaccionesEmpleado(empleado);
      setIsTransaccionesModalOpen(true);
    } else {
      Swal.fire('Información', `Opción "${action}" en desarrollo`, 'info');
    }
  };

  const getEstatusText = (estatus) => {
    switch (estatus) {
      case 0: return 'Activo';
      case 1: return 'Inactivo';
      case 2: return 'Licencia con Disfrute';
      case 3: return 'Licencia Sin Disfrute';
      case 4: return 'Baja';
      default: return '';
    }
  };

  const columns = [
    { header: 'Código', accessor: 'EmpleadoID' },
    { header: 'Nombres', accessor: 'Nombres', render: (row) => `${row.Nombres || ''} ${row.Apellido1 || ''} ${row.Apellido2 || ''}`.replace(/\s+/g, ' ').trim() },
    { header: 'Cédula', accessor: 'Cedula' },
    { header: 'Cargo', accessor: 'CargoDesc' },
    { header: 'Estatus', accessor: 'Estatus', render: (row) => getEstatusText(row.Estatus) },
    { header: 'Nómina', accessor: 'Nomina', render: (row) => row.Nomina ? 'SI' : 'NO' }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '20px' }}>Mantenimiento de Empleados (Consulta)</h2>

      <DataTable 
        title="Mantenimiento de Empleados"
        hideMainHeader={false}
        data={empleados} 
        columns={columns} 
        loading={loading}
        onEdit={handleConsultar}
        editLabel="Consultar"
        renderActions={(row) => <ActionMenu empleado={row} onActionClick={handleActionClick} />}
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Detalle del Empleado (Sólo Lectura)"
        size="lg" 
        maxHeight="95vh"
        hideFooter={true}
      >
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
          {['Información General', 'Datos de Nómina', 'Salario Mensual', 'Acciones', 'Pagos'].map((tab, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTab(idx + 1)}
              style={{
                flex: 1, padding: '10px', background: 'none', border: 'none',
                borderBottom: activeTab === (idx + 1) ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === (idx + 1) ? '#2563eb' : '#64748b',
                fontWeight: activeTab === (idx + 1) ? '600' : '400',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ minHeight: '65vh', maxHeight: '65vh', overflowY: 'auto', paddingRight: '10px', position: 'relative' }}>
          {selectedEmpleado && activeTab === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px' }}>
              <div>
                <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', color: '#334155' }}>Datos Personales</h4>
              
              <BaseInputGroup label="Código Empleado">
                <input type="text" value={selectedEmpleado.EmpleadoID || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Nombres">
                <input type="text" value={selectedEmpleado.Nombres || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Apellidos">
                <input type="text" value={`${selectedEmpleado.Apellido1 || ''} ${selectedEmpleado.Apellido2 || ''}`.trim()} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Cédula">
                <input type="text" value={selectedEmpleado.Cedula || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <BaseInputGroup label="Sexo">
                  <input type="text" value={selectedEmpleado.Sexo === 1 ? 'Masculino' : selectedEmpleado.Sexo === 2 ? 'Femenino' : ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
                </BaseInputGroup>
                
                <BaseInputGroup label="Estado Civil">
                  <input type="text" value={selectedEmpleado.EstadoCivil === 1 ? 'Soltero' : selectedEmpleado.EstadoCivil === 2 ? 'Casado' : selectedEmpleado.EstadoCivil === 3 ? 'Unido' : selectedEmpleado.EstadoCivil === 4 ? 'Divorciado' : ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
                </BaseInputGroup>
              </div>

              <BaseInputGroup label="Teléfonos">
                <input type="text" value={`${selectedEmpleado.Telefono1 || ''} / ${selectedEmpleado.Celular || ''}`} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Email">
                <input type="text" value={selectedEmpleado.Email || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>
            </div>

            <div>
              <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', color: '#334155' }}>Datos Organizativos</h4>
              
              <BaseInputGroup label="Cargo">
                <input type="text" value={selectedEmpleado.CargoDesc || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Dirección">
                <input type="text" value={selectedEmpleado.DireccionDesc || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Dependencia">
                <input type="text" value={selectedEmpleado.DependenciaDesc || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>
            </div>
          </div>
        )}
        
        {selectedEmpleado && activeTab === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '10px' }}>
            <div>
              <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', color: '#334155' }}>Datos de Nómina</h4>
              
              <BaseInputGroup label="Tipo de Nómina">
                <input type="text" value={selectedEmpleado.TipoNominaDesc || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Estatus">
                <input type="text" value={getEstatusText(selectedEmpleado.Estatus)} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="En Nómina">
                <input type="text" value={selectedEmpleado.Nomina ? 'Sí' : 'No'} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Turno">
                <input type="text" value={selectedEmpleado.TurnoDesc || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>
            </div>

            <div>
              <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', color: '#334155' }}>Información de Pago y Fechas</h4>

              <BaseInputGroup label="Fecha de Ingreso">
                <input type="text" value={selectedEmpleado.FechaIngreso ? formatDateStr(selectedEmpleado.FechaIngreso) : ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Fecha de Salida">
                <input type="text" value={selectedEmpleado.FechaSalida ? formatDateStr(selectedEmpleado.FechaSalida) : 'N/A'} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Cuenta de Banco">
                <input type="text" value={selectedEmpleado.CuentaBanco || ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Forma de Pago">
                <input type="text" value={selectedEmpleado.FormaPago === 0 ? 'Cheque' : selectedEmpleado.FormaPago === 1 ? 'Tarjeta Débito' : selectedEmpleado.FormaPago === 2 ? 'Efectivo' : selectedEmpleado.FormaPago !== null ? selectedEmpleado.FormaPago : ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>
            </div>
          </div>
        )}

        {selectedEmpleado && activeTab === 3 && (
          <div style={{ padding: '20px' }}>
            <h4 style={{ color: '#334155', marginBottom: '15px' }}>Historial de Salarios (Percepciones)</h4>
            <DataTable 
              data={salarios} 
              columns={[
                { header: 'ID', accessor: 'DevengoID' },
                { header: 'Descripción', accessor: 'NombreDevengo' },
                { header: 'Valor', accessor: 'Valor', render: (row) => `$${Number(row.Valor).toLocaleString('es-DO', { minimumFractionDigits: 2 })}` },
                { header: 'Fecha Inicio', accessor: 'FechaInicio', render: (row) => formatDateStr(row.FechaInicio) },
                { header: 'Fecha Fin', accessor: 'FechaFin', render: (row) => row.FechaFin ? formatDateStr(row.FechaFin) : 'N/A' },
                { header: 'Activo', accessor: 'SueldoActivo', render: (row) => row.SueldoActivo ? 'SI' : 'NO' }
              ]}
              loading={loadingSalarios}
              hideMainHeader={true}
            />
          </div>
        )}

        {selectedEmpleado && activeTab === 4 && (
          <div style={{ padding: '10px' }}>
            <h4 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px', color: '#334155' }}>Historial de Acciones</h4>
            <DataTable 
              data={acciones}
              loading={loadingAcciones}
              columns={[
                { header: 'Tipo Acción', accessor: 'TipoAccion' },
                { header: 'Número', accessor: 'Numero' },
                { header: 'Fecha Efectivo', accessor: 'FechaEfectivo', render: (row) => row.FechaEfectivo ? formatDateStr(row.FechaEfectivo) : '' },
                { header: 'Sueldo', accessor: 'Sueldo', render: (row) => row.Sueldo ? `$${parseFloat(row.Sueldo).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00' },
                { header: 'Cargo Asignado', accessor: 'CargoAsignado' },
                { header: 'Dependencia Asignada', accessor: 'DependenciaAsignada' }
              ]}
              hideMainHeader={true}
            />
          </div>
        )}

        {selectedEmpleado && activeTab === 5 && (
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#334155' }}>Historial de Pagos (Nóminas)</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Período (Año):</label>
                <select 
                  value={periodoPagos}
                  onChange={(e) => setPeriodoPagos(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  {[...Array(10)].map((_, i) => {
                    const year = currentYear - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
            <DataTable 
              data={pagos}
              loading={loadingPagos}
              columns={[
                { header: 'Número', accessor: 'Secuencia' },
                { header: 'Nómina', accessor: 'TipoNominaID' },
                { header: 'Desde', accessor: 'FechaInicial', render: (row) => row.FechaInicial ? formatDateStr(row.FechaInicial) : '' },
                { header: 'Hasta', accessor: 'FechaFinal', render: (row) => row.FechaFinal ? formatDateStr(row.FechaFinal) : '' },
                { header: 'Fecha', accessor: 'FechaGeneracion', render: (row) => row.FechaGeneracion ? formatDateStr(row.FechaGeneracion) : '' },
                { header: 'Ingresos', accessor: 'Ingreso', render: (row) => row.Ingreso ? `$${parseFloat(row.Ingreso).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00' },
                { header: 'Deducciones', accessor: 'Egreso', render: (row) => row.Egreso ? `$${parseFloat(row.Egreso).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00' },
                { 
                  header: 'Neto', 
                  accessor: 'Neto', 
                  render: (row) => <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{row.Neto ? `$${parseFloat(row.Neto).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00'}</span> 
                }
              ]}
              hideMainHeader={true}
              onEdit={handleVerDetallePago}
              editLabel="Detalle"
            />
          </div>
        )}

        <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setIsModalOpen(false)}
            style={{ padding: '8px 16px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cerrar
          </button>
        </div>

        </div>
      </Modal>

      <ReconocimientoTiempoModal 
        isOpen={isTiempoModalOpen}
        onClose={() => setIsTiempoModalOpen(false)}
        empleado={tiempoEmpleado}
        empresaId={empresaId}
      />

      <ActualizarDatosEmpleadoModal
        isOpen={isActualizarDatosModalOpen}
        onClose={() => setIsActualizarDatosModalOpen(false)}
        empleado={actualizarEmpleado}
        empresaId={empresaId}
        onUpdateSuccess={fetchEmpleados}
      />

      <ActualizarCuentaBancoModal
        isOpen={isCuentaBancoModalOpen}
        onClose={() => setIsCuentaBancoModalOpen(false)}
        empleado={cuentaBancoEmpleado}
        empresaId={empresaId}
        onUpdateSuccess={fetchEmpleados}
      />

      <ActualizarSalarioModal
        isOpen={isSalarioModalOpen}
        onClose={() => setIsSalarioModalOpen(false)}
        empleado={salarioEmpleado}
        empresaId={empresaId}
        onUpdateSuccess={fetchEmpleados}
      />

      <TiposNominasEmpleadoModal
        isOpen={isTiposNominasModalOpen}
        onClose={() => setIsTiposNominasModalOpen(false)}
        empleado={tiposNominasEmpleado}
        empresaId={empresaId}
      />

      <EmpleadoDependientesModal 
        isOpen={isDependientesModalOpen}
        onClose={() => setIsDependientesModalOpen(false)}
        empleado={dependientesEmpleado}
        empresaId={empresaId}
        onUpdateSuccess={fetchEmpleados}
      />

      {/* Modal de Transacciones de Empleados */}
      <EmpleadoTransaccionesModal
        isOpen={isTransaccionesModalOpen}
        onClose={() => setIsTransaccionesModalOpen(false)}
        empleado={transaccionesEmpleado}
        empresaId={empresaId}
      />

      <Modal 
        isOpen={isPagoDetalleModalOpen} 
        onClose={() => setIsPagoDetalleModalOpen(false)} 
        title="Detalle de Nómina"
        size="lg"
      >
        <div style={{ padding: '10px' }}>
          <DataTable 
            data={pagoDetalleLineas}
            loading={loadingPagoDetalle}
            columns={[
              { header: 'Empleado', accessor: 'EmpleadoID' },
              { header: 'Desde', accessor: 'FechaInicial', render: (row) => row.FechaInicial ? formatDateStr(row.FechaInicial) : '' },
              { header: 'Hasta', accessor: 'FechaFinal', render: (row) => row.FechaFinal ? formatDateStr(row.FechaFinal) : '' },
              { header: 'Transacción', accessor: 'NombreTransaccion' },
              { 
                header: 'Efecto', 
                accessor: 'Efecto', 
                render: (row) => <span style={{ fontWeight: 'bold', color: row.Efecto === '+' ? '#16a34a' : '#dc2626' }}>{row.Efecto}</span> 
              },
              { header: 'Ingresos', accessor: 'Ingreso', render: (row) => row.Ingreso ? `$${parseFloat(row.Ingreso).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00' },
              { header: 'Deducciones', accessor: 'Deduccion', render: (row) => row.Deduccion ? `$${parseFloat(row.Deduccion).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00' }
            ]}
            hideMainHeader={true}
          />
        </div>
      </Modal>

    </div>
  );
};

export default Empleados;
