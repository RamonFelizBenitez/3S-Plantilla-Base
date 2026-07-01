const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Amonestaciones = () => {
  const [amonestaciones, setAmonestaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [tiposAcciones, setTiposAcciones] = useState([]);
  const [clasificaciones, setClasificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms
  const [showModal, setShowModal] = useState(false);
  const [isTomaPosesionModalOpen, setIsTomaPosesionModalOpen] = useState(false);
  const [tomaPosesionData, setTomaPosesionData] = useState({ fechaSalida: '', numeroNombramiento: '' });
  
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const initialForm = {
    AmonestacionID: '',
    EmpleadoID: '',
    TipoAccionID: '',
    Fecha: '',
    Documento: '',
    Observacion: '',
    Grado: '',
    ClasificacionID: '',
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
      const [resAmonestaciones, resEmpleados, resTipos, resClasificaciones] = await Promise.all([
        axios.get('/api/amonestaciones?empresaId=1'),
        axios.get('/api/empleados?empresaId=1'),
        axios.get('/api/configuracion/tipos-acciones?empresaId=1'),
        axios.get('/api/configuracion/clasificaciones?empresaId=1')
      ]);
      setAmonestaciones(resAmonestaciones.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'EmpleadoID') {
      const emp = empleados.find(x => x.EmpleadoID === value);
      setFormData(prev => ({
        ...prev,
        EmpleadoID: value,
        Cedula: emp ? emp.Cedula : '',
        DependenciaDesc: emp ? emp.DependenciaDesc : '',
        Salario: emp ? emp.SalarioActual : '',
        CargoDesc: emp ? emp.CargoDesc : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.EmpleadoID || !formData.TipoAccionID || !formData.Grado || !formData.ClasificacionID || !formData.Documento) {
      Swal.fire('Atención', 'Complete los campos obligatorios', 'warning');
      return;
    }

    try {
      if (formData.AmonestacionID) {
        await axios.put(\`/api/amonestaciones/\${formData.AmonestacionID}?empresaId=1\`, formData);
        Swal.fire('Éxito', 'Registro actualizado', 'success');
      } else {
        await axios.post('/api/amonestaciones?empresaId=1', formData);
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
    setMenuOpenId(row.AmonestacionID === menuOpenId ? null : row.AmonestacionID);
  };

  const handleAction = async (action, id) => {
    try {
      if (action === 'aprobar' || action === 'desaprobar') {
        const confirmText = action === 'aprobar' ? 'Se aprobará la Amonestación' : 'Se desaprobará la Amonestación';
        const result = await Swal.fire({
          title: '¿Deseas ejecutar esta operación?',
          text: \`\${confirmText} #\${id}\`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          await axios.put(\`/api/amonestaciones/\${id}/status?empresaId=1\`, { action });
          Swal.fire('Éxito', 'Estado actualizado', 'success');
          fetchData();
        }
      } else if (action === 'toma_posesion') {
        setIsTomaPosesionModalOpen(true);
        setTomaPosesionData({ id, fechaSalida: '', numeroNombramiento: '' });
      } else if (action === 'anular') {
        Swal.fire('Info', 'Acción de Anular en desarrollo...', 'info');
      } else if (action === 'imprimir_accion' || action === 'imprimir_carta') {
        Swal.fire('Info', 'Funcionalidad de impresión en desarrollo...', 'info');
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error procesando acción', 'error');
    }
  };

  const handleTomaPosesionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(\`/api/amonestaciones/\${tomaPosesionData.id}/toma-posesion?empresaId=1\`, tomaPosesionData);
      Swal.fire('Éxito', 'Procesado correctamente', 'success');
      setIsTomaPosesionModalOpen(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleEdit = (row) => {
    setFormData({
      AmonestacionID: row.AmonestacionID,
      EmpleadoID: row.EmpleadoID,
      TipoAccionID: row.TipoAccionID,
      Fecha: formatDateStr(row.Fecha),
      Documento: row.Documento || '',
      Observacion: row.Observacion || '',
      Grado: row.Grado || '',
      ClasificacionID: row.ClasificacionID || '',
      Cedula: row.EmpleadoCedula || '',
      DependenciaDesc: row.DependenciaDesc || '',
      Salario: '', // might need a specific fetch if not in the view
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
    { accessor: 'AmonestacionID', header: 'ID' },
    { accessor: 'EmpleadoNombre', header: 'Empleado' },
    { accessor: 'TipoAccionDesc', header: 'Tipo Acción' },
    { accessor: 'Fecha', header: 'Fecha', render: row => formatDateStr(row.Fecha) },
    { accessor: 'Aprobado', header: 'Aprobado', render: row => row.Aprobado ? 'SÍ' : 'NO' },
    { accessor: 'Procesado', header: 'Procesado', render: row => row.Procesado ? 'SÍ' : 'NO' }
  ];

  return (
    <>
      <DataTable 
        title="Amonestaciones" 
        columns={columns} 
        data={amonestaciones} 
        loading={loading}
        addButtonLabel="Nuevo Registro"
        onAdd={() => { setFormData(initialForm); setShowModal(true); }} 
        hideActions={true}
        renderCustomActions={(row) => (
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => handleEdit(row)}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', minWidth: '70px' }}
            >
              {row.Aprobado ? 'Consultar' : 'Editar'}
            </button>
            <button
              onClick={(e) => handleActionClick(e, row)}
              style={{ background: '#64748b', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              Opciones ⋮
            </button>
          </div>
        )}
      />

      <Modal 
        title={formData.AmonestacionID ? "Editar Amonestación" : "Nueva Amonestación"} 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        hideFooter={true}
        maxWidth="900px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: '2', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Fecha *</label>
                  <input type="date" name="Fecha" value={formData.Fecha} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Tipo de Acción *</label>
                  <select name="TipoAccionID" value={formData.TipoAccionID} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">Seleccione...</option>
                    {tiposAcciones.map(t => <option key={t.TipoAccionID} value={t.TipoAccionID}>{t.Descripcion}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Empleado *</label>
                <select name="EmpleadoID" value={formData.EmpleadoID} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="">Seleccione...</option>
                  {empleados.map(e => <option key={e.EmpleadoID} value={e.EmpleadoID}>{e.Nombres} {e.Apellido1} {e.Apellido2}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Grado *</label>
                  <select name="Grado" value={formData.Grado} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">Seleccionar...</option>
                    <option value="Primer Grado">Primer Grado</option>
                    <option value="Segundo Grado">Segundo Grado</option>
                    <option value="Tercer Grado">Tercer Grado</option>
                    <option value="Cuarto Grado">Cuarto Grado</option>
                    <option value="Quinto Grado">Quinto Grado</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Clasificación *</label>
                  <select name="ClasificacionID" value={formData.ClasificacionID} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">Seleccione...</option>
                    {clasificacionesFiltradas.map(c => <option key={c.ClasificacionID} value={c.ClasificacionID}>{c.Descripcion}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Documento *</label>
                <input type="text" name="Documento" value={formData.Documento} onChange={handleChange} required disabled={formData.Aprobado} placeholder="Documento soporte..." style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Observación</label>
                <textarea name="Observacion" value={formData.Observacion} onChange={handleChange} disabled={formData.Aprobado} placeholder="Indique el motivo o notas adicionales..." style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', height: '45px', resize: 'vertical' }}></textarea>
              </div>
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Datos del Empleado</h4>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Cédula</label>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>{formData.Cedula || '-'}</div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Dependencia</label>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>{formData.DependenciaDesc || '-'}</div>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Cargo</label>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>{formData.CargoDesc || '-'}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>Salario</label>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>{formData.Salario ? \`$\${parseFloat(formData.Salario).toLocaleString('en-US', { minimumFractionDigits: 2 })}\` : '-'}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Estado</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#475569' }}>Aprobado:</span>
                  <span style={{ fontWeight: 'bold', color: formData.Aprobado ? '#22c55e' : '#64748b' }}>{formData.Aprobado ? 'SÍ' : 'NO'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#475569' }}>Procesado:</span>
                  <span style={{ fontWeight: 'bold', color: formData.Procesado ? '#22c55e' : '#64748b' }}>{formData.Procesado ? 'SÍ' : 'NO'}</span>
                </div>
                {formData.Procesado && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#475569' }}>Fecha Proc:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{formatDateStr(formData.FechaNombramiento)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            {!formData.Aprobado && (
              <button type="submit" className="btn-primary">Guardar Registro</button>
            )}
          </div>
        </form>
      </Modal>

      <Modal
        title="Procesar Amonestación"
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
              const row = amonestaciones.find(d => d.AmonestacionID === menuOpenId);
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
                  <button style={btnStyle(canAprobar)} disabled={!canAprobar} onClick={() => { setMenuOpenId(null); handleAction('aprobar', row.AmonestacionID); }}>
                    Aprobar
                  </button>
                  <button style={btnStyle(canDesaprobar)} disabled={!canDesaprobar} onClick={() => { setMenuOpenId(null); handleAction('desaprobar', row.AmonestacionID); }}>
                    Desaprobar
                  </button>
                  <button style={btnStyle(canProcesar)} disabled={!canProcesar} onClick={() => { setMenuOpenId(null); handleAction('toma_posesion', row.AmonestacionID); }}>
                    Toma de Posesión
                  </button>
                  <button style={btnStyle(canAnular)} disabled={!canAnular} onClick={() => { setMenuOpenId(null); handleAction('anular', row.AmonestacionID); }}>
                    Anular Acción
                  </button>
                  
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                  
                  <button style={btnStyle(true)} onClick={() => { setMenuOpenId(null); handleAction('imprimir_accion', row.AmonestacionID); }}>
                    Imprimir Acción
                  </button>
                  <button style={btnStyle(true)} onClick={() => { setMenuOpenId(null); handleAction('imprimir_carta', row.AmonestacionID); }}>
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

export default Amonestaciones;
`;

fs.writeFileSync('c:/Users/Administrator/Desktop/Sistema de Gestion/frontend/src/pages/recursos_humanos/Amonestaciones.jsx', content);
