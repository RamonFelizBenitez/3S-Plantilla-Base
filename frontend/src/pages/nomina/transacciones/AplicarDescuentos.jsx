import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const AplicarDescuentos = () => {
  const empresaId = '1';
  const [loading, setLoading] = useState(false);
  
  const [tiposNominas, setTiposNominas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  
  const [selectedTipoNominaId, setSelectedTipoNominaId] = useState('');
  const [selectedTransaccionId, setSelectedTransaccionId] = useState('');
  const [fechaAplicacion, setFechaAplicacion] = useState(new Date().toISOString().split('T')[0]);
  const [tipoIdentificador, setTipoIdentificador] = useState('Cedula');
  const [file, setFile] = useState(null);
  
  useEffect(() => {
    fetchTiposNominas();
    fetchTransacciones();
  }, []);

  const fetchTiposNominas = async () => {
    try {
      const res = await axios.get(`/api/configuracion/tipos-nominas?empresaId=${empresaId}`);
      setTiposNominas(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los tipos de nóminas', 'error');
    }
  };

  const fetchTransacciones = async () => {
    try {
      const res = await axios.get(`/api/tipos-transacciones?empresaId=${empresaId}`);
      setTransacciones(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los tipos de transacciones', 'error');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcesar = async () => {
    if (!selectedTipoNominaId) return Swal.fire('Atención', 'Seleccione un tipo de nómina.', 'warning');
    if (!selectedTransaccionId) return Swal.fire('Atención', 'Seleccione una transacción.', 'warning');
    if (!fechaAplicacion) return Swal.fire('Atención', 'Seleccione la fecha de aplicación.', 'warning');
    if (!file) return Swal.fire('Atención', 'Seleccione un archivo Excel.', 'warning');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        if (jsonData.length === 0) {
          return Swal.fire('Error', 'El archivo Excel está vacío.', 'error');
        }

        const firstRow = jsonData[0];
        if (!('Cedula / Codigo' in firstRow) || !('Monto' in firstRow)) {
          return Swal.fire('Error', 'El archivo Excel no tiene las columnas esperadas. Deben ser: "Cedula / Codigo", y "Monto".', 'error');
        }

        setLoading(true);
        const payload = {
          empresaId,
          tipoIdentificador,
          tipoNominaId: selectedTipoNominaId,
          tipoTransId: selectedTransaccionId,
          fechaAplicacion,
          filasExcel: jsonData
        };

        const res = await axios.post('/api/aplicar-descuentos/procesar', payload);
        
        Swal.fire({
          title: '¡Proceso Finalizado!',
          text: `Se aplicaron ${res.data.totalLineas} descuentos externos (novedades) con éxito.`,
          icon: 'success'
        });
        
        setFile(null);
        document.getElementById('excelFileInputDescuentos').value = '';

      } catch (err) {
        console.error(err);
        if (err.response && err.response.data && err.response.data.errores) {
          let htmlErrors = `<ul style="text-align: left; max-height: 200px; overflow-y: auto; font-size: 13px; color: #dc2626;">`;
          err.response.data.errores.forEach(e => htmlErrors += `<li>${e}</li>`);
          htmlErrors += `</ul>`;
          Swal.fire({
            title: 'Errores de Validación',
            html: htmlErrors,
            icon: 'error',
            width: '600px'
          });
        } else if (err.response && err.response.data && err.response.data.details) {
          Swal.fire('Error', `Ocurrió un error en el servidor: ${err.response.data.details}`, 'error');
        } else {
          Swal.fire('Error', 'Ocurrió un error al procesar el archivo Excel.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Aplicar Descuentos Externos</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Cargue un archivo Excel (.xlsx) para registrar descuentos (o transacciones) masivos como Novedades. El archivo debe contener: <strong>Cedula / Codigo</strong> y <strong>Monto</strong>.
        </p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Transacción a Aplicar
            </label>
            <select 
              value={selectedTransaccionId} 
              onChange={(e) => setSelectedTransaccionId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="">-- Seleccione una transacción --</option>
              {transacciones.map(t => (
                <option key={t.TipoTransId} value={t.TipoTransId}>
                  {t.TipoTransId} - {t.Descripcion}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Tipo de Nómina
            </label>
            <select 
              value={selectedTipoNominaId} 
              onChange={(e) => setSelectedTipoNominaId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="">-- Seleccione Tipo Nómina --</option>
              {tiposNominas.map(n => (
                <option key={n.TipoNominaID} value={n.TipoNominaID}>
                  {n.TipoNominaID} - {n.Descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Fecha de Aplicación
            </label>
            <input 
              type="date"
              value={fechaAplicacion}
              onChange={(e) => setFechaAplicacion(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
              Primera columna del Excel
            </label>
            <select 
              value={tipoIdentificador} 
              onChange={(e) => setTipoIdentificador(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="Cedula">Cédula</option>
              <option value="Codigo">Código de Empleado</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '30px', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '10px', cursor: 'pointer' }}>
            Seleccione o arrastre el archivo Excel
          </label>
          <input 
            id="excelFileInputDescuentos"
            type="file" 
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            style={{ display: 'block', margin: '0 auto', fontSize: '14px' }}
          />
          {file && <p style={{ marginTop: '10px', color: '#16a34a', fontWeight: 'bold', fontSize: '13px' }}>Archivo cargado: {file.name}</p>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleProcesar}
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
            {loading ? 'Procesando archivo...' : 'Procesar Descuentos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AplicarDescuentos;
