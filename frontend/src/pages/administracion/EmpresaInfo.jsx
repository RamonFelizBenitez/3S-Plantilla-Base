import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import { Save } from 'lucide-react';

const emptyInfo = {
  RNC: '', Direccion: '', PaisID: '', CiudadID: '', MunicipioID: '',
  Telefono: '', Correo: '', PaginaWeb: '', Logo: '',
  Representante: '', CargoRepresentante: ''
};

const EmpresaInfo = () => {
  const [empresasList, setEmpresasList] = useState([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null); // The full empresa object
  const [formData, setFormData] = useState({ ...emptyInfo });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    // Fetch lista de empresas
    fetch('/api/empresas?limit=100')
      .then(res => res.json())
      .then(json => setEmpresasList(json.data || []))
      .catch(err => console.error(err));

    // Fetch paises
    fetch('/api/geografia/paises')
      .then(res => res.json())
      .then(data => setPaises(data.data || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.PaisID) {
      fetch(`/api/geografia/ciudades?paisId=${formData.PaisID}`)
        .then(res => res.json())
        .then(data => setCiudades(data.data || []))
        .catch(() => setCiudades([{ CiudadID: 1, Nombre: 'Distrito Nacional' }]));
    } else {
      setCiudades([]);
    }
  }, [formData.PaisID]);

  useEffect(() => {
    if (formData.CiudadID) {
      fetch(`/api/geografia/municipios?ciudadId=${formData.CiudadID}`)
        .then(res => res.json())
        .then(data => setMunicipios(data.data || []))
        .catch(() => setMunicipios([{ MunicipioID: 1, Nombre: 'Santo Domingo Centro' }]));
    } else {
      setMunicipios([]);
    }
  }, [formData.CiudadID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el país, limpiar ciudad y municipio
    if (name === 'PaisID') {
        setFormData(prev => ({ ...prev, [name]: value, CiudadID: '', MunicipioID: '' }));
    } else if (name === 'CiudadID') {
        setFormData(prev => ({ ...prev, [name]: value, MunicipioID: '' }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEmpresaChange = async (e) => {
    const id = e.target.value;
    if (!id) {
        setSelectedEmpresa(null);
        setFormData({ ...emptyInfo });
        setSelectedFile(null);
        setPreviewUrl('');
        return;
    }
    
    try {
        setLoading(true);
        const res = await fetch(`/api/empresas/${id}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedEmpresa(data);
            setFormData({
                RNC: data.RNC || '',
                Direccion: data.Direccion || '',
                PaisID: data.PaisID || '',
                CiudadID: data.CiudadID || '',
                MunicipioID: data.MunicipioID || '',
                Telefono: data.Telefono || '',
                Correo: data.Correo || '',
                PaginaWeb: data.PaginaWeb || '',
                Logo: data.Logo || '',
                Representante: data.Representante || '',
                CargoRepresentante: data.CargoRepresentante || ''
            });
            setSelectedFile(null);
            // If the server URL is returned, show it directly. We assume it's relative like /uploads/...
            setPreviewUrl(data.Logo ? data.Logo : '');
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedEmpresa) return showToast("Seleccione una empresa primero");
    
    setLoading(true);
    try {
        let currentLogo = formData.Logo;

        // Si hay un archivo nuevo, lo subimos primero
        if (selectedFile) {
            const formDataUpload = new FormData();
            formDataUpload.append('logo', selectedFile);
            const uploadRes = await fetch(`/api/empresas/${selectedEmpresa.EmpresaID}/logo`, {
                method: 'POST',
                body: formDataUpload
            });
            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                currentLogo = uploadData.logoUrl;
                setFormData(prev => ({ ...prev, Logo: currentLogo }));
            } else {
                return showToast("Error al subir el logotipo");
            }
        }

        const payload = {
            NombreEmpresa: selectedEmpresa.NombreEmpresa,
            Activa: selectedEmpresa.Activa,
            Info: {
                ...formData,
                Logo: currentLogo,
                PaisID: formData.PaisID ? parseInt(formData.PaisID) : null,
                CiudadID: formData.CiudadID ? parseInt(formData.CiudadID) : null,
                MunicipioID: formData.MunicipioID ? parseInt(formData.MunicipioID) : null
            }
        };

        const res = await fetch(`/api/empresas/${selectedEmpresa.EmpresaID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast("Información guardada exitosamente");
        } else {
            showToast("Error al guardar la información");
        }
    } catch (err) {
        console.error(err);
        showToast("Error de conexión");
    } finally {
        setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Información de la Empresa</h2>
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}
        >
          <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #edf2f7' }}>
        
        <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1e293b', fontSize: '16px' }}>Seleccionar Empresa a Editar</label>
            <select 
                onChange={handleEmpresaChange} 
                style={{ ...inputStyle, borderColor: '#3b82f6', backgroundColor: '#f0fdf4', maxWidth: '400px' }}
            >
                <option value="">-- Seleccione una Empresa --</option>
                {empresasList.map(emp => (
                    <option key={emp.EmpresaID} value={emp.EmpresaID}>{emp.NombreEmpresa}</option>
                ))}
            </select>
        </div>

        {!selectedEmpresa ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Seleccione una empresa de la lista superior para cargar su información extendida.
            </div>
        ) : (
            <>
        <h3 style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '10px', marginBottom: '20px', color: '#334155' }}>Identidad Corporativa</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>RNC</label>
            <input type="text" name="RNC" value={formData.RNC} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Logotipo de la Empresa</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{...inputStyle, padding: '7px'}} />
            {previewUrl && (
              <div style={{ marginTop: '10px', padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
                <img src={previewUrl} alt="Logo Preview" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            )}
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '10px', marginBottom: '20px', color: '#334155' }}>Contacto y Ubicación</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Dirección Física</label>
            <input type="text" name="Direccion" value={formData.Direccion} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>País</label>
            <select name="PaisID" value={formData.PaisID} onChange={handleChange} style={inputStyle}>
              <option value="">-- Seleccionar --</option>
              {paises.map(p => <option key={p.PaisID} value={p.PaisID}>{p.Nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Ciudad / Provincia</label>
            <select name="CiudadID" value={formData.CiudadID} onChange={handleChange} style={inputStyle} disabled={!formData.PaisID}>
              <option value="">-- Seleccionar --</option>
              {ciudades.map(c => <option key={c.CiudadID} value={c.CiudadID}>{c.Nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Municipio</label>
            <select name="MunicipioID" value={formData.MunicipioID} onChange={handleChange} style={inputStyle} disabled={!formData.CiudadID}>
              <option value="">-- Seleccionar --</option>
              {municipios.map(m => <option key={m.MunicipioID} value={m.MunicipioID}>{m.Nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Teléfono Principal</label>
            <input type="text" name="Telefono" value={formData.Telefono} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Correo Electrónico</label>
            <input type="email" name="Correo" value={formData.Correo} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Página Web</label>
            <input type="text" name="PaginaWeb" value={formData.PaginaWeb} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '10px', marginBottom: '20px', color: '#334155' }}>Representante Legal</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Nombre del Representante</label>
            <input type="text" name="Representante" value={formData.Representante} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Cargo</label>
            <input type="text" name="CargoRepresentante" value={formData.CargoRepresentante} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        
            </>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#334155'
};

export default EmpresaInfo;
