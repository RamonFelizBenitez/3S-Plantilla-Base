import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Cambios = () => {
  const empresaId = '1';
  const [cambios, setCambios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [tiposAcciones, setTiposAcciones] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [cargosNuevos, setCargosNuevos] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [dependencias, setDependencias] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [formData, setFormData] = useState({
    EmpleadoID: '',
    TipoAccionID: '',
    SueldoAct: '',
    CargoIDAct: '',
    DireccionIDAct: '',
    DependenciaIDAct: '',
    Sueldo: '',
    CargoID: '',
    DireccionID: '',
    DependenciaID: '',
    Observacion: '',
    FechaNombramiento: new Date().toISOString().slice(0, 16),
    Aprobado: false,
    Procesado: false,
    Anulado: false,
    NumeroNombramiento: '',
    FechaRegistro: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.DependenciaID) {
      axios.get(`/api/configuracion/dependencias/${formData.DependenciaID}/cargos?empresaId=${empresaId}`)
        .then(res => {
          setCargosNuevos(Array.isArray(res.data) ? res.data : []);
          // Only clear CargoID if it's not valid, unless we are initializing
          if (formData.CargoID && !res.data.find(c => c.CargoID == formData.CargoID)) {
            setFormData(prev => ({...prev, CargoID: ''}));
          }
        })
        .catch(err => console.error(err));
    } else {
      setCargosNuevos([]);
      setFormData(prev => ({...prev, CargoID: ''}));
    }
  }, [formData.DependenciaID, empresaId]);

  const fetchData = async () => {
    try {
      const resCambios = await axios.get(`/api/cambios?empresaId=${empresaId}`);
      setCambios(resCambios.data);

      const resEmp = await axios.get(`/api/empleados?empresaId=${empresaId}`);
      setEmpleados(resEmp.data);

      const resTa = await axios.get(`/api/configuracion/tipos-acciones?empresaId=${empresaId}`);
      setTiposAcciones(resTa.data.filter(t => t.TipoAccionID >= 20 && t.TipoAccionID <= 29));

      const resCar = await axios.get(`/api/cargos?empresaId=${empresaId}`);
      setCargos(resCar.data);

      const resDir = await axios.get(`/api/configuracion/direcciones?empresaId=${empresaId}`);
      setDirecciones(resDir.data);
      
      const resDep = await axios.get(`/api/configuracion/dependencias?empresaId=${empresaId}`);
      setDependencias(resDep.data);

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
        SueldoAct: sueldoActual,
        CargoIDAct: empleado.CargoId || '',
        DireccionIDAct: empleado.DireccionID || '',
        DependenciaIDAct: empleado.DependenciaID || '',
        Sueldo: '',
        CargoID: '',
        DireccionID: '',
        DependenciaID: ''
      });
    } else {
      setFormData({ ...formData, EmpleadoID: empID });
    }
  };

  const handleDireccionChange = async (e) => {
    const dirId = e.target.value;
    setFormData({ ...formData, DireccionID: dirId, DependenciaID: '' });
    if (dirId) {
      try {
        const res = await axios.get(`/api/configuracion/direcciones/${dirId}/dependencias?empresaId=${empresaId}`);
        setDependencias(res.data);
      } catch(err) { console.error(err); }
    } else {
      setDependencias([]);
    }
  };

  const openEdit = (cambio) => {
    setFormData({
      EmpleadoID: cambio.EmpleadoID,
      TipoAccionID: cambio.TipoAccionID,
      SueldoAct: cambio.SueldoAct,
      CargoIDAct: cambio.CargoIDAct,
      DireccionIDAct: cambio.DireccionIDAct,
      DependenciaIDAct: cambio.DependenciaIDAct,
      Sueldo: cambio.Sueldo,
      CargoID: cambio.CargoID,
      DireccionID: cambio.DireccionID,
      DependenciaID: cambio.DependenciaID,
      Observacion: cambio.Observacion,
      FechaNombramiento: cambio.FechaNombramiento ? cambio.FechaNombramiento.split('T')[0] : '',
      Aprobado: cambio.Aprobado,
      Procesado: cambio.Procesado,
      Anulado: cambio.Anulado,
      NumeroNombramiento: cambio.NumeroNombramiento,
      FechaRegistro: cambio.FechaRegistro ? cambio.FechaRegistro.split('T')[0] : ''
    });
    setCurrentId(cambio.CambiosID);
    setEditMode(true);
    setShowModal(true);
  };

  const openNew = () => {
    setFormData({
      EmpleadoID: '', TipoAccionID: '', SueldoAct: '', CargoIDAct: '', DireccionIDAct: '', DependenciaIDAct: '',
      Sueldo: '', CargoID: '', DireccionID: '', DependenciaID: '', Observacion: '', FechaNombramiento: '',
      Aprobado: false, Procesado: false, Anulado: false, NumeroNombramiento: '', FechaRegistro: ''
    });
    setEditMode(false);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, EmpresaId: empresaId };
      if (editMode) {
        await axios.put(`/api/cambios/${currentId}`, payload);
        Swal.fire('Éxito', 'Cambio actualizado correctamente', 'success');
      } else {
        await axios.post('/api/cambios', payload);
        Swal.fire('Éxito', 'Cambio registrado correctamente', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleAprobar = async (id) => {
    const result = await Swal.fire({
      title: '¿Deseas ejecutar esta operación?',
      text: `Se aprobará el Cambio #${id}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });
    if (result.isConfirmed) {
      try {
        await axios.put(`/api/cambios/${id}/aprobar`);
        Swal.fire('Éxito', 'Aprobado', 'success');
        fetchData();
      } catch (err) { Swal.fire('Error', err.response?.data?.message, 'error'); }
    }
  };

  const handleProcesar = async (id) => {
    const { value: formValues } = await Swal.fire({
      title: 'Toma de Posesión',
      html:
        '<div style="text-align: left; margin-top: 10px;">' +
        '<label style="font-weight: bold; font-size: 14px;">Fecha de Aplicación</label>' +
        '<input type="date" id="swal-fecha" class="swal2-input" style="width: 80%;">' +
        '<label style="font-weight: bold; font-size: 14px; margin-top: 15px; display: block;">Número de Nombramiento</label>' +
        '<input type="text" id="swal-nombramiento" class="swal2-input" style="width: 80%;">' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Procesar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      preConfirm: () => {
        const fecha = document.getElementById('swal-fecha').value;
        const nombramiento = document.getElementById('swal-nombramiento').value;
        if (!fecha || !nombramiento) {
          Swal.showValidationMessage('Por favor complete ambos campos');
          return false;
        }
        return { FechaAplicacion: fecha, NumeroNombramiento: nombramiento };
      }
    });

    if (formValues) {
      try {
        await axios.put(`/api/cambios/${id}/procesar`, { 
          EmpresaID: empresaId, 
          CreadoPor: '1',
          FechaAplicacion: formValues.FechaAplicacion,
          NumeroNombramiento: formValues.NumeroNombramiento
        });
        Swal.fire('Éxito', 'Procesado correctamente', 'success');
        fetchData();
      } catch (err) { 
        Swal.fire('Error', err.response?.data?.message || err.message, 'error'); 
      }
    }
  };

  const handleDesaprobar = async (id) => {
    const result = await Swal.fire({ title: '¿Desaprobar?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await axios.put(`/api/cambios/${id}/desaprobar`);
        Swal.fire('Éxito', 'Desaprobado', 'success');
        fetchData();
      } catch (err) { Swal.fire('Error', err.response?.data?.message || err.message, 'error'); }
    }
  };

  const handleAnular = async (id) => {
    const result = await Swal.fire({ title: '¿Anular Acción?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33' });
    if (result.isConfirmed) {
      try {
        await axios.put(`/api/cambios/${id}/anular`);
        Swal.fire('Éxito', 'Acción anulada', 'success');
        fetchData();
      } catch (err) { Swal.fire('Error', err.response?.data?.message || err.message, 'error'); }
    }
  };

  const handlePrint = (tipo, id) => {
    if (tipo === 'acción') {
      Swal.fire({
        title: 'Firmas a Imprimir',
        html: `
          <div style="text-align: left; padding: 10px 20px;">
            <label style="display:block; margin-bottom: 10px; cursor: pointer;">
              <input type="checkbox" id="chkFirma1" checked style="margin-right: 8px;"> Firma 1
            </label>
            <label style="display:block; margin-bottom: 10px; cursor: pointer;">
              <input type="checkbox" id="chkFirma2" checked style="margin-right: 8px;"> Firma 2
            </label>
            <label style="display:block; margin-bottom: 10px; cursor: pointer;">
              <input type="checkbox" id="chkFirma3" checked style="margin-right: 8px;"> Firma 3
            </label>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Imprimir',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const f1 = document.getElementById('chkFirma1').checked;
          const f2 = document.getElementById('chkFirma2').checked;
          const f3 = document.getElementById('chkFirma3').checked;
          if (!f1 && !f2 && !f3) {
            Swal.showValidationMessage('Debe seleccionar al menos una firma obligatoriamente');
            return false;
          }
          return { f1, f2, f3 };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const { f1, f2, f3 } = result.value;
          window.open(`/imprimir/cambio/${id}?f1=${f1}&f2=${f2}&f3=${f3}`, '_blank');
        }
      });
    } else {
      Swal.fire('Información', `Impresión de ${tipo} en desarrollo...`, 'info');
    }
  };

  // Cierra el menú si el usuario hace clic en otro lado
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Gestión de Cambios de Personal</h2>
          <button onClick={openNew} style={{ padding: '10px 15px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Nuevo Cambio</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>ID</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Empleado</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Acción</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Fecha</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Estado</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cambios.map(c => (
              <tr key={c.CambiosID} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px' }}>{c.CambiosID}</td>
                <td style={{ padding: '10px' }}>{c.EmpleadoID} - {c.Nombres} {c.Apellido1}</td>
                <td style={{ padding: '10px' }}>{c.TipoAccionDesc}</td>
                <td style={{ padding: '10px' }}>{new Date(c.FechaRegistro).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>
                  {c.Procesado ? <span style={{ color: 'green', fontWeight: 'bold' }}>Procesado</span> : 
                   c.Aprobado ? <span style={{ color: 'blue', fontWeight: 'bold' }}>Aprobado</span> : 
                   <span style={{ color: 'gray' }}>Registrado</span>}
                </td>
                <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                  <button onClick={() => openEdit(c)} style={{ padding: '4px 8px', cursor: 'pointer', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    {c.Aprobado ? 'Consultar' : 'Editar'}
                  </button>
                  
                  <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === c.CambiosID ? null : c.CambiosID)} 
                      style={{ padding: '4px 8px', cursor: 'pointer', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Opciones <span style={{ fontSize: '14px', lineHeight: '1' }}>&#8942;</span>
                    </button>
                    
                    {openMenuId === c.CambiosID && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '5px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '160px', overflow: 'hidden' }}>
                        
                        {/* Aprobar: ON si no está aprobado ni procesado */}
                        <div onClick={!c.Aprobado && !c.Procesado ? () => { handleAprobar(c.CambiosID); setOpenMenuId(null); } : undefined} 
                             style={{ padding: '8px 12px', cursor: !c.Aprobado && !c.Procesado ? 'pointer' : 'not-allowed', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: !c.Aprobado && !c.Procesado ? '#000' : '#cbd5e1' }} 
                             onMouseEnter={e => !c.Aprobado && !c.Procesado && (e.target.style.background = '#f8fafc')} 
                             onMouseLeave={e => !c.Aprobado && !c.Procesado && (e.target.style.background = 'transparent')}>
                          Aprobar
                        </div>
                        
                        {/* Desaprobar: ON si está aprobado y no procesado */}
                        <div onClick={c.Aprobado && !c.Procesado ? () => { handleDesaprobar(c.CambiosID); setOpenMenuId(null); } : undefined} 
                             style={{ padding: '8px 12px', cursor: c.Aprobado && !c.Procesado ? 'pointer' : 'not-allowed', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: c.Aprobado && !c.Procesado ? '#ef4444' : '#cbd5e1' }} 
                             onMouseEnter={e => c.Aprobado && !c.Procesado && (e.target.style.background = '#fef2f2')} 
                             onMouseLeave={e => c.Aprobado && !c.Procesado && (e.target.style.background = 'transparent')}>
                          Desaprobar
                        </div>
                        
                        {/* Toma de Posesión: ON si está aprobado y no procesado */}
                        <div onClick={c.Aprobado && !c.Procesado ? () => { handleProcesar(c.CambiosID); setOpenMenuId(null); } : undefined} 
                             style={{ padding: '8px 12px', cursor: c.Aprobado && !c.Procesado ? 'pointer' : 'not-allowed', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: c.Aprobado && !c.Procesado ? '#10b981' : '#cbd5e1', fontWeight: c.Aprobado && !c.Procesado ? 'bold' : 'normal' }} 
                             onMouseEnter={e => c.Aprobado && !c.Procesado && (e.target.style.background = '#ecfdf5')} 
                             onMouseLeave={e => c.Aprobado && !c.Procesado && (e.target.style.background = 'transparent')}>
                          Toma de Posesión
                        </div>
                        
                        {/* Anular Acción: ON si está aprobado y no procesado */}
                        <div onClick={c.Aprobado && !c.Procesado && !c.Anulado ? () => { handleAnular(c.CambiosID); setOpenMenuId(null); } : undefined} 
                             style={{ padding: '8px 12px', cursor: c.Aprobado && !c.Procesado && !c.Anulado ? 'pointer' : 'not-allowed', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: c.Aprobado && !c.Procesado && !c.Anulado ? '#f97316' : '#cbd5e1' }} 
                             onMouseEnter={e => c.Aprobado && !c.Procesado && !c.Anulado && (e.target.style.background = '#fff7ed')} 
                             onMouseLeave={e => c.Aprobado && !c.Procesado && !c.Anulado && (e.target.style.background = 'transparent')}>
                          Anular Accion
                        </div>
                        
                        {/* Imprimir Acción: Siempre ON */}
                        <div onClick={() => { handlePrint('acción', c.CambiosID); setOpenMenuId(null); }} 
                             style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#000' }} 
                             onMouseEnter={e => e.target.style.background = '#f8fafc'} 
                             onMouseLeave={e => e.target.style.background = 'transparent'}>
                          Imprimir Accion
                        </div>
                        
                        {/* Imprimir Carta: Siempre ON */}
                        <div onClick={() => { handlePrint('carta', c.CambiosID); setOpenMenuId(null); }} 
                             style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: '#000' }} 
                             onMouseEnter={e => e.target.style.background = '#f8fafc'} 
                             onMouseLeave={e => e.target.style.background = 'transparent'}>
                          Imprimir Carta
                        </div>

                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {cambios.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No hay registros</td></tr>}
          </tbody>
        </table>

        {/* Modal Formulario Original */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '1100px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0 }}>{editMode ? 'Editar Cambio' : 'Registrar Nuevo Cambio'}</h3>
              
              <form onSubmit={handleSave}>
                {/* SECCIÓN SUPERIOR: Datos Generales */}
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Empleado</label>
                      <select required disabled={editMode} value={formData.EmpleadoID} onChange={handleEmpleadoChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">Seleccione Empleado...</option>
                        {empleados.map(e => <option key={e.EmpleadoID} value={e.EmpleadoID}>{e.EmpleadoID} - {e.Nombres} {e.Apellido1}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Tipo de Acción</label>
                      <select required value={formData.TipoAccionID} onChange={e => setFormData({...formData, TipoAccionID: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">Seleccione...</option>
                        {tiposAcciones.map(t => <option key={t.TipoAccionID} value={t.TipoAccionID}>{t.Descripcion}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN INFERIOR: 3 Columnas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'start' }}>
                  
                  {/* COLUMNA 1: Datos Actuales (Solo Lectura) */}
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Datos Actuales</h4>
                    
                    <label style={{ fontSize: '12px', display: 'block', marginTop: '10px' }}>Dirección Actual</label>
                    <select disabled value={formData.DireccionIDAct} style={{ width: '100%', padding: '6px', fontSize: '13px', background: '#e2e8f0', border: 'none' }}>
                      <option value="">-</option>
                      {direcciones.map(d => <option key={d.DireccionID} value={d.DireccionID}>{d.Descripcion}</option>)}
                    </select>

                    <label style={{ fontSize: '12px', display: 'block', marginTop: '10px' }}>Dependencia Actual</label>
                    <select disabled value={formData.DependenciaIDAct} style={{ width: '100%', padding: '6px', fontSize: '13px', background: '#e2e8f0', border: 'none' }}>
                      <option value="">-</option>
                      {dependencias.map(d => <option key={d.DependenciaID} value={d.DependenciaID}>{d.Descripcion}</option>)}
                    </select>

                    <label style={{ fontSize: '12px', display: 'block', marginTop: '10px' }}>Cargo Actual</label>
                    <select disabled value={formData.CargoIDAct} style={{ width: '100%', padding: '6px', fontSize: '13px', background: '#e2e8f0', border: 'none' }}>
                      <option value="">-</option>
                      {cargos.map(c => <option key={c.CargoID} value={c.CargoID}>{c.Descripcion}</option>)}
                    </select>

                    <label style={{ fontSize: '12px', display: 'block', marginTop: '10px' }}>Sueldo Actual</label>
                    <input type="number" readOnly value={formData.SueldoAct} style={{ width: '100%', padding: '6px', fontSize: '13px', background: '#e2e8f0', border: 'none' }} />
                  </div>

                  {/* COLUMNA 2: Datos Nuevos */}
                  <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>Nuevos Datos</h4>
                    
                    <label style={{ fontSize: '12px', display: 'block', marginTop: '10px' }}>Nueva Dirección</label>
                    <select value={formData.DireccionID} onChange={handleDireccionChange} style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ccc' }}>
                      <option value="">-</option>
                      {direcciones.map(d => <option key={d.DireccionID} value={d.DireccionID}>{d.Descripcion}</option>)}
                    </select>

                    <label style={{ fontSize: '12px', display: 'block', marginTop: '10px' }}>Nueva Dependencia</label>
                    <select value={formData.DependenciaID} onChange={e => setFormData({...formData, DependenciaID: e.target.value})} style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ccc' }}>
                      <option value="">-</option>
                      {dependencias.map(d => <option key={d.DependenciaID} value={d.DependenciaID}>{d.Descripcion}</option>)}
                    </select>

                    <label style={{ fontSize: '12px', display: 'block', marginTop: '10px' }}>Nuevo Cargo Permitido</label>
                    <select value={formData.CargoID} onChange={e => setFormData({...formData, CargoID: e.target.value})} style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ccc' }} disabled={!formData.DependenciaID}>
                      <option value="">-</option>
                      {cargosNuevos.map(c => <option key={c.CargoID} value={c.CargoID}>{c.CargoDescripcion || c.Descripcion}</option>)}
                    </select>

                    <label style={{ fontSize: '12px', display: 'block', marginTop: '10px' }}>Nuevo Sueldo</label>
                    <input type="number" step="0.01" value={formData.Sueldo} onChange={e => setFormData({...formData, Sueldo: e.target.value})} style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #ccc' }} />
                  </div>

                  {/* COLUMNA 3: Estado y Control */}
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: 'none' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px' }}>Estado y Control (Sólo Lectura)</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {/* Fila 1 */}
                      <div>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>ID Empleado</label>
                        <input type="text" readOnly value={formData.EmpleadoID} style={{ width: '100%', padding: '8px', fontSize: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}># Nombramiento</label>
                        <input type="text" readOnly value={formData.NumeroNombramiento || ''} style={{ width: '100%', padding: '8px', fontSize: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569' }} />
                      </div>

                      {/* Fila 2 */}
                      <div>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Aprobado</label>
                        <input type="text" readOnly value={formData.Aprobado ? 'SÍ' : 'NO'} style={{ width: '100%', padding: '8px', fontSize: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Fecha Aprobado <span style={{color: '#ef4444'}}>*</span></label>
                        <input type="text" readOnly value={formData.FechaRegistro || ''} style={{ width: '100%', padding: '8px', fontSize: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569' }} />
                      </div>

                      {/* Fila 3 */}
                      <div>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Procesado</label>
                        <input type="text" readOnly value={formData.Procesado ? 'SÍ' : 'NO'} style={{ width: '100%', padding: '8px', fontSize: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Fecha Nombramiento <span style={{color: '#ef4444'}}>*</span></label>
                        <input type="text" readOnly value={formData.FechaNombramiento || ''} style={{ width: '100%', padding: '8px', fontSize: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569' }} />
                      </div>
                    </div>
                  </div>

                </div>
                
                {/* SECCIÓN INFERIOR: Observación y Anulado */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Observación</label>
                    <textarea rows="2" value={formData.Observacion} onChange={e => setFormData({...formData, Observacion: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}></textarea>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#475569' }}>Anulado</label>
                    <input type="text" readOnly value={formData.Anulado ? 'SÍ' : 'NO'} style={{ width: '100%', padding: '8px', fontSize: '14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#475569' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

export default Cambios;