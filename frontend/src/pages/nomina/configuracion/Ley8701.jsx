import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
      {label}
    </label>
    {children}
  </div>
);

const Ley8701 = () => {
  const empresaId = '1';
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    EmpresaId: empresaId,
    TOPEAFP: 0,
    TOPEARS: 0,
    Riesgo: 0,
    Pcto1: 0,
    Pcto2: 0,
    Pcto3: 0,
    AportePension: 0,
    AporteSalud: 0,
    PatronoAFP: 0,
    PatronoARS: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/afpars?EmpresaID=${empresaId}`);
      if (res.data) {
        setFormData(res.data);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los parámetros de Ley 87-01', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`/api/afpars`, formData);
      Swal.fire('Guardado', 'Los parámetros se han guardado exitosamente.', 'success');
      fetchData(); // Reload format safely
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Ocurrió un error al guardar los parámetros.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Configuración Ley 87-01 (AFP / ARS / Riesgo)</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Configuración de topes salariales, porcentajes y aportes patronales/empleado.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: '900px' }}>
        
        {/* Sección de Topes y Porcentajes en paralelo */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#334155' }}>Topes y Porcentajes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            
            {/* Columna AFP */}
            <div>
              <BaseInputGroup label="Tope AFP">
                <input
                  type="number"
                  name="TOPEAFP"
                  value={formData.TOPEAFP}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
              <BaseInputGroup label="% AFP (Pcto1)">
                <input
                  type="number"
                  name="Pcto1"
                  value={formData.Pcto1}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
            </div>

            {/* Columna ARS */}
            <div>
              <BaseInputGroup label="Tope ARS">
                <input
                  type="number"
                  name="TOPEARS"
                  value={formData.TOPEARS}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
              <BaseInputGroup label="% ARS (Pcto2)">
                <input
                  type="number"
                  name="Pcto2"
                  value={formData.Pcto2}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
            </div>

            {/* Columna Riesgo */}
            <div>
              <BaseInputGroup label="Tope Riesgo">
                <input
                  type="number"
                  name="Riesgo"
                  value={formData.Riesgo}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
              <BaseInputGroup label="% Riesgo (Pcto3)">
                <input
                  type="number"
                  name="Pcto3"
                  value={formData.Pcto3}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
            </div>

          </div>
        </div>

        {/* Sección de Aportes */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#334155' }}>Aportes Adicionales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            
            <div style={{ paddingRight: '20px', borderRight: '1px solid #cbd5e1' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569' }}>Aportes Empleado</h4>
              <BaseInputGroup label="Aporte Pensión">
                <input
                  type="number"
                  name="AportePension"
                  value={formData.AportePension}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
              <BaseInputGroup label="Aporte Salud">
                <input
                  type="number"
                  name="AporteSalud"
                  value={formData.AporteSalud}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
            </div>

            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569' }}>Aportes Patrono</h4>
              <BaseInputGroup label="Patrono AFP">
                <input
                  type="number"
                  name="PatronoAFP"
                  value={formData.PatronoAFP}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
              <BaseInputGroup label="Patrono ARS">
                <input
                  type="number"
                  name="PatronoARS"
                  value={formData.PatronoARS}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </BaseInputGroup>
            </div>

          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              padding: '10px 24px', 
              background: '#3b82f6', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Ley8701;
