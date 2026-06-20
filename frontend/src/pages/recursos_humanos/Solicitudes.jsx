import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import DependientesModal from '../../components/recursos_humanos/DependientesModal';
import EducacionModal from '../../components/recursos_humanos/EducacionModal';
import IdiomasModal from '../../components/recursos_humanos/IdiomasModal';
import ExperienciaModal from '../../components/recursos_humanos/ExperienciaModal';
import ReferenciasModal from '../../components/recursos_humanos/ReferenciasModal';
import OtrosModal from '../../components/recursos_humanos/OtrosModal';
import { showToast, showConfirm } from '../../utils/alerts';
import { UploadCloud, MoreVertical } from 'lucide-react';

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [editId, setEditId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  
  const [dependientesModalOpen, setDependientesModalOpen] = useState(false);
  const [educacionModalOpen, setEducacionModalOpen] = useState(false);
  const [idiomasModalOpen, setIdiomasModalOpen] = useState(false);
  const [experienciaModalOpen, setExperienciaModalOpen] = useState(false);
  const [referenciasModalOpen, setReferenciasModalOpen] = useState(false);
  const [otrosModalOpen, setOtrosModalOpen] = useState(false);
  const [activeSolicitudId, setActiveSolicitudId] = useState(null);

  // Dropdowns data
  const [cargos, setCargos] = useState([]);
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [gruposOcupacionales, setGruposOcupacionales] = useState([]);
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
  
  const [formData, setFormData] = useState({
    Empleadoid: '', Cedula: '', Nombre: '', Apellido1: '', Apellido2: '', FechaNacimiento: '', 
    Sexo: 0, EstadoCivil: 0, TipoSangre: 0, Telefono: '', Celular: '', Email: '', 
    Direccion: '', PaisID: '', ProvinciaID: '', MunicipioID: '',
    PaisIDNacimiento: '', ProvinciaIDNacimiento: '', MunicipioIDNacieminto: '',
    CargoID: '', Sueldo: 0, PerfilInternacional: false, Prioridad: false, 
    Traslado: false, Viajar: false, Nombrado: false,
    CedeID: '', GrupoOcupacionalID: '', URL: ''
  });

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/solicitudes?empresaId=${empresaId}`, config);
      setSolicitudes(res.data);
      
      // Load dependencies
      const [cargosRes, paisesRes, provRes, munRes, sedesRes, gruposRes] = await Promise.all([
        axios.get(`/api/cargos?empresaId=${empresaId}`, config),
        axios.get(`/api/geografia/paises?empresaId=${empresaId}`, config),
        axios.get(`/api/geografia/ciudades?empresaId=${empresaId}`, config),
        axios.get(`/api/geografia/municipios?empresaId=${empresaId}`, config),
        axios.get(`/api/configuracion/cedes`, config),
        axios.get(`/api/configuracion/grupos-ocupacionales`, config)
      ]);
      setCargos(cargosRes.data);
      setPaises(paisesRes.data.data || []);
      setProvincias(provRes.data.data || []);
      setMunicipios(munRes.data.data || []);
      setSedes(sedesRes.data);
      setGruposOcupacionales(gruposRes.data);
      
    } catch (err) {
      showToast('Error cargando datos: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'PaisID') {
        updated.ProvinciaID = '';
        updated.MunicipioID = '';
      }
      if (name === 'ProvinciaID') {
        updated.MunicipioID = '';
      }
      if (name === 'PaisIDNacimiento') {
        updated.ProvinciaIDNacimiento = '';
        updated.MunicipioIDNacieminto = '';
      }
      if (name === 'ProvinciaIDNacimiento') {
        updated.MunicipioIDNacieminto = '';
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhotoFile(file);
      setPreviewPhotoUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ...formData,
        EmpresaID: empresaId
      };

      let currentSolicitudId = editId;

      if (editId) {
        payload.ModificadoPor = username;
        await axios.put(`/api/solicitudes/${editId}`, payload, config);
      } else {
        payload.CreadoPor = username;
        const res = await axios.post('/api/solicitudes', payload, config);
        currentSolicitudId = res.data.id;
      }

      // 2. Subir Archivos si existen
      if (selectedFiles.length > 0 && currentSolicitudId) {
        const formDataFile = new FormData();
        selectedFiles.forEach(file => {
          formDataFile.append('documentos', file);
        });
        formDataFile.append('empresaId', empresaId);
        
        await axios.post(`/api/solicitudes/${currentSolicitudId}/documentos`, formDataFile, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // 3. Subir Foto si existe
      if (selectedPhotoFile && currentSolicitudId) {
        const formDataFoto = new FormData();
        formDataFoto.append('foto', selectedPhotoFile);
        formDataFoto.append('empresaId', empresaId);

        await axios.post(`/api/solicitudes/${currentSolicitudId}/foto`, formDataFoto, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      showToast('Solicitud registrada exitosamente');
      setModalOpen(false);
      setSelectedPhotoFile(null);
      setPreviewPhotoUrl('');
      fetchSolicitudes();
    } catch (err) {
      showToast('Error: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!(await showConfirm('¿Seguro de eliminar esta solicitud?'))) return;
    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/solicitudes/${id}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Solicitud eliminada');
      fetchSolicitudes();
    } catch (err) {
      showToast('Error al eliminar', 'error');
    }
  };

  const columns = [
    { accessor: 'Empleadoid', header: 'Código Empleado' },
    { accessor: 'Cedula', header: 'Cédula' },
    { 
      accessor: 'NombreCompleto', 
      header: 'Nombre',
      render: (row) => `${row.Nombre || ''} ${row.Apellido1 || ''} ${row.Apellido2 || ''}`.trim()
    },
    { 
      accessor: 'CedeID', 
      header: 'Sede',
      render: (row) => sedes.find(s => s.CedeID === row.CedeID)?.Descripcion || 'N/A'
    },
    { 
      accessor: 'GrupoOcupacionalID', 
      header: 'Grupo Ocupacional',
      render: (row) => gruposOcupacionales.find(g => g.GrupoOcupacionalID === row.GrupoOcupacionalID)?.Descripcion || 'N/A'
    }
  ];

  const renderRowActions = (row) => {
    const isMenuOpen = menuOpenId === row.SolicitudID;

    return (
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (isMenuOpen) {
            setMenuOpenId(null);
          } else {
            const rect = e.currentTarget.getBoundingClientRect();
            // Calcular si hay espacio abajo, si no, abrir hacia arriba
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuHeight = 280; // aprox 7 opciones * 40px
            
            let topPos = rect.bottom + 5;
            if (spaceBelow < menuHeight && rect.top > menuHeight) {
               topPos = rect.top - menuHeight - 5;
            }
            
            setMenuPos({ top: topPos, right: window.innerWidth - rect.right });
            setMenuOpenId(row.SolicitudID);
          }
        }}
        className="btn-action-pill"
        style={{ background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        Opciones <MoreVertical size={14} />
      </button>
    );
  };

  return (
    <>
      <DataTable
        title="Solicitudes de Empleo"
        columns={columns}
        data={solicitudes}
        onAdd={() => {
          setEditId(null);
          setMenuOpenId(null);
          setFormData({
            Empleadoid: '', Cedula: '', Nombre: '', Apellido1: '', Apellido2: '', FechaNacimiento: '', 
            Sexo: 0, EstadoCivil: 0, TipoSangre: 0, Telefono: '', Celular: '', Email: '', 
            Direccion: '', PaisID: '', ProvinciaID: '', MunicipioID: '',
            PaisIDNacimiento: '', ProvinciaIDNacimiento: '', MunicipioIDNacieminto: '',
            CargoID: '', Sueldo: 0, PerfilInternacional: false, Prioridad: false, 
            Traslado: false, Viajar: false, Nombrado: false,
            CedeID: '', GrupoOcupacionalID: '', URL: ''
          });
          setSelectedPhotoFile(null);
          setPreviewPhotoUrl('');
          setSelectedFiles([]);
          setExistingFiles([]);
          setActiveTab(1);
          setModalOpen(true);
        }}
        onEdit={async (row) => {
          setMenuOpenId(null);
          setEditId(row.SolicitudID);
          setFormData({
            Empleadoid: row.Empleadoid || '', Cedula: row.Cedula || '', Nombre: row.Nombre || '', Apellido1: row.Apellido1 || '', Apellido2: row.Apellido2 || '', 
            FechaNacimiento: row.FechaNacimiento || '', Sexo: row.Sexo || 0, EstadoCivil: row.EstadoCivil || 0, 
            TipoSangre: row.TipoSangre || 0, Telefono: row.Telefono || '', Celular: row.Celular || '', Email: row.Email || '', 
            Direccion: row.Direccion || '', PaisID: row.PaisID || '', ProvinciaID: row.ProvinciaID || '', MunicipioID: row.MunicipioID || '',
            PaisIDNacimiento: row.PaisIDNacimiento || '', ProvinciaIDNacimiento: row.ProvinciaIDNacimiento || '', 
            MunicipioIDNacieminto: row.MunicipioIDNacieminto || '', CargoID: row.CargoID || '', Sueldo: row.Sueldo || 0, 
            PerfilInternacional: !!row.PerfilInternacional, Prioridad: !!row.Prioridad, 
            Traslado: !!row.Traslado, Viajar: !!row.Viajar, Nombrado: !!row.Nombrado,
            CedeID: row.CedeID || '', GrupoOcupacionalID: row.GrupoOcupacionalID || '', URL: row.URL || ''
          });
          setSelectedPhotoFile(null);
          setPreviewPhotoUrl('');
          setSelectedFiles([]);
          setExistingFiles([]);
          
          try {
            const empresaId = localStorage.getItem('empresaId');
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/solicitudes/${row.SolicitudID}/documentos?empresaId=${empresaId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setExistingFiles(res.data || []);
          } catch (e) {
            console.error('Error fetching documents', e);
          }

          setActiveTab(1);
          setModalOpen(true);
        }}
        loading={loading}
        renderActions={renderRowActions}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); }} 
        title={editId ? "Editar Solicitud de Empleo" : "Nueva Solicitud de Empleo"} 
        hideFooter={true} 
        size="lg" 
        maxHeight="95vh"
      >
        
        {/* Pestañas Simplificadas */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
          {['Datos Generales', 'Ubicación', 'Documentos', 'Fotografía'].map((tab, idx) => (
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

        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '10px' }}>
            
            {/* TAB 1: DATOS GENERALES (Agrupados como en Catalogo) */}
            {activeTab === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* COLUMNA IZQUIERDA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* SECCIÓN 1: DATOS PERSONALES */}
                  <div style={sectionStyle}>
                    <h4 style={sectionTitleStyle}>1. Datos Personales</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      {!editId && (
                        <div>
                          <label style={labelStyle}>Código Empleado</label>
                          <input type="text" name="Empleadoid" value={formData.Empleadoid} onChange={handleChange} style={inputStyle} placeholder="Opcional" />
                        </div>
                      )}
                      <div>
                        <label style={labelStyle}>Cédula / Pasaporte</label>
                        <input type="text" name="Cedula" value={formData.Cedula} onChange={handleChange} required disabled={!!editId} style={editId ? { ...inputStyle, backgroundColor: '#e2e8f0', cursor: 'not-allowed' } : inputStyle} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>Nombres</label>
                        <input type="text" name="Nombre" value={formData.Nombre} onChange={handleChange} required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Fecha Nacimiento</label>
                        <input type="date" name="FechaNacimiento" value={formData.FechaNacimiento ? formData.FechaNacimiento.split('T')[0] : ''} onChange={handleChange} required style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>Primer Apellido</label>
                        <input type="text" name="Apellido1" value={formData.Apellido1} onChange={handleChange} required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Segundo Apellido</label>
                        <input type="text" name="Apellido2" value={formData.Apellido2} onChange={handleChange} style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Sexo</label>
                        <select name="Sexo" value={formData.Sexo} onChange={handleChange} style={inputStyle}>
                          <option value={0}>Selec...</option>
                          <option value={1}>Masc</option>
                          <option value={2}>Fem</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Estado Civil</label>
                        <select name="EstadoCivil" value={formData.EstadoCivil} onChange={handleChange} style={inputStyle}>
                          <option value={0}>Selec...</option>
                          <option value={1}>Soltero</option>
                          <option value={2}>Casado</option>
                          <option value={3}>Unido</option>
                          <option value={4}>Divorciado</option>
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Sangre</label>
                        <select name="TipoSangre" value={formData.TipoSangre} onChange={handleChange} style={inputStyle}>
                          <option value={0}>Selec...</option>
                          <option value={1}>A+</option><option value={2}>A-</option>
                          <option value={3}>B+</option><option value={4}>B-</option>
                          <option value={5}>AB+</option><option value={6}>AB-</option>
                          <option value={7}>O+</option><option value={8}>O-</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                      <div>
                        <label style={labelStyle}>Sede</label>
                        <select name="CedeID" value={formData.CedeID} onChange={handleChange} style={inputStyle}>
                          <option value="">Seleccione Sede...</option>
                          {sedes.map(s => <option key={s.CedeID} value={s.CedeID}>{s.Descripcion}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Grupo Ocupacional</label>
                        <select name="GrupoOcupacionalID" value={formData.GrupoOcupacionalID} onChange={handleChange} style={inputStyle}>
                          <option value="">Seleccione Grupo...</option>
                          {gruposOcupacionales.map(g => <option key={g.GrupoOcupacionalID} value={g.GrupoOcupacionalID}>{g.Descripcion}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMNA DERECHA */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* SECCIÓN 2: INFORMACIÓN DE CONTACTO */}
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>2. Información de Contacto</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>Teléfono</label>
                        <input type="text" name="Telefono" value={formData.Telefono} onChange={handleChange} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Celular</label>
                        <input type="text" name="Celular" value={formData.Celular} onChange={handleChange} required style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>Email</label>
                        <input type="email" name="Email" value={formData.Email} onChange={handleChange} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: PERFIL LABORAL */}
                  <div style={sectionStyle}>
                    <h4 style={sectionTitleStyle}>3. Perfil Laboral y Aspiraciones</h4>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={labelStyle}>Cargo al que Aplica</label>
                      <select name="CargoID" value={formData.CargoID} onChange={handleChange} required style={inputStyle}>
                        <option value="">Seleccione un Cargo...</option>
                        {cargos.map(c => <option key={c.CargoID} value={c.CargoID}>{c.Descripcion}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Sueldo Aspirado</label>
                      <input type="number" name="Sueldo" value={formData.Sueldo} onChange={handleChange} style={inputStyle} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <label style={checkboxLabelStyle}>
                        <input type="checkbox" name="PerfilInternacional" checked={formData.PerfilInternacional} onChange={handleChange} /> Currículum
                      </label>
                      <label style={checkboxLabelStyle}>
                        <input type="checkbox" name="Traslado" checked={formData.Traslado} onChange={handleChange} /> Dispuesto a Traslado
                      </label>
                      <label style={checkboxLabelStyle}>
                        <input type="checkbox" name="Viajar" checked={formData.Viajar} onChange={handleChange} /> Dispuesto a Viajar
                      </label>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: UBICACIÓN */}
            {activeTab === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', minHeight: '65vh' }}>
                
                {/* LUGAR DE RESIDENCIA */}
                <div style={sectionStyle}>
                  <h4 style={sectionTitleStyle}>Residencia Actual</h4>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Dirección Actual</label>
                    <input type="text" name="Direccion" value={formData.Direccion} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>País Residencia</label>
                    <select name="PaisID" value={formData.PaisID} onChange={handleChange} style={inputStyle}>
                      <option value="">Seleccione País...</option>
                      {paises.map(p => <option key={p.PaisID} value={p.PaisID}>{p.Nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Provincia/Ciudad Residencia</label>
                    <select name="ProvinciaID" value={formData.ProvinciaID} onChange={handleChange} style={inputStyle} disabled={!formData.PaisID}>
                      <option value="">Seleccione Provincia...</option>
                      {provincias.filter(pr => String(pr.PaisID) === String(formData.PaisID)).map(p => <option key={p.CiudadID} value={p.CiudadID}>{p.Nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Municipio Residencia</label>
                    <select name="MunicipioID" value={formData.MunicipioID} onChange={handleChange} style={inputStyle} disabled={!formData.ProvinciaID}>
                      <option value="">Seleccione Municipio...</option>
                      {municipios.filter(m => String(m.CiudadID) === String(formData.ProvinciaID)).map(m => <option key={m.MunicipioID} value={m.MunicipioID}>{m.Nombre}</option>)}
                    </select>
                  </div>
                </div>

                {/* LUGAR DE NACIMIENTO */}
                <div style={sectionStyle}>
                  <h4 style={sectionTitleStyle}>Lugar de Nacimiento</h4>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>País de Nacimiento</label>
                    <select name="PaisIDNacimiento" value={formData.PaisIDNacimiento} onChange={handleChange} style={inputStyle}>
                      <option value="">Seleccione País...</option>
                      {paises.map(p => <option key={p.PaisID} value={p.PaisID}>{p.Nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Provincia/Ciudad Nacimiento</label>
                    <select name="ProvinciaIDNacimiento" value={formData.ProvinciaIDNacimiento} onChange={handleChange} style={inputStyle} disabled={!formData.PaisIDNacimiento}>
                      <option value="">Seleccione Provincia...</option>
                      {provincias.filter(pr => String(pr.PaisID) === String(formData.PaisIDNacimiento)).map(p => <option key={p.CiudadID} value={p.CiudadID}>{p.Nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Municipio Nacimiento</label>
                    <select name="MunicipioIDNacieminto" value={formData.MunicipioIDNacieminto} onChange={handleChange} style={inputStyle} disabled={!formData.ProvinciaIDNacimiento}>
                      <option value="">Seleccione Municipio...</option>
                      {municipios.filter(m => String(m.CiudadID) === String(formData.ProvinciaIDNacimiento)).map(m => <option key={m.MunicipioID} value={m.MunicipioID}>{m.Nombre}</option>)}
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: DOCUMENTOS */}
            {activeTab === 3 && (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Documentos ya subidos (modo edición) */}
                {editId && existingFiles.length > 0 && (
                  <div style={{ padding: '20px', border: '1px solid #cbd5e1', borderRadius: '10px', backgroundColor: '#f1f5f9' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '15px' }}>Documentos Anexados Previamente</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {existingFiles.map(file => (
                        <div key={file.DocumentoID} style={{ padding: '10px 15px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{file.NombreArchivo}</span>
                          <a href={file.RutaArchivo} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Ver Documento</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: '40px 20px', textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: '10px', backgroundColor: '#f8fafc', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadCloud size={48} color="#94a3b8" style={{ marginBottom: '15px' }} />
                  <h3 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '15px' }}>Anexar Nuevos Documentos (Opcional)</h3>
                  <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '13px' }}>Formatos permitidos: PDF, Word, JPG, PNG</p>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    style={{ display: 'block' }}
                    multiple
                  />
                  
                  {selectedFiles.length > 0 && (
                    <div style={{ marginTop: '20px', width: '100%', maxWidth: '400px', textAlign: 'left' }}>
                      <h4 style={{ marginBottom: '10px', color: '#0f172a', fontSize: '14px' }}>Nuevos archivos a subir:</h4>
                      {selectedFiles.map((f, i) => (
                        <div key={i} style={{ padding: '8px 12px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                          <button type="button" onClick={() => removeFile(i)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* TAB 4: FOTOGRAFIA */}
            {activeTab === 4 && (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', minHeight: '65vh' }}>
                <div style={{ width: '100%', maxWidth: '600px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '15px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Fotografía del Empleado</h4>
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '15px' }}>
                    Sube una fotografía del empleado desde tu computadora.
                  </p>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Seleccionar Archivo de Fotografía</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoChange} 
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }} 
                    />
                  </div>
                  
                  <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '250px' }}>
                    {previewPhotoUrl || formData.URL ? (
                      <img 
                        src={previewPhotoUrl || formData.URL} 
                        alt="Previsualización" 
                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/200?text=Imagen+Inv%C3%A1lida';
                        }}
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8' }}>
                        <span style={{ fontSize: '48px', marginBottom: '10px' }}>📷</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Sin fotografía (Previsualización)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', color: '#334155', fontWeight: 500 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 500 }}>
              Guardar Solicitud
            </button>
          </div>
        </form>
      </Modal>

      {/* GLOBAL POPUP MENU */}
      {menuOpenId && (
        <>
          {/* Capa invisible para cerrar el menú al hacer clic fuera */}
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
            onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }}
          />
          <div style={{ 
            position: 'fixed', top: menuPos.top, right: menuPos.right, background: '#fff', 
            border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            minWidth: '200px', zIndex: 10000, overflow: 'hidden'
          }}>
            {['Dependientes', 'Educación', 'Idiomas', 'Experiencia Laboral', 'Referencias', 'Otros', 'Designación'].map((opcion, idx, arr) => (
              <button 
                key={opcion}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (opcion === 'Dependientes') {
                    setActiveSolicitudId(menuOpenId);
                    setDependientesModalOpen(true);
                  } else if (opcion === 'Educación') {
                    setActiveSolicitudId(menuOpenId);
                    setEducacionModalOpen(true);
                  } else if (opcion === 'Idiomas') {
                    setActiveSolicitudId(menuOpenId);
                    setIdiomasModalOpen(true);
                  } else if (opcion === 'Experiencia Laboral') {
                    setActiveSolicitudId(menuOpenId);
                    setExperienciaModalOpen(true);
                  } else if (opcion === 'Referencias') {
                    setActiveSolicitudId(menuOpenId);
                    setReferenciasModalOpen(true);
                  } else if (opcion === 'Otros') {
                    setActiveSolicitudId(menuOpenId);
                    setOtrosModalOpen(true);
                  } else {
                    showToast(`Opción '${opcion}' se abrirá en un modal aparte`, 'info');
                  }
                  setMenuOpenId(null);
                }}
                style={{ 
                  display: 'block', width: '100%', textAlign: 'left', padding: '10px 15px', 
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', 
                  color: '#334155', borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #f1f5f9',
                  fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {opcion}
              </button>
            ))}
          </div>
        </>
      )}

      <DependientesModal 
        isOpen={dependientesModalOpen}
        onClose={() => setDependientesModalOpen(false)}
        solicitudId={activeSolicitudId}
      />

      <EducacionModal 
        isOpen={educacionModalOpen}
        onClose={() => setEducacionModalOpen(false)}
        solicitudId={activeSolicitudId}
      />

      <IdiomasModal 
        isOpen={idiomasModalOpen}
        onClose={() => setIdiomasModalOpen(false)}
        solicitudId={activeSolicitudId}
      />

      <ExperienciaModal 
        isOpen={experienciaModalOpen}
        onClose={() => setExperienciaModalOpen(false)}
        solicitudId={activeSolicitudId}
      />

      <ReferenciasModal 
        isOpen={referenciasModalOpen}
        onClose={() => setReferenciasModalOpen(false)}
        solicitudId={activeSolicitudId}
      />

      <OtrosModal 
        isOpen={otrosModalOpen}
        onClose={() => setOtrosModalOpen(false)}
        solicitudId={activeSolicitudId}
      />
    </>
  );
};

// Estilos compartidos copiados de CatalogoCuentas
const sectionStyle = { background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const sectionTitleStyle = { margin: '0 0 16px 0', color: '#0f172a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, color: '#475569', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, color: '#334155', fontSize: '13px' };

export default Solicitudes;
