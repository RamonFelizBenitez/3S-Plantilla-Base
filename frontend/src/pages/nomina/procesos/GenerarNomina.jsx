import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from '../../../components/common/DataTable';

const GenerarNomina = () => {
  const empresaId = '1';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroPosteado, setFiltroPosteado] = useState(false); // false = Abiertas, true = Cerradas
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const fetchNominas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/generar-nomina?EmpresaID=${empresaId}&posteado=${filtroPosteado}`);
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar las nóminas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominas();
  }, [filtroPosteado]);

  const handleProcesar = async (nomina) => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setProgressMessage('Iniciando procesamiento...');

      const response = await fetch('/api/generar-nomina/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          EmpresaID: empresaId,
          CodigoPeriodo: nomina.CodigoPeriodo,
          NominaNumero: nomina.NominaNumero,
          TipoNominaId: nomina.TipoNominaId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error del servidor al iniciar proceso');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      let finalData = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep the incomplete line in the buffer
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.type === 'progress') {
                const pct = Math.round((data.procesados / data.total) * 100);
                setProgress(pct);
                setProgressMessage(`Procesando empleado ${data.currentEmp} (${data.procesados}/${data.total})...`);
              } else if (data.type === 'done') {
                finalData = data;
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
               console.error('Error parseando chunk:', e);
            }
          }
        }
      }

      if (finalData) {
        let htmlMessage = `<p>${finalData.message}</p>`;
        if (finalData.warnings && finalData.warnings.length > 0) {
          htmlMessage += `<div style="text-align: left; max-height: 200px; overflow-y: auto; background: #fffbeb; border: 1px solid #fde68a; padding: 10px; margin-top: 15px; border-radius: 4px;">`;
          htmlMessage += `<h4 style="margin-top:0; color: #d97706;">Avisos:</h4><ul style="margin:0; padding-left: 20px; color: #b45309; font-size: 13px;">`;
          finalData.warnings.forEach(w => {
            htmlMessage += `<li>${w}</li>`;
          });
          htmlMessage += `</ul></div>`;
        }

        Swal.fire({
          title: 'Proceso Finalizado',
          html: htmlMessage,
          icon: finalData.warnings && finalData.warnings.length > 0 ? 'warning' : 'success',
          width: '600px'
        });
      }

    } catch (err) {
      console.error(err);
      Swal.fire('Proceso Detenido', err.message || 'Error al validar el período', 'error');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.substring(0, 10);
  };

  const columns = [
    { header: 'Código Periodo', accessor: 'CodigoPeriodo' },
    { header: 'No. Nómina', accessor: 'NominaNumero' },
    { 
      header: 'Fecha Inicio', 
      render: (row) => formatDate(row.FechaInicial)
    },
    { 
      header: 'Fecha Fin', 
      render: (row) => formatDate(row.FechaFinal)
    },
    { header: 'Descripción', accessor: 'Descripcion' },
    {
      header: 'Estado',
      render: (row) => (
        <span style={{ 
          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
          background: row.Posteado ? '#f1f5f9' : '#dcfce7',
          color: row.Posteado ? '#64748b' : '#166534'
        }}>
          {row.Posteado ? 'Cerrada' : 'Abierta'}
        </span>
      )
    },
    {
      header: 'Acciones',
      render: (row) => (
        <button
          onClick={() => handleProcesar(row)}
          disabled={row.Posteado || isProcessing}
          style={{
            padding: '6px 12px',
            background: (row.Posteado || isProcessing) ? '#e2e8f0' : '#3b82f6',
            color: (row.Posteado || isProcessing) ? '#94a3b8' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: (row.Posteado || isProcessing) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          Procesar
        </button>
      )
    }
  ];

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Generar Nómina</h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Listado de nóminas listas para ser procesadas y calculadas.
          </p>
        </div>
        
        <div>
          <label style={{ marginRight: '10px', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Mostrar:</label>
          <select 
            value={filtroPosteado ? 'true' : 'false'}
            onChange={(e) => setFiltroPosteado(e.target.value === 'true')}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: '500' }}
          >
            <option value="false">Abiertas</option>
            <option value="true">Cerradas</option>
          </select>
        </div>
      </div>

      {isProcessing && (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{progressMessage}</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6' }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#3b82f6', transition: 'width 0.2s ease-out' }}></div>
          </div>
        </div>
      )}

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
      />
    </div>
  );
};

export default GenerarNomina;
