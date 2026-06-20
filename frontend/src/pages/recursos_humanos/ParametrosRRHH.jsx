import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const BaseInputGroup = ({ label, name, type = "text", options = [], value, onChange, disabled = false, isRequired = false }) => (
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

const ParametrosRRHH = () => {
  const empresaId = '1'; // Config global idealmente
  const [loading, setLoading] = useState(true);
  const [cargos, setCargos] = useState([]);

  const getInitialForm = () => ({
    Firma1: '', CargoIDFirma1: '',
    Firma2: '', CargoIDFirma2: '',
    Firma3: '', CargoIDFirma3: ''
  });

  const [formData, setFormData] = useState(getInitialForm());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch Cargos for dropdown
      const resCargos = await axios.get(`/api/cargos?empresaId=${empresaId}`, config);
      if (Array.isArray(resCargos.data)) {
        setCargos(resCargos.data.map(c => ({ value: c.CargoID, label: c.Descripcion })));
      }

      // Fetch existing parametros
      const resParam = await axios.get(`/api/configuracion/parametros-rrhh?empresaId=${empresaId}`, config);
      if (resParam.data && Object.keys(resParam.data).length > 0) {
        setFormData(resParam.data);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Error desconocido';
      Swal.fire('Error', `No se pudieron cargar los datos: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/configuracion/parametros-rrhh?empresaId=${empresaId}`, formData, config);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Parámetros actualizados correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Error al guardar', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando parámetros...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Parámetros de Recursos Humanos</h2>
        <button
          onClick={handleSave}
          style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Guardar Cambios
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          
          {/* Firma 1 */}
          <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, fontSize: '15px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Firma 1</h3>
            <BaseInputGroup
              label="Nombre de la Firma"
              name="Firma1"
              value={formData.Firma1}
              onChange={handleInputChange}
            />
            <BaseInputGroup
              label="Cargo Asociado"
              name="CargoIDFirma1"
              type="select"
              options={cargos}
              value={formData.CargoIDFirma1}
              onChange={handleInputChange}
            />
          </div>

          {/* Firma 2 */}
          <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, fontSize: '15px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Firma 2</h3>
            <BaseInputGroup
              label="Nombre de la Firma"
              name="Firma2"
              value={formData.Firma2}
              onChange={handleInputChange}
            />
            <BaseInputGroup
              label="Cargo Asociado"
              name="CargoIDFirma2"
              type="select"
              options={cargos}
              value={formData.CargoIDFirma2}
              onChange={handleInputChange}
            />
          </div>

          {/* Firma 3 */}
          <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginTop: 0, fontSize: '15px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Firma 3</h3>
            <BaseInputGroup
              label="Nombre de la Firma"
              name="Firma3"
              value={formData.Firma3}
              onChange={handleInputChange}
            />
            <BaseInputGroup
              label="Cargo Asociado"
              name="CargoIDFirma3"
              type="select"
              options={cargos}
              value={formData.CargoIDFirma3}
              onChange={handleInputChange}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParametrosRRHH;
