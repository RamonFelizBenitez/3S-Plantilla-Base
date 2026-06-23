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

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

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
          {['Actualizar datos empleados', 'Actualizar Cuenta Banco', 'Actualizar Salario', 'Tipos de Nominas', 'Dependientes', 'Reconocimiento de Tiempo'].map((opt, i) => (
            <button 
              key={i}
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
          ))}
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
  
  const [isTiempoModalOpen, setIsTiempoModalOpen] = useState(false);
  const [tiempoEmpleado, setTiempoEmpleado] = useState(null);

  const [activeTab, setActiveTab] = useState(1);
  const [salarios, setSalarios] = useState([]);
  const [loadingSalarios, setLoadingSalarios] = useState(false);
  const [acciones, setAcciones] = useState([]);
  const [loadingAcciones, setLoadingAcciones] = useState(false);

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
          {['Información General', 'Datos de Nómina', 'Salario Mensual', 'Acciones'].map((tab, idx) => (
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
              {/* SECCIÓN 1: DATOS PERSONALES */}
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

            {/* SECCIÓN 2: DATOS ORGANIZATIVOS */}
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
                <input type="text" value={selectedEmpleado.FechaIngreso ? new Date(selectedEmpleado.FechaIngreso).toLocaleDateString() : ''} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
              </BaseInputGroup>

              <BaseInputGroup label="Fecha de Salida">
                <input type="text" value={selectedEmpleado.FechaSalida ? new Date(selectedEmpleado.FechaSalida).toLocaleDateString() : 'N/A'} disabled style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f1f5f9' }} />
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
                { header: 'Fecha Inicio', accessor: 'FechaInicio', render: (row) => new Date(row.FechaInicio).toLocaleDateString() },
                { header: 'Fecha Fin', accessor: 'FechaFin', render: (row) => row.FechaFin ? new Date(row.FechaFin).toLocaleDateString() : 'N/A' },
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
                { header: 'Fecha Efectivo', accessor: 'FechaEfectivo', render: (row) => row.FechaEfectivo ? new Date(row.FechaEfectivo).toLocaleDateString() : '' },
                { header: 'Sueldo', accessor: 'Sueldo', render: (row) => row.Sueldo ? `$${parseFloat(row.Sueldo).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00' },
                { header: 'Cargo Asignado', accessor: 'CargoAsignado' },
                { header: 'Dependencia Asignada', accessor: 'DependenciaAsignada' }
              ]}
              hideMainHeader={true}
            />
          </div>
        )}

        {/* Botón de cerrar fijo en la parte inferior */}
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
    </div>
  );
};

export default Empleados;
