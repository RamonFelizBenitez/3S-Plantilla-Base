import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ParametrosNomina = () => {
  const empresaId = '1';
  const [loading, setLoading] = useState(false);
  const [banco, setBanco] = useState('');
  const [cuentaBanco, setCuentaBanco] = useState('');

  const bancosOptions = ['Popular', 'Banreserva', 'BHD', 'Promerica'];

  useEffect(() => {
    fetchParametros();
  }, []);

  const fetchParametros = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/nomina/parametros?empresaId=${empresaId}`);
      if (res.data) {
        setBanco(res.data.Banco || '');
        setCuentaBanco(res.data.CuentaBanco || '');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los parámetros de nómina', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/nomina/parametros', {
        empresaId,
        banco,
        cuentaBanco,
        usuario: 'ADMIN' // o currentUser si lo hubiera
      });
      Swal.fire('¡Éxito!', 'Parámetros guardados correctamente.', 'success');
      fetchParametros();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Ocurrió un error al guardar los parámetros.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Parámetros de Nómina</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Configure los parámetros generales del módulo de nómina. Estos datos aplican para toda la empresa.
        </p>
      </div>

      <form onSubmit={handleGuardar} style={{ maxWidth: '600px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', display: 'inline-block', paddingBottom: '5px' }}>
          Información Bancaria
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Banco Predeterminado
            </label>
            <select 
              value={banco} 
              onChange={(e) => setBanco(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="">-- Seleccione un banco --</option>
              {bancosOptions.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Cuenta de Banco (Origen)
            </label>
            <input 
              type="text"
              value={cuentaBanco}
              onChange={(e) => setCuentaBanco(e.target.value)}
              placeholder="Ej. 700123456"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '30px' }}>
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '10px 24px', 
              background: loading ? '#94a3b8' : '#3b82f6', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Parámetros'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParametrosNomina;
