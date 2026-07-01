import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ArchivoBanco = () => {
  const empresaId = '1';
  const [nominasCerradas, setNominasCerradas] = useState([]);
  const [selectedNominaKey, setSelectedNominaKey] = useState('');
  const [delimitador, setDelimitador] = useState(',');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNominasCerradas();
  }, []);

  const fetchNominasCerradas = async () => {
    try {
      const res = await axios.get(`/api/archivo-banco/nominas-cerradas?empresaId=${empresaId}`);
      if (Array.isArray(res.data)) {
        setNominasCerradas(res.data);
      } else {
        setNominasCerradas([]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar las nóminas cerradas', 'error');
    }
  };

  const handleGenerar = async () => {
    if (!selectedNominaKey) return Swal.fire('Atención', 'Debe seleccionar una nómina para generar el archivo.', 'warning');
    if (!delimitador) return Swal.fire('Atención', 'Especifique el carácter delimitador.', 'warning');

    const nomina = nominasCerradas.find(
      n => `${n.TipoNominaId}-${n.CodigoPeriodo}-${n.NominaNumero}-${n.Secuencia}` === selectedNominaKey
    );

    if (!nomina) return Swal.fire('Error', 'Nómina no encontrada.', 'error');

    try {
      setLoading(true);
      const res = await axios.post('/api/archivo-banco/generar', {
        empresaId,
        tipoNominaId: nomina.TipoNominaId,
        codigoPeriodo: nomina.CodigoPeriodo,
        nominaNumero: nomina.NominaNumero,
        secuencia: nomina.Secuencia,
        delimitador
      });

      const { content } = res.data;

      // Descargar el archivo TXT
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Archivo_Banco_${nomina.TipoNominaId}_${nomina.CodigoPeriodo}_No${nomina.NominaNumero}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      Swal.fire('¡Generado!', 'El archivo de banco se ha generado y descargado correctamente.', 'success');
      
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Ocurrió un error al generar el archivo de banco.';
      Swal.fire({
        title: 'Error de Validación',
        text: errMsg,
        icon: 'error',
        width: '600px'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Generar Archivo de Banco</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Seleccione una nómina cerrada (Posteado = 1) para generar el archivo TXT para el banco.
        </p>
      </div>

      <div style={{ maxWidth: '700px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Nóminas Cerradas Disponibles
          </label>
          <select 
            value={selectedNominaKey} 
            onChange={(e) => setSelectedNominaKey(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
          >
            <option value="">-- Seleccione una nómina cerrada --</option>
            {nominasCerradas.map(n => {
              const key = `${n.TipoNominaId}-${n.CodigoPeriodo}-${n.NominaNumero}-${n.Secuencia}`;
              return (
                <option key={key} value={key}>
                  {n.TipoNominaId} - No. {n.NominaNumero} | Período: {n.CodigoPeriodo} | Sec: {n.Secuencia} | {n.Descripcion}
                </option>
              );
            })}
          </select>
          {nominasCerradas.length === 0 && !loading && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>No hay nóminas cerradas disponibles.</p>
          )}
        </div>

        <div style={{ marginBottom: '25px', display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Delimitador de Columnas
            </label>
            <input 
              type="text"
              value={delimitador}
              onChange={(e) => setDelimitador(e.target.value)}
              maxLength={1}
              style={{ width: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', textAlign: 'center' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={handleGenerar}
            disabled={loading || nominasCerradas.length === 0}
            style={{ 
              padding: '12px 24px', 
              background: (loading || nominasCerradas.length === 0) ? '#a7f3d0' : '#10b981', 
              color: (loading || nominasCerradas.length === 0) ? '#065f46' : '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: (loading || nominasCerradas.length === 0) ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px'
            }}
          >
            {loading ? 'Generando Archivo...' : 'Generar TXT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchivoBanco;
