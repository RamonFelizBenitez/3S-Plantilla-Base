import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AbrirNomina = () => {
  const empresaId = '1';
  const [loading, setLoading] = useState(false);
  
  // Datos
  const [tiposNominas, setTiposNominas] = useState([]);
  const [periodosDisponibles, setPeriodosDisponibles] = useState([]);

  // Selecciones
  const [selectedTipoNominaID, setSelectedTipoNominaID] = useState('');
  const [selectedCodigoPeriodo, setSelectedCodigoPeriodo] = useState('');
  const [selectedSecuencia, setSelectedSecuencia] = useState('');
  const [fechaPago, setFechaPago] = useState('');

  useEffect(() => {
    fetchTiposNominas();
  }, []);

  const fetchTiposNominas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/abrir-nomina/tipos?EmpresaID=${empresaId}`);
      setTiposNominas(res.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los tipos de nóminas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTipoNominaChange = async (e) => {
    const val = e.target.value;
    setSelectedTipoNominaID(val);
    setSelectedCodigoPeriodo('');
    setSelectedSecuencia('');
    setPeriodosDisponibles([]);

    if (val) {
      const tipo = tiposNominas.find(t => t.TipoNominaID === val);
      if (tipo) {
        try {
          setLoading(true);
          const res = await axios.get(`/api/abrir-nomina/periodos/${tipo.TipoPago}/${tipo.TipoNominaID}?EmpresaID=${empresaId}`);
          setPeriodosDisponibles(res.data || []);
        } catch (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudieron cargar los periodos disponibles', 'error');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleCodigoPeriodoChange = (e) => {
    setSelectedCodigoPeriodo(e.target.value);
    setSelectedSecuencia('');
  };

  // Derivados
  const selectedTipo = tiposNominas.find(t => t.TipoNominaID === selectedTipoNominaID);
  
  // Obtener Años únicos de los periodos
  const aniosDisponibles = Array.from(new Set(periodosDisponibles.map(p => p.CodigoPeriodo)));
  
  // Obtener Secuencias del Año seleccionado
  const secuenciasDisponibles = periodosDisponibles.filter(p => p.CodigoPeriodo.toString() === selectedCodigoPeriodo.toString());
  
  // Obtener Periodo seleccionado
  const selectedPeriodo = secuenciasDisponibles.find(p => p.Secuencia.toString() === selectedSecuencia.toString());

  const getTipoPagoText = (tipoPago) => {
    switch (tipoPago) {
      case 0: return 'Semanal';
      case 1: return 'Bisemanal';
      case 2: return 'Quincenal';
      case 3: return 'Mensual';
      default: return 'Desconocido';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.substring(0, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTipoNominaID || !selectedCodigoPeriodo || !selectedSecuencia || !fechaPago) {
      return Swal.fire('Atención', 'Debe completar todos los campos', 'warning');
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/abrir-nomina/abrir', {
        EmpresaID: empresaId,
        TipoNominaID: selectedTipoNominaID,
        CodigoPeriodo: parseInt(selectedCodigoPeriodo, 10),
        Secuencia: parseInt(selectedSecuencia, 10),
        FechaPago: fechaPago
      });
      
      Swal.fire({
        title: 'Nómina Abierta',
        text: res.data.message + ` (Nómina #${res.data.NominaNumero})`,
        icon: 'success'
      });

      // Reset form
      setSelectedTipoNominaID('');
      setSelectedCodigoPeriodo('');
      setSelectedSecuencia('');
      setFechaPago('');
      setPeriodosDisponibles([]);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Error al abrir la nómina', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Abrir Nómina</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Seleccione la nómina y el periodo que desea aperturar para la próxima transacción.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        
        {/* PASO 1: TIPO NÓMINA */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            1. Seleccione el Tipo de Nómina
          </label>
          <select 
            value={selectedTipoNominaID} 
            onChange={handleTipoNominaChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
          >
            <option value="">-- Seleccione una nómina --</option>
            {tiposNominas.map(t => (
              <option key={t.TipoNominaID} value={t.TipoNominaID}>
                {t.TipoNominaID} - {t.Descripcion}
              </option>
            ))}
          </select>
          {selectedTipo && (
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#059669', fontWeight: 'bold' }}>
              Frecuencia: {getTipoPagoText(selectedTipo.TipoPago)}
            </p>
          )}
        </div>

        {/* PASO 2: AÑO Y SECUENCIA */}
        {selectedTipo && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                2. Código Periodo (Año)
              </label>
              <select 
                value={selectedCodigoPeriodo} 
                onChange={handleCodigoPeriodoChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="">-- Seleccione Año --</option>
                {aniosDisponibles.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
              {aniosDisponibles.length === 0 && !loading && (
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#ef4444' }}>No hay periodos disponibles no posteados.</p>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                3. Secuencia a Abrir
              </label>
              <select 
                value={selectedSecuencia} 
                onChange={(e) => setSelectedSecuencia(e.target.value)}
                required
                disabled={!selectedCodigoPeriodo}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="">-- Seleccione Secuencia --</option>
                {secuenciasDisponibles.map(p => (
                  <option key={p.Secuencia} value={p.Secuencia}>
                    {p.Secuencia} - {p.Intervalo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* PASO 3: RESUMEN Y FECHA */}
        {selectedPeriodo && (
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#1e293b' }}>Resumen de la Nómina Seleccionada</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b' }}>Descripción</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#334155' }}>{selectedTipo.Descripcion}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b' }}>Intervalo del Periodo</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                  {formatDate(selectedPeriodo.FechaInicio)} AL {formatDate(selectedPeriodo.FechaFinal)}
                </p>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                4. Fecha del Pago
              </label>
              <input 
                type="date"
                required
                value={fechaPago}
                onChange={e => setFechaPago(e.target.value)}
                style={{ width: '50%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {/* ACCIONES */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
          <button 
            type="button"
            onClick={() => {
              setSelectedTipoNominaID('');
              setSelectedCodigoPeriodo('');
              setSelectedSecuencia('');
              setFechaPago('');
            }}
            style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading || !selectedPeriodo}
            style={{ 
              padding: '10px 24px', 
              background: (!loading && selectedPeriodo) ? '#3b82f6' : '#94a3b8', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: (!loading && selectedPeriodo) ? 'pointer' : 'not-allowed', 
              fontWeight: 'bold' 
            }}
          >
            Abrir Nómina
          </button>
        </div>

      </form>
    </div>
  );
};

export default AbrirNomina;
