import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const SubirNominaExcel = () => {
  const empresaId = '1';
  const [loading, setLoading] = useState(false);
  const [nominasAbiertas, setNominasAbiertas] = useState([]);
  
  const [selectedNominaId, setSelectedNominaId] = useState('');
  const [tipoIdentificador, setTipoIdentificador] = useState('Cedula');
  const [file, setFile] = useState(null);
  
  useEffect(() => {
    fetchNominasAbiertas();
  }, []);

  const fetchNominasAbiertas = async () => {
    try {
      const res = await axios.get(`/api/generar-nomina?EmpresaID=${empresaId}&posteado=false`);
      setNominasAbiertas(res.data.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar las nóminas abiertas', 'error');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcesar = async () => {
    if (!selectedNominaId) {
      return Swal.fire('Atención', 'Seleccione una nómina abierta.', 'warning');
    }
    if (!file) {
      return Swal.fire('Atención', 'Seleccione un archivo Excel.', 'warning');
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON (assuming row 1 is headers)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        if (jsonData.length === 0) {
          return Swal.fire('Error', 'El archivo Excel está vacío.', 'error');
        }

        // Validate headers loosely
        const firstRow = jsonData[0];
        if (!('Cedula / Codigo' in firstRow) || !('Transaccion' in firstRow) || !('Monto' in firstRow)) {
          return Swal.fire('Error', 'El archivo Excel no tiene las columnas esperadas. Deben ser: "Cedula / Codigo", "Transaccion", "Monto".', 'error');
        }

        const nominaSeleccionada = nominasAbiertas.find(n => `${n.NominaNumero}-${n.TipoNominaId}` === selectedNominaId);

        // Send to backend
        setLoading(true);
        const payload = {
          empresaId,
          tipoIdentificador,
          nominaAbierta: nominaSeleccionada,
          filasExcel: jsonData
        };

        const res = await axios.post('/api/subir-nomina-excel/procesar', payload);
        
        Swal.fire({
          title: '¡Proceso Finalizado!',
          text: `Se cargaron ${res.data.totalEmpleados} empleados y ${res.data.totalLineas} transacciones con éxito.`,
          icon: 'success'
        });
        
        setFile(null);
        document.getElementById('excelFileInput').value = '';
        setSelectedNominaId('');

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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Subir Nómina desde Excel</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Cargue un archivo Excel (.xlsx) para poblar directamente una nómina abierta. El archivo debe contener las columnas: <strong>Cedula / Codigo</strong>, <strong>Transaccion</strong>, y <strong>Monto</strong>.
        </p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            Nómina Abierta de Destino
          </label>
          <select 
            value={selectedNominaId} 
            onChange={(e) => setSelectedNominaId(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
          >
            <option value="">-- Seleccione la nómina abierta --</option>
            {nominasAbiertas.map(n => (
              <option key={`${n.NominaNumero}-${n.TipoNominaId}`} value={`${n.NominaNumero}-${n.TipoNominaId}`}>
                {n.TipoNominaId} - No. {n.NominaNumero} (Período: {n.CodigoPeriodo} - Sec: {n.Secuencia})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
            ¿Qué contiene la primera columna del Excel?
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

        <div style={{ marginBottom: '30px', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '10px', cursor: 'pointer' }}>
            Seleccione o arrastre el archivo Excel
          </label>
          <input 
            id="excelFileInput"
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
            {loading ? 'Procesando archivo...' : 'Procesar Nómina'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubirNominaExcel;
