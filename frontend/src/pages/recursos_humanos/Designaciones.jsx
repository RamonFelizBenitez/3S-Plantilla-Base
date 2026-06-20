import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';
import axios from 'axios';
import { MoreVertical } from 'lucide-react';

const BaseInputGroup = ({ label, name, type="text", options=[], value, onChange, disabled=false, isRequired=false }) => (
  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569', fontSize: '13px' }}>
      {label} {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {type === 'select' ? (
      <select 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        disabled={disabled} 
        required={isRequired}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: disabled ? '#f8fafc' : '#fff' }}
      >
        <option value="">Seleccione...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        disabled={disabled} 
        required={isRequired}
        rows={3}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: disabled ? '#f8fafc' : '#fff', resize: 'vertical' }}
      />
    ) : (
      <input 
        type={type} 
        name={name} 
        value={value || ''} 
        onChange={onChange} 
        disabled={disabled} 
        required={isRequired}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: disabled ? '#f8fafc' : '#fff' }} 
      />
    )}
  </div>
);

const Designaciones = () => {
  const empresaId = '1'; // Config global idealmente
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Catálogos
  const [tiposAcciones, setTiposAcciones] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [tiposNominas, setTiposNominas] = useState([]);

  // Menu Options state
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [isTomaPosesionModalOpen, setIsTomaPosesionModalOpen] = useState(false);
  const [tomaPosesionData, setTomaPosesionData] = useState({ id: null, fechaIngreso: '', numeroNombramiento: '' });

  const getInitialForm = () => ({
    SolicitudID: '', TipoAcionID: '', DireccionID: '', DependenciaID: '', CargoID: '',
    Sueldo: '', TurnoID: '', TipoNominaID: '', EmpleadoID: '', Observacion: '', NumeroNombramiento: 0,
    FechaRegistro: new Date().toISOString().slice(0, 16),
    FechaNombramiento: new Date().toISOString().slice(0, 16),
    Aprobado: false,
    Procesado: false,
    Anulado: false
  });

  const [formData, setFormData] = useState(getInitialForm());

  useEffect(() => {
    fetchData();
    fetchCatalogos();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/designaciones?empresaId=${empresaId}`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      Swal.fire('Error', 'No se pudo cargar la lista de designaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      // Tipos de Acciones (Filtrado por 10 - Designación)
      const resTa = await axios.get(`/api/configuracion/tipos-acciones?empresaId=${empresaId}`);
      if(Array.isArray(resTa.data)) {
         setTiposAcciones(resTa.data.filter(ta => ta.Tipo === 'Designacion' || (ta.TipoAccionID >= 10 && ta.TipoAccionID <= 19)));
      }

      // Solicitudes
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const resSol = await axios.get(`/api/solicitudes?empresaId=${empresaId}`, config);
        setSolicitudes(Array.isArray(resSol.data) ? resSol.data : []);
      } catch (e) { console.log('Sin modulo solicitudes', e); }

      // Direcciones
      const resDir = await axios.get(`/api/configuracion/direcciones?empresaId=${empresaId}`);
      setDirecciones(Array.isArray(resDir.data) ? resDir.data : []);

      // Turnos
      const resTur = await axios.get(`/api/configuracion/turnos?empresaId=${empresaId}`);
      setTurnos(Array.isArray(resTur.data) ? resTur.data : []);

      // Tipos Nominas
      const resNom = await axios.get(`/api/configuracion/tipos-nominas?empresaId=${empresaId}`);
      setTiposNominas(Array.isArray(resNom.data) ? resNom.data : []);

    } catch (err) {
      console.error('Error cargando catálogos:', err);
    }
  };

  // Cargar Dependencias al cambiar Dirección
  useEffect(() => {
    if (formData.DireccionID) {
      axios.get(`/api/configuracion/direcciones/${formData.DireccionID}/dependencias?empresaId=${empresaId}`)
        .then(res => {
            setDependencias(Array.isArray(res.data) ? res.data : []);
            // Si la dependencia actual no está en la nueva lista, la limpiamos
            if (!res.data.find(d => d.DependenciaID === formData.DependenciaID)) {
                setFormData(prev => ({...prev, DependenciaID: '', CargoID: ''}));
            }
        })
        .catch(err => console.log(err));
    } else {
      setDependencias([]);
      setFormData(prev => ({...prev, DependenciaID: '', CargoID: ''}));
    }
  }, [formData.DireccionID]);

  // Cargar Cargos al cambiar Dependencia
  useEffect(() => {
    if (formData.DependenciaID) {
      axios.get(`/api/configuracion/dependencias/${formData.DependenciaID}/cargos`)
        .then(res => {
            setCargos(Array.isArray(res.data) ? res.data : []);
            if (!res.data.find(c => c.CargoID === formData.CargoID)) {
                setFormData(prev => ({...prev, CargoID: ''}));
            }
        })
        .catch(err => console.log(err));
    } else {
      setCargos([]);
      setFormData(prev => ({...prev, CargoID: ''}));
    }
  }, [formData.DependenciaID]);

  const columns = [
    { accessor: 'DesignacionID', header: '# Designación' },
    { accessor: 'EmpleadoID', header: 'ID Empleado' },
    { accessor: 'TipoAccionDesc', header: 'Tipo Acción' },
    { accessor: 'CargoDesc', header: 'Cargo' },
    { accessor: 'DireccionDesc', header: 'Dirección' },
    { accessor: 'DependenciaDesc', header: 'Dependencia' }
  ];

  const handleOpenForm = (row = null) => {
    if (row) {
      setEditId(row.DesignacionID);
      const formatDT = (dt) => dt ? new Date(dt).toISOString().slice(0, 16) : '';
      setFormData({ 
        ...row,
        FechaRegistro: formatDT(row.FechaRegistro),
        FechaNombramiento: formatDT(row.FechaNombramiento)
      });
    } else {
      setEditId(null);
      setFormData(getInitialForm());
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/designaciones/${editId}` : '/api/designaciones';
      const method = editId ? 'PUT' : 'POST';

      const payload = { ...formData, EmpresaId: empresaId, CreadoPor: '1', ModificadoPor: '1' };

      const response = await axios({ method, url, data: payload });
      
      Swal.fire('Éxito', response.data.message || 'Designación guardada exitosamente', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleTomaPosesionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fechaIngreso: tomaPosesionData.fechaIngreso,
        numeroNombramiento: tomaPosesionData.numeroNombramiento,
        EmpresaID: empresaId,
        CreadoPor: '1' // ID de usuario
      };
      const response = await axios.post(`/api/designaciones/${tomaPosesionData.id}/toma-posesion`, payload);
      Swal.fire('Éxito', response.data.message, 'success');
      setIsTomaPosesionModalOpen(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí'
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/api/designaciones/${id}?empresaId=${empresaId}`);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleAction = async (actionName, id) => {
    if (actionName === 'Aprobar') {
      const result = await Swal.fire({
        title: '¿Deseas ejecutar esta operación?',
        text: `Se aprobará la designación #${id}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, Aprobar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          // Si tuvieras login, sacarías el usuario del localStorage
          const payload = { UsuarioAprobado: 'SYSTEM' };
          const response = await axios.put(`/api/designaciones/${id}/aprobar`, payload);
          Swal.fire('Éxito', response.data.message, 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Error', err.response?.data?.message || err.message, 'error');
        }
      }
    } else if (actionName === 'Desaprobar') {
      const result = await Swal.fire({
        title: '¿Reversar Aprobación?',
        text: `Se quitará la aprobación de la designación #${id}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Sí, Desaprobar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          const response = await axios.put(`/api/designaciones/${id}/desaprobar`);
          Swal.fire('Éxito', response.data.message, 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Error', err.response?.data?.message || err.message, 'error');
        }
      }
    } else if (actionName === 'Toma de Posesión') {
      setTomaPosesionData({ id, fechaIngreso: new Date().toISOString().slice(0, 16), numeroNombramiento: '' });
      setIsTomaPosesionModalOpen(true);
    } else if (actionName === 'Imprimir Acción') {
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
          window.open(`/imprimir/designacion/${id}?f1=${f1}&f2=${f2}&f3=${f3}`, '_blank');
        }
      });
    } else {
      Swal.fire('Información', `Proceso '${actionName}' para la designación #${id} se implementará en breve.`, 'info');
    }
  };

  const renderRowActions = (row) => {
    const isMenuOpen = menuOpenId === row.DesignacionID;

    return (
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (isMenuOpen) {
            setMenuOpenId(null);
          } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuHeight = 180; 
            
            let topPos = rect.bottom + 5;
            if (spaceBelow < menuHeight && rect.top > menuHeight) {
               topPos = rect.top - menuHeight - 5;
            }
            
            setMenuPos({ top: topPos, right: window.innerWidth - rect.right });
            setMenuOpenId(row.DesignacionID);
          }
        }}
        className="btn-action-pill"
        style={{ background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: '4px' }}
      >
        Opciones <MoreVertical size={14} />
      </button>
    );
  };

  const isReadOnly = formData.Aprobado || formData.Procesado || formData.Anulado;

  return (
    <>
      <DataTable 
        title="Designaciones y Nombramientos"  
        columns={columns} 
        data={data} 
        loading={loading} 
        onAdd={() => handleOpenForm()} 
        onEdit={handleOpenForm}
        editLabel={(row) => row.Aprobado || row.Procesado || row.Anulado ? 'Consultar' : 'Editar'}
        renderActions={renderRowActions}
      />

      <Modal title={isReadOnly ? "Consultar Designación (Sólo Lectura)" : editId ? "Editar Designación" : "Nueva Designación"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} hideFooter={true} size="xl">
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
            
            {/* COLUMNA 1: Datos del Empleado y Acción */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', borderBottom: '2px solid #cbd5e1', paddingBottom: '5px' }}>Datos Generales</h4>
              
              <BaseInputGroup label="Tipo de Acción" name="TipoAcionID" type="select" isRequired disabled={isReadOnly} options={tiposAcciones.map(ta => ({value: ta.TipoAccionID, label: `${ta.TipoAccionID} - ${ta.Descripcion}`}))} value={formData.TipoAcionID} onChange={handleChange} />
              
              <BaseInputGroup label="Solicitud de Empleo" name="SolicitudID" type="select" isRequired disabled={isReadOnly} options={solicitudes.map(s => ({value: s.SolicitudID, label: `Sol #${s.SolicitudID} - ${s.Nombre} ${s.Apellido1}`}))} value={formData.SolicitudID} onChange={handleChange} />
              
              <BaseInputGroup label="Sueldo" name="Sueldo" type="number" isRequired disabled={isReadOnly} value={formData.Sueldo} onChange={handleChange} />

              <BaseInputGroup label="Observación" name="Observacion" type="textarea" isRequired disabled={isReadOnly} value={formData.Observacion} onChange={handleChange} />
            </div>

            {/* COLUMNA 2: Estructura Organizativa */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', borderBottom: '2px solid #cbd5e1', paddingBottom: '5px' }}>Estructura del Puesto</h4>

              <BaseInputGroup label="Dirección" name="DireccionID" type="select" isRequired disabled={isReadOnly} options={direcciones.map(d => ({value: d.DireccionID, label: d.Descripcion}))} value={formData.DireccionID} onChange={handleChange} />
              
              <BaseInputGroup label="Dependencia" name="DependenciaID" type="select" isRequired disabled={isReadOnly || !formData.DireccionID} options={dependencias.map(d => ({value: d.DependenciaID, label: d.Descripcion}))} value={formData.DependenciaID} onChange={handleChange} />

              <BaseInputGroup label="Cargo Permitido" name="CargoID" type="select" isRequired disabled={isReadOnly || !formData.DependenciaID} options={cargos.map(c => ({value: c.CargoID, label: c.CargoDescripcion}))} value={formData.CargoID} onChange={handleChange} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                  <BaseInputGroup label="Turno de Trabajo" name="TurnoID" type="select" isRequired disabled={isReadOnly} options={turnos.map(t => ({value: t.TurnoID, label: t.Descripcion}))} value={formData.TurnoID} onChange={handleChange} />
                  <BaseInputGroup label="Tipo de Nómina" name="TipoNominaID" type="select" isRequired disabled={isReadOnly} options={tiposNominas.map(t => ({value: t.TipoNominaID, label: `${t.TipoNominaID} - ${t.Descripcion}`}))} value={formData.TipoNominaID} onChange={handleChange} />
              </div>
            </div>

            {/* COLUMNA 3: Control de Procesos */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', borderBottom: '2px solid #cbd5e1', paddingBottom: '5px' }}>Estado y Control (Sólo Lectura)</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <BaseInputGroup label="ID Empleado" name="EmpleadoID" type="text" value={formData.EmpleadoID} onChange={handleChange} disabled={true} />
                  <BaseInputGroup label="# Nombramiento" name="NumeroNombramiento" type="number" value={formData.NumeroNombramiento} onChange={handleChange} disabled={true} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <BaseInputGroup label="Aprobado" name="Aprobado" type="text" value={formData.Aprobado ? 'SÍ' : 'NO'} onChange={handleChange} disabled={true} />
                  <BaseInputGroup label="Fecha Aprobado" name="FechaRegistro" type="datetime-local" isRequired disabled={true} value={formData.FechaRegistro} onChange={handleChange} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <BaseInputGroup label="Procesado" name="Procesado" type="text" value={formData.Procesado ? 'SÍ' : 'NO'} onChange={handleChange} disabled={true} />
                  <BaseInputGroup label="Fecha Nombramiento" name="FechaNombramiento" type="datetime-local" isRequired value={formData.FechaNombramiento} onChange={handleChange} disabled={true} />
              </div>

              <BaseInputGroup label="Anulado" name="Anulado" type="text" value={formData.Anulado ? 'SÍ' : 'NO'} onChange={handleChange} disabled={true} />
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isReadOnly ? 'Cerrar' : 'Cancelar'}</button>
            {!isReadOnly && <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>}
          </div>
        </form>
      </Modal>

      <Modal title="Toma de Posesión" isOpen={isTomaPosesionModalOpen} onClose={() => setIsTomaPosesionModalOpen(false)} hideFooter={true} size="md">
        <form onSubmit={handleTomaPosesionSubmit}>
          <BaseInputGroup label="Fecha de Ingreso" name="fechaIngreso" type="datetime-local" isRequired value={tomaPosesionData.fechaIngreso} onChange={e => setTomaPosesionData({...tomaPosesionData, fechaIngreso: e.target.value})} />
          <BaseInputGroup label="Número de Nombramiento" name="numeroNombramiento" type="text" isRequired value={tomaPosesionData.numeroNombramiento} onChange={e => setTomaPosesionData({...tomaPosesionData, numeroNombramiento: e.target.value})} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <button type="button" onClick={() => setIsTomaPosesionModalOpen(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Procesar</button>
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
            position: 'fixed',
            top: menuPos.top,
            right: menuPos.right,
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            zIndex: 9999,
            minWidth: '180px',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {(() => {
              const row = data.find(d => d.DesignacionID === menuOpenId);
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
                  <button 
                    style={btnStyle(canAprobar)}
                    disabled={!canAprobar}
                    onClick={() => { setMenuOpenId(null); handleAction('Aprobar', row.DesignacionID); }}
                  >Aprobar</button>
                  <button 
                    style={btnStyle(canDesaprobar)}
                    disabled={!canDesaprobar}
                    onClick={() => { setMenuOpenId(null); handleAction('Desaprobar', row.DesignacionID); }}
                  >Desaprobar</button>
                  <button 
                    style={btnStyle(canProcesar)}
                    disabled={!canProcesar}
                    onClick={() => { setMenuOpenId(null); handleAction('Toma de Posesión', row.DesignacionID); }}
                  >Toma de Posesión</button>
                  <button 
                    style={btnStyle(canAnular)}
                    disabled={!canAnular}
                    onClick={() => { setMenuOpenId(null); handleAction('Anular Acción', row.DesignacionID); }}
                  >Anular Acción</button>
                  
                  <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
                  
                  <button 
                    style={btnStyle(true)}
                    onClick={() => { setMenuOpenId(null); handleAction('Imprimir Acción', row.DesignacionID); }}
                  >Imprimir Acción</button>
                  <button 
                    style={btnStyle(true)}
                    onClick={() => { setMenuOpenId(null); handleAction('Imprimir Carta', row.DesignacionID); }}
                  >Imprimir Carta</button>
                </>
              )
            })()}
          </div>
        </>
      )}

    </>
  );
};

export default Designaciones;
