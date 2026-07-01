import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Vacaciones = () => {
  const [vacaciones, setVacaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [tiposAcciones, setTiposAcciones] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms
  const [showModal, setShowModal] = useState(false);
  const [isTomaPosesionModalOpen, setIsTomaPosesionModalOpen] = useState(false);
  const [tomaPosesionData, setTomaPosesionData] = useState({ fechaSalida: '', numeroNombramiento: '' });
  
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printId, setPrintId] = useState(null);
  const [printType, setPrintType] = useState(null);
  const [printFirmas, setPrintFirmas] = useState({ f1: true, f2: true, f3: true });

  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const initialForm = {
    VacacionID: '',
    EmpleadoID: '',
    TipoAccionID: '',
    FechaInicio: '',
    FechaFin: '',
    Observacion: '',
    // Readonly fields
    Cedula: '',
    DependenciaDesc: '',
    Salario: '',
    CargoDesc: '',
    Aprobado: false,
    FechaAprobado: null,
    Procesado: false,
    FechaNombramiento: null,
    Anulado: false,
    NumeroNombramiento: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resVacaciones, resEmpleados, resTipos, resClasificaciones] = await Promise.all([
        axios.get('/api/vacaciones?empresaId=1'),
        axios.get('/api/empleados?empresaId=1'),
        axios.get('/api/configuracion/tipos-acciones?empresaId=1'),
        axios.get('/api/configuracion/clasificaciones?empresaId=1')
      ]);
      setVacaciones(resVacaciones.data);
      setEmpleados(resEmpleados.data);
      setTiposAcciones(resTipos.data);
      setClasificaciones(resClasificaciones.data);
    } catch (err) {
      Swal.fire('Error', 'Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDateStr = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toISOString().split('T')[0];
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('es-DO');
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if (name === 'EmpleadoID') {
      const emp = empleados.find(x => x.EmpleadoID === value);
      let sueldoActual = 0;
      
      if (emp) {
        try {
          const resSalario = await axios.get(`/api/empleados/${value}/salario?empresaId=1`);
          if (resSalario.data && resSalario.data.length > 0) {
            const salarioActivo = resSalario.data.find(s => s.SueldoActivo === true || s.SueldoActivo === 1);
            sueldoActual = salarioActivo ? salarioActivo.Valor : resSalario.data[0].Valor;
          }
        } catch (err) {
          console.error('Error fetching salario:', err);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        EmpleadoID: value,
        Cedula: emp ? emp.Cedula : '',
        DependenciaDesc: emp ? emp.DependenciaDesc : '',
        Salario: sueldoActual,
        CargoDesc: emp ? emp.CargoDesc : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.EmpleadoID || !formData.TipoAccionID || !formData.FechaInicio || !formData.FechaFin) {
      Swal.fire('Atención', 'Complete los campos obligatorios', 'warning');
      return;
    }

    try {
      if (formData.VacacionID) {
        await axios.put(`/api/vacaciones/${formData.VacacionID}?empresaId=1`, formData);
        Swal.fire('Éxito', 'Registro actualizado', 'success');
      } else {
        await axios.post('/api/vacaciones?empresaId=1', formData);
        Swal.fire('Éxito', 'Registro creado', 'success');
      }
      fetchData();
      setShowModal(false);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error al guardar', 'error');
    }
  };

  const handleActionClick = (e, row) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + window.scrollY, right: window.innerWidth - rect.right });
    setMenuOpenId(row.VacacionID === menuOpenId ? null : row.VacacionID);
  };

  const handleAction = async (action, id) => {
    try {
      if (action === 'aprobar' || action === 'desaprobar') {
        const confirmText = action === 'aprobar' ? 'Se aprobará la Amonestación' : 'Se desaprobará la Amonestación';
        const result = await Swal.fire({
          title: '¿Deseas ejecutar esta operación?',
          text: `${confirmText} #${id}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          await axios.put(`/api/vacaciones/${id}/status?empresaId=1`, { action });
          Swal.fire('Éxito', 'Estado actualizado', 'success');
          fetchData();
        }
      } else if (action === 'toma_posesion') {
        setIsTomaPosesionModalOpen(true);
        setTomaPosesionData({ id, fechaSalida: '', numeroNombramiento: '' });
      } else if (action === 'anular') {
        Swal.fire('Info', 'Acción de Anular en desarrollo...', 'info');
      } else if (action === 'imprimir_accion' || action === 'imprimir_carta') {
        setPrintType(action);
        setPrintId(id);
        setIsPrintModalOpen(true);
      } else {}
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error procesando acción', 'error');
    }
  };

  const handleTomaPosesionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/vacaciones/${tomaPosesionData.id}/toma-posesion?empresaId=1`, tomaPosesionData);
      Swal.fire('Éxito', 'Procesado correctamente', 'success');
      setIsTomaPosesionModalOpen(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleEdit = async (row) => {
    let sueldoActual = 0;
    try {
      const resSalario = await axios.get(`/api/empleados/${row.EmpleadoID}/salario?empresaId=1`);
      if (resSalario.data && resSalario.data.length > 0) {
        const salarioActivo = resSalario.data.find(s => s.SueldoActivo === true || s.SueldoActivo === 1);
        sueldoActual = salarioActivo ? salarioActivo.Valor : resSalario.data[0].Valor;
      }
    } catch (err) {
      console.error('Error fetching salario:', err);
    }

    setFormData({
      VacacionID: row.VacacionID,
      EmpleadoID: row.EmpleadoID,
      TipoAccionID: row.TipoAccionID,
      FechaInicio: formatDateStr(row.FechaInicio),
      FechaFin: formatDateStr(row.FechaFin),
      Observacion: row.Observacion || '',
      Cedula: row.EmpleadoCedula || '',
      DependenciaDesc: row.DependenciaDesc || '',
      Salario: sueldoActual,
      CargoDesc: row.CargoDesc || '',
      Aprobado: row.Aprobado,
      FechaAprobado: row.FechaAprobado,
      Procesado: row.Procesado,
      FechaNombramiento: row.FechaNombramiento,
      Anulado: row.Anulado,
      NumeroNombramiento: row.NumeroNombramiento || ''
    });
    setShowModal(true);
  };

  const clasificacionesFiltradas = clasificaciones.filter(c => c.Grado === formData.Grado && c.Estatus === 1);

  const columns = [
    { accessor: 'VacacionID', header: 'ID' },
    { accessor: 'EmpleadoNombre', header: 'Empleado' },
    { accessor: 'TipoAccionDesc', header: 'Tipo Acción' },
    { accessor: 'FechaInicio', header: 'Desde', render: row => formatDateStr(row.FechaInicio) },
    { accessor: 'FechaFin', header: 'Hasta', render: row => formatDateStr(row.FechaFin) },
    { accessor: 'Aprobado', header: 'Aprobado', render: row => row.Aprobado ? 'SÍ' : 'NO' },
    { accessor: 'Procesado', header: 'Procesado', render: row => row.Procesado ? 'SÍ' : 'NO' }
  ];

  return (
    <>
      <DataTable 
        title="Vacaciones" 
        columns={columns} 
        data={vacaciones} 
        loading={loading}
        addButtonLabel="Nuevo Registro"
        onAdd={() => { setFormData(initialForm); setShowModal(true); }} 
        renderActions={(row) => {
          const isMenuOpen = menuOpenId === row.VacacionID;
          return (
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                onClick={() => handleEdit(row)} 
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
                    setMenuOpenId(row.VacacionID);
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
        title={formData.VacacionID ? "Editar Vacación" : "Nueva Vacación"} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        hideFooter={true}
        size="xl"
      >
                <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
            {/* Columna Izquierda - Formulario Principal */}
            <div>
              <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '14px' }}>Selección de Empleado</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Tipo de Acción *</label>
                    <select name="TipoAccionID" value={formData.TipoAccionID} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Seleccione tipo...</option>
                      {tiposAcciones.filter(t => t.TipoAccionID >= 50 && t.TipoAccionID <= 70).map(t => <option key={t.TipoAccionID} value={t.TipoAccionID}>{t.TipoAccionID} - {t.Descripcion}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Empleado *</label>
                    <select name="EmpleadoID" value={formData.EmpleadoID} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Seleccione un empleado...</option>
                      {empleados.filter(e => e.Estatus === 0).map(e => <option key={e.EmpleadoID} value={e.EmpleadoID}>{e.Cedula} - {e.Nombres} {e.Apellido1} {e.Apellido2 || ''}</option>)}
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
                    <input type="text" value={formData.Salario ? `$${parseFloat(formData.Salario).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '0.00'} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '14px' }}>Datos de Vacación</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Fecha Inicio *</label>
                    <input type="date" name="FechaInicio" value={formData.FechaInicio} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', height: '45px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Fecha Fin *</label>
                    <input type="date" name="FechaFin" value={formData.FechaFin} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', height: '45px' }} />
                  </div>
                </div>
                
                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Observaciones</label>
                  <textarea name="Observacion" value={formData.Observacion} onChange={handleChange} disabled={formData.Aprobado} placeholder="Indique el motivo o notas adicionales..." style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', height: '45px', resize: 'vertical' }}></textarea>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Estado y Control */}
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                {!formData.Aprobado && (
                  <button type="submit" className="btn-primary">Guardar Registro</button>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>


      <Modal
        title="Procesar Vacación"
        isOpen={isTomaPosesionModalOpen}
        onClose={() => setIsTomaPosesionModalOpen(false)}
        hideFooter={true}
      >
        <form onSubmit={handleTomaPosesionSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Fecha Efectiva</label>
            <input 
              type="date" 
              required 
              value={tomaPosesionData.fechaSalida} 
              onChange={e => setTomaPosesionData({...tomaPosesionData, fechaSalida: e.target.value})} 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Número / Ref</label>
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
            <button type="submit" className="btn-primary" style={{ background: '#22c55e' }}>Procesar</button>
          </div>
        </form>
      </Modal>

      {/* Modal Opciones de Impresión */}
      <Modal 
        title="Opciones de Impresión" 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)}
        onSubmit={(e) => {
          e.preventDefault();
          const { f1, f2, f3 } = printFirmas;
          const url = printType === 'imprimir_accion' 
            ? `/imprimir/vacacion/${printId}?f1=${f1}&f2=${f2}&f3=${f3}`
            : `/imprimir/carta_vacacion/${printId}?f1=${f1}&f2=${f2}&f3=${f3}`;
          window.open(url, '_blank');
          setIsPrintModalOpen(false);
        }}
        submitLabel="Imprimir"
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ marginBottom: '15px', color: '#475569', fontSize: '14px' }}>Seleccione las firmas que desea incluir en el documento:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={printFirmas.f1} onChange={(e) => setPrintFirmas({...printFirmas, f1: e.target.checked})} style={{ width: '18px', height: '18px' }} />
              <span>Firma 1 (Elaborado por)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={printFirmas.f2} onChange={(e) => setPrintFirmas({...printFirmas, f2: e.target.checked})} style={{ width: '18px', height: '18px' }} />
              <span>Firma 2 (Revisado por)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={printFirmas.f3} onChange={(e) => setPrintFirmas({...printFirmas, f3: e.target.checked})} style={{ width: '18px', height: '18px' }} />
              <span>Firma 3 (Aprobado por)</span>
            </label>
          </div>
        </div>
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
              const row = vacaciones.find(d => d.VacacionID === menuOpenId);
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
                  <button style={btnStyle(canAprobar)} disabled={!canAprobar} onClick={() => { setMenuOpenId(null); handleAction('aprobar', row.VacacionID); }}>
                    Aprobar
                  </button>
                  <button style={btnStyle(canDesaprobar)} disabled={!canDesaprobar} onClick={() => { setMenuOpenId(null); handleAction('desaprobar', row.VacacionID); }}>
                    Desaprobar
                  </button>
                  {/* <button style={btnStyle(canProcesar)} disabled={!canProcesar} onClick={() => { setMenuOpenId(null); handleAction('toma_posesion', row.VacacionID); }}>
                    Toma de Posesión
                  </button>
                  <button style={btnStyle(canAnular)} disabled={!canAnular} onClick={() => { setMenuOpenId(null); handleAction('anular', row.VacacionID); }}>
                    Anular Acción
                  </button> */}
                  
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                  
                  <button style={btnStyle(true)} onClick={() => { setMenuOpenId(null); handleAction('imprimir_accion', row.VacacionID); }}>
                    Imprimir Acción
                  </button>
                  <button style={btnStyle(true)} onClick={() => { setMenuOpenId(null); handleAction('imprimir_carta', row.VacacionID); }}>
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

export default Vacaciones;
