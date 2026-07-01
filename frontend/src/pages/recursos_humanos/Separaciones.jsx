import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MoreVertical } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';


const Separaciones = () => {
  const empresaId = '1';
  const [separaciones, setSeparaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [tiposAcciones, setTiposAcciones] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const [isTomaPosesionModalOpen, setIsTomaPosesionModalOpen] = useState(false);
  const [tomaPosesionData, setTomaPosesionData] = useState({ id: null, fechaSalida: '', numeroNombramiento: '' });

  const [formData, setFormData] = useState({
    EmpleadoID: '',
    TipoAccionID: '',
    FechaSalida: '',
    Observacion: '',
    Cedula: '',
    DependenciaDesc: '',
    CargoDesc: '',
    Sueldo: '',
    NumeroNombramiento: '',
    Aprobado: false,
    FechaAprobado: '',
    Procesado: false,
    FechaNombramiento: '',
    Anulado: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resSep = await axios.get(`/api/separacion?empresaId=${empresaId}`);
      setSeparaciones(resSep.data);

      const resEmp = await axios.get(`/api/empleados?empresaId=${empresaId}`);
      setEmpleados(resEmp.data);

      const resTa = await axios.get(`/api/configuracion/tipos-acciones?empresaId=${empresaId}`);
      setTiposAcciones(resTa.data.filter(t => t.TipoAccionID >= 30 && t.TipoAccionID <= 39));

    } catch (err) {
      console.error(err);
    }
  };

  const handleEmpleadoChange = async (e) => {
    const empID = e.target.value;
    const empleado = empleados.find(emp => emp.EmpleadoID == empID);
    
    if (empleado) {
      let sueldoActual = 0;
      try {
        const resSalario = await axios.get(`/api/empleados/${empID}/salario?empresaId=${empresaId}`);
        if (resSalario.data && resSalario.data.length > 0) {
          const salarioActivo = resSalario.data.find(s => s.SueldoActivo === true || s.SueldoActivo === 1);
          sueldoActual = salarioActivo ? salarioActivo.Valor : resSalario.data[0].Valor;
        }
      } catch (err) {
        console.error('Error fetching salario:', err);
      }

      setFormData({
        ...formData,
        EmpleadoID: empID,
        Cedula: empleado.Cedula || '',
        DependenciaDesc: empleado.DependenciaDesc || '',
        CargoDesc: empleado.CargoDesc || '',
        Sueldo: sueldoActual
      });
    } else {
      setFormData({ 
        ...formData, 
        EmpleadoID: empID, 
        Cedula: '', 
        DependenciaDesc: '', 
        CargoDesc: '', 
        Sueldo: '' 
      });
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData({
      EmpleadoID: '',
      TipoAccionID: '',
      FechaSalida: '',
      Observacion: '',
      Cedula: '',
      DependenciaDesc: '',
      CargoDesc: '',
      Sueldo: '',
      NumeroNombramiento: '',
      Aprobado: false,
      FechaAprobado: '',
      Procesado: false,
      FechaNombramiento: '',
      Anulado: false
    });
    setShowModal(true);
  };

  const openEdit = (sep) => {
    setEditMode(true);
    setCurrentId(sep.SeparacionID);
    setFormData({
      EmpleadoID: sep.EmpleadoID,
      TipoAccionID: sep.TipoAccionID,
      FechaSalida: sep.FechaSalida ? sep.FechaSalida.split('T')[0] : '',
      Observacion: sep.Observacion,
      Cedula: sep.EmpleadoCedula || '',
      DependenciaDesc: sep.DependenciaDesc || '',
      CargoDesc: sep.CargoDesc || '',
      Sueldo: '', // Salario histórico no se carga para evitar confusiones al editar, a menos que se re-seleccione
      NumeroNombramiento: sep.NumeroNombramiento || '',
      Aprobado: sep.Aprobado || false,
      FechaAprobado: sep.FechaAprobado || '',
      Procesado: sep.Procesado || false,
      FechaNombramiento: sep.FechaNombramiento || '',
      Anulado: sep.Anulado || false
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'EmpleadoID') {
      handleEmpleadoChange(e);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.EmpleadoID || !formData.TipoAccionID || !formData.FechaSalida) {
      return Swal.fire('Error', 'Debe completar los campos obligatorios: Empleado, Tipo Acción y Fecha de Salida.', 'error');
    }

    try {
      const payload = {
        EmpleadoID: formData.EmpleadoID,
        TipoAccionID: formData.TipoAccionID,
        FechaSalida: formData.FechaSalida,
        Observacion: formData.Observacion
      };

      if (editMode) {
        await axios.put(`/api/separacion/${currentId}?empresaId=${empresaId}`, payload);
        Swal.fire('Éxito', 'Registro actualizado correctamente.', 'success');
      } else {
        await axios.post(`/api/separacion?empresaId=${empresaId}`, payload);
        Swal.fire('Éxito', 'Registro creado correctamente.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error al guardar.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: '¿Eliminar registro?',
      text: "No podrás revertir esto.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`/api/separacion/${id}?empresaId=${empresaId}`);
        Swal.fire('Eliminado', 'El registro ha sido eliminado.', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Error al eliminar.', 'error');
      }
    }
  };

  const handleAction = async (action, id) => {
    if (action === 'aprobar' || action === 'desaprobar') {
      const isAprobar = action === 'aprobar';
      const actionText = isAprobar ? 'aprobará' : 'desaprobará';
      
      const res = await Swal.fire({
        title: '¿Deseas ejecutar esta operación?',
        text: `Se ${actionText} el Separacion #${id}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Sí, ${action}`,
        cancelButtonText: 'Cancelar'
      });

      if (res.isConfirmed) {
        try {
          await axios.put(`/api/separacion/${id}/status?empresaId=${empresaId}`, { action });
          Swal.fire('Éxito', `El registro ha sido ${isAprobar ? 'aprobado' : 'desaprobado'}.`, 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Error', err.response?.data?.message || `Error al ${action}.`, 'error');
        }
      }
    } else if (action === 'toma_posesion') {
      const row = separaciones.find(s => s.SeparacionID === id);
      setTomaPosesionData({
        id: id,
        fechaSalida: row?.FechaSalida ? row.FechaSalida.split('T')[0] : '',
        numeroNombramiento: row?.NumeroNombramiento || ''
      });
      setIsTomaPosesionModalOpen(true);
    } else {
      Swal.fire('Información', `Acción '${action}' en desarrollo...`, 'info');
    }
  };

  const handleTomaPosesionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/separacion/${tomaPosesionData.id}/toma-posesion?empresaId=${empresaId}`, {
        fechaSalida: tomaPosesionData.fechaSalida,
        numeroNombramiento: tomaPosesionData.numeroNombramiento
      });
      Swal.fire('Éxito', 'La separación ha sido procesada correctamente.', 'success');
      setIsTomaPosesionModalOpen(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error al procesar la separación.', 'error');
    }
  };

  const formatFecha = (d) => {
    if(!d) return '';
    return new Date(d).toLocaleDateString('es-DO');
  };

  const columns = [
    { accessor: 'SeparacionID', header: 'ID' },
    { accessor: 'EmpleadoNombre', header: 'Empleado' },
    { accessor: 'EmpleadoCedula', header: 'Cédula' },
    { accessor: 'TipoAccionDesc', header: 'Tipo Acción' },
    { accessor: 'FechaSalida', header: 'Fecha Salida', render: (row) => formatFecha(row.FechaSalida) },
    { 
      accessor: 'Procesado', 
      header: 'Estado',
      render: (row) => {
        if(row.Anulado) return <span className="status-badge error">Anulado</span>;
        if(row.Procesado) return <span className="status-badge success">Procesado</span>;
        if(row.Aprobado) return <span className="status-badge warning">Aprobado</span>;
        return <span className="status-badge info">Registrado</span>;
      }
    }
  ];

  const formatSueldo = (sueldo) => {
    if (!sueldo) return '0.00';
    return Number(sueldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDateTime = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <DataTable 
        title="Separación de Servicios"
        columns={columns}
        data={separaciones}
        onAdd={openAdd}
        addButtonLabel="Nueva Separación"
        hideMainHeader={false}
        renderActions={(row) => {
          const isMenuOpen = menuOpenId === row.SeparacionID;
          return (
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                onClick={() => openEdit(row)} 
                style={{ padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', flex: 1, fontWeight: '500' }}
              >
                {!row.Aprobado ? 'Editar' : 'Consultar'}
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMenuOpen) {
                    setMenuOpenId(null);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const menuHeight = 220; 
                    let topPos = rect.bottom + 5;
                    if (spaceBelow < menuHeight && rect.top > menuHeight) {
                       topPos = rect.top - menuHeight - 5;
                    }
                    setMenuPos({ top: topPos, right: window.innerWidth - rect.right });
                    setMenuOpenId(row.SeparacionID);
                  }
                }}
                className="btn-action-pill"
                style={{ background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: '4px 6px', borderRadius: '4px' }}
              >
                Opciones <MoreVertical size={14} />
              </button>
            </div>
          );
        }}
      />

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title={editMode ? 'Editar Separación' : 'Nueva Separación'}
        size="xl"
        hideFooter={true}
      >
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
            {/* Columna Izquierda - Formulario Principal */}
            <div>
              <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '14px' }}>Selección de Empleado</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Empleado</label>
                    <select required value={formData.EmpleadoID} onChange={handleChange} name="EmpleadoID" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Seleccione un empleado...</option>
                      {empleados.map(e => <option key={e.EmpleadoID} value={e.EmpleadoID}>{e.Cedula} - {e.Nombres} {e.Apellido1} {e.Apellido2 || ''}</option>)}
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Cédula</label>
                    <input type="text" value={formData.Cedula} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Dependencia</label>
                    <input type="text" value={formData.DependenciaDesc} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Cargo</label>
                    <input type="text" value={formData.CargoDesc} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Sueldo</label>
                    <input type="text" value={formatSueldo(formData.Sueldo)} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '14px' }}>Datos de Separación</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Tipo de Acción</label>
                    <select required name="TipoAccionID" value={formData.TipoAccionID} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Seleccione tipo...</option>
                      {tiposAcciones.map(t => <option key={t.TipoAccionID} value={t.TipoAccionID}>{t.TipoAccionID} - {t.Descripcion}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Fecha de Salida</label>
                    <input required type="date" name="FechaSalida" value={formData.FechaSalida} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Observaciones</label>
                  <textarea name="Observacion" value={formData.Observacion} onChange={handleChange} placeholder="Indique el motivo o notas adicionales..." style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', height: '45px', resize: 'vertical' }}></textarea>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Estado y Control */}
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '15px', borderBottom: '2px solid #cbd5e1', paddingBottom: '6px' }}>Estado y Control (Sólo Lectura)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>ID Empleado</label>
                  <input type="text" value={formData.EmpleadoID} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}># Nombramiento</label>
                  <input type="text" value={formData.NumeroNombramiento} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Aprobado</label>
                  <input type="text" value={formData.Aprobado ? 'SÍ' : 'NO'} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Fecha Aprobado *</label>
                  <input type="text" value={formatDateTime(formData.FechaAprobado)} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Procesado</label>
                  <input type="text" value={formData.Procesado ? 'SÍ' : 'NO'} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Fecha Nombramiento *</label>
                  <input type="text" value={formatDateTime(formData.FechaNombramiento)} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Anulado</label>
                <input type="text" value={formData.Anulado ? 'SÍ' : 'NO'} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Registro</button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Procesar Toma de Posesión"
        isOpen={isTomaPosesionModalOpen}
        onClose={() => setIsTomaPosesionModalOpen(false)}
        hideFooter={true}
      >
        <form onSubmit={handleTomaPosesionSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Fecha de Salida Efectiva</label>
            <input 
              type="date" 
              required 
              value={tomaPosesionData.fechaSalida} 
              onChange={e => setTomaPosesionData({...tomaPosesionData, fechaSalida: e.target.value})} 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Número de Nombramiento</label>
            <input 
              type="text" 
              required 
              value={tomaPosesionData.numeroNombramiento} 
              onChange={e => setTomaPosesionData({...tomaPosesionData, numeroNombramiento: e.target.value})} 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setIsTomaPosesionModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" style={{ background: '#22c55e' }}>Procesar Separación</button>
          </div>
        </form>
      </Modal>
      {menuOpenId && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }} 
            onClick={() => setMenuOpenId(null)} 
          />
          <div style={{
            position: 'fixed', top: menuPos.top, right: menuPos.right, background: 'white',
            border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            zIndex: 9999, minWidth: '180px', padding: '4px', display: 'flex', flexDirection: 'column'
          }}>
            {(() => {
              const row = separaciones.find(d => d.SeparacionID === menuOpenId);
              if (!row) return null;

              const canAprobar = !row.Aprobado && !row.Procesado;
              const canDesaprobar = row.Aprobado && !row.Anulado && !row.Procesado;
              const canAnular = row.Aprobado && !row.Procesado;
              const canProcesar = row.Aprobado && !row.Procesado;

              const btnStyle = (enabled) => ({
                padding: '8px 12px', textAlign: 'left', background: 'transparent', 
                border: 'none', cursor: enabled ? 'pointer' : 'not-allowed', 
                color: enabled ? '#1e293b' : '#94a3b8', width: '100%', 
                borderRadius: '4px', fontSize: '13px'
              });

              return (
                <>
                  <button style={btnStyle(canAprobar)} disabled={!canAprobar} onClick={() => { setMenuOpenId(null); handleAction('aprobar', row.SeparacionID); }}>
                    Aprobar
                  </button>
                  <button style={btnStyle(canDesaprobar)} disabled={!canDesaprobar} onClick={() => { setMenuOpenId(null); handleAction('desaprobar', row.SeparacionID); }}>
                    Desaprobar
                  </button>
                  <button style={btnStyle(canProcesar)} disabled={!canProcesar} onClick={() => { setMenuOpenId(null); handleAction('toma_posesion', row.SeparacionID); }}>
                    Toma de Posesión
                  </button>
                  <button style={btnStyle(canAnular)} disabled={!canAnular} onClick={() => { setMenuOpenId(null); handleAction('anular', row.SeparacionID); }}>
                    Anular Acción
                  </button>
                  
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                  
                  <button style={btnStyle(true)} onClick={() => { setMenuOpenId(null); handleAction('imprimir_accion', row.SeparacionID); }}>
                    Imprimir Acción
                  </button>
                  <button style={btnStyle(true)} onClick={() => { setMenuOpenId(null); handleAction('imprimir_carta', row.SeparacionID); }}>
                    Imprimir Carta
                  </button>
                </>
              )
            })()}
          </div>
        </>
      )}
    </>
  );
};

export default Separaciones;
