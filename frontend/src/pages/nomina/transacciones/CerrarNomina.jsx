import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const CerrarNomina = () => {
  const empresaId = '1';
  const [nominasAbiertas, setNominasAbiertas] = useState([]);
  const [selectedNominaKey, setSelectedNominaKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNominasAbiertas();
  }, []);

  const fetchNominasAbiertas = async () => {
    try {
      const res = await axios.get(`/api/cerrar-nomina?empresaId=${empresaId}`);
      if (Array.isArray(res.data)) {
        setNominasAbiertas(res.data);
      } else {
        setNominasAbiertas([]);
        console.error('La respuesta no es un arreglo:', res.data);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar las nóminas abiertas', 'error');
    }
  };

  const handleProcesar = async () => {
    if (!selectedNominaKey) return Swal.fire('Atención', 'Debe seleccionar una nómina abierta para cerrar.', 'warning');

    const nomina = nominasAbiertas.find(
      n => `${n.TipoNominaId}-${n.CodigoPeriodo}-${n.NominaNumero}-${n.Secuencia}` === selectedNominaKey
    );

    if (!nomina) return Swal.fire('Error', 'Nómina no encontrada.', 'error');

    const confirm = await Swal.fire({
      title: '¿Está seguro?',
      text: `Está a punto de cerrar la nómina No. ${nomina.NominaNumero} (${nomina.TipoNominaId}) del periodo ${nomina.CodigoPeriodo}. Este proceso bloqueará modificaciones futuras.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar nómina',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await axios.post('/api/cerrar-nomina/procesar', {
          empresaId,
          tipoNominaId: nomina.TipoNominaId,
          codigoPeriodo: nomina.CodigoPeriodo,
          nominaNumero: nomina.NominaNumero,
          secuencia: nomina.Secuencia,
          usuario: 'ADMIN' // o currentUser si lo hubiera
        });

        Swal.fire('¡Cerrada!', 'La nómina ha sido cerrada exitosamente.', 'success');
        setSelectedNominaKey('');
        fetchNominasAbiertas(); // recargar lista
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Ocurrió un error al cerrar la nómina.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Cerrar Nómina</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Seleccione la nómina abierta que desea cerrar. Una vez procesada, cambiará a estatus Posteado = 1.
        </p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Nóminas Abiertas Disponibles
          </label>
          <select 
            value={selectedNominaKey} 
            onChange={(e) => setSelectedNominaKey(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
          >
            <option value="">-- Seleccione una nómina para cerrar --</option>
            {nominasAbiertas.map(n => {
              const key = `${n.TipoNominaId}-${n.CodigoPeriodo}-${n.NominaNumero}-${n.Secuencia}`;
              return (
                <option key={key} value={key}>
                  {n.TipoNominaId} - No. {n.NominaNumero} | Período: {n.CodigoPeriodo} | Sec: {n.Secuencia} | {n.Descripcion}
                </option>
              );
            })}
          </select>
          {nominasAbiertas.length === 0 && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>No hay nóminas abiertas en este momento.</p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={handleProcesar}
            disabled={loading || nominasAbiertas.length === 0}
            style={{ 
              padding: '10px 24px', 
              background: (loading || nominasAbiertas.length === 0) ? '#fca5a5' : '#ef4444', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: (loading || nominasAbiertas.length === 0) ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Procesando...' : 'Procesar Cierre de Nómina'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CerrarNomina;
