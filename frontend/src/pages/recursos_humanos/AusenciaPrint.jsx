import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './DesignacionPrint.css';

const AusenciaPrint = () => {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [tiposAcciones, setTiposAcciones] = useState([]);
  const [firmas, setFirmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrintData = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const f1 = queryParams.get('f1') === 'true';
        const f2 = queryParams.get('f2') === 'true';
        const f3 = queryParams.get('f3') === 'true';

        const [resAmonestaciones, resEmpleados, resTipos, resClasif, resParam, resCargos, resEmpresa] = await Promise.all([
          axios.get('/api/ausencias?empresaId=1'),
          axios.get('/api/empleados?empresaId=1'),
          axios.get('/api/configuracion/tipos-acciones?empresaId=1'),
          axios.get('/api/configuracion/clasificaciones?empresaId=1'),
          axios.get('/api/configuracion/parametros-rrhh?empresaId=1').catch(() => ({ data: {} })),
          axios.get('/api/cargos?empresaId=1').catch(() => ({ data: [] })),
          axios.get('/api/empresas/1').catch(() => ({ data: null }))
        ]);
        
        const ausencia = resAmonestaciones.data.find(a => String(a.AusenciaID) === String(id));
        if (!ausencia) throw new Error('Vacación no encontrada');

        const empleado = resEmpleados.data.find(e => String(e.EmpleadoID) === String(ausencia.EmpleadoID));
        if (!empleado) throw new Error('Empleado no encontrado');

        const tipoAccion = resTipos.data.find(t => String(t.TipoAccionID) === String(ausencia.TipoAccionID));
        const clasificacion = resClasif.data.find(c => String(c.ClasificacionID) === String(ausencia.ClasificacionID));

        if (Array.isArray(resTipos.data)) {
          setTiposAcciones(resTipos.data.filter(ta => ta.TipoAccionID >= 60 && ta.TipoAccionID <= 69));
        }

        let sueldoActual = 0;
        try {
          const resSalario = await axios.get(`/api/empleados/${empleado.EmpleadoID}/salario?empresaId=1`);
          if (resSalario.data && resSalario.data.length > 0) {
            const salarioActivo = resSalario.data.find(s => s.SueldoActivo === true || s.SueldoActivo === 1);
            sueldoActual = salarioActivo ? salarioActivo.Valor : resSalario.data[0].Valor;
          }
        } catch (e) {
           console.log(e);
        }

        const printData = {
          Fecha: ausencia.FechaRegistro || ausencia.FechaDesde,
          AccionNumero: ausencia.AusenciaID,
          Efectividad: ausencia.FechaDesde,
          Apellidos: empleado.Apellido1 + ' ' + (empleado.Apellido2 || ''),
          Nombres: empleado.Nombres,
          Cedula: empleado.Cedula,
          Codigo: empleado.Codigo || empleado.EmpleadoID,
          EstadoCivil: empleado.EstadoCivil,
          FechaNacimiento: empleado.FechaNacimiento,
          Nacionalidad: empleado.Nacionalidad,
          Sexo: empleado.Sexo,
          Direccion: empleado.Direccion,
          Telefono: empleado.Telefono,
          Celular: empleado.Celular,
          AreaFuncional: empleado.DependenciaDesc || ausencia.DependenciaDesc,
          Cargo: empleado.CargoDesc || ausencia.CargoDesc,
          FechaIngreso: empleado.FechaIngreso,
          Sueldo: sueldoActual,
          TipoAccionID: ausencia.TipoAccionID,
          TipoAccionDesc: tipoAccion ? tipoAccion.Descripcion : '',
          FechaDesde: ausencia.FechaDesde,
          FechaHasta: ausencia.FechaHasta
        };

        setData(printData);
        setEmpresa(resEmpresa.data);
        
        // Procesar firmas seleccionadas
        const paramsData = resParam.data || {};
        const cargosList = Array.isArray(resCargos.data) ? resCargos.data : [];
        const getCargoDesc = (cargoId) => {
          const cargo = cargosList.find(c => String(c.CargoID) === String(cargoId));
          return cargo ? cargo.Descripcion : 'CARGO NO ASIGNADO';
        };

        const firmasArr = [];
        if (f1) firmasArr.push({ nombre: paramsData.Firma1 || '', cargo: getCargoDesc(paramsData.CargoIDFirma1) });
        if (f2) firmasArr.push({ nombre: paramsData.Firma2 || '', cargo: getCargoDesc(paramsData.CargoIDFirma2) });
        if (f3) firmasArr.push({ nombre: paramsData.Firma3 || '', cargo: getCargoDesc(paramsData.CargoIDFirma3) });
        
        setFirmas(firmasArr);

        setLoading(false);
        setTimeout(() => {
          window.print();
        }, 700);
      } catch (err) {
        setError(err.message || 'Error cargando datos de impresión');
        setLoading(false);
      }
    };

    fetchPrintData();
  }, [id, location.search]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Preparando documento para impresión...</div>;
  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!data) return null;

  // Helpers for formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const formatSueldo = (sueldo) => {
    if (!sueldo) return '0.00';
    return Number(sueldo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const halfLength = Math.ceil(tiposAcciones.length / 2);
  const col1 = tiposAcciones.slice(0, halfLength);
  const col2 = tiposAcciones.slice(halfLength);

  return (
    <div className="print-container">
      <div className="print-header">
        <div className="print-header-logo">
          {empresa && empresa.Logo ? (
            <img src={empresa.Logo} alt="Logo Empresa" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
          ) : (
            <>
              <div className="logo-placeholder">
                <span style={{color:'#84cc16', fontWeight:'bold', fontSize:'20px'}}>C</span>
                <span style={{color:'#3b82f6', fontWeight:'bold', fontSize:'20px'}}>N</span>
                <span style={{color:'#eab308', fontWeight:'bold', fontSize:'20px'}}>E</span>
              </div>
              <div>
                <strong>COMISIÓN</strong><br/>
                <strong>NACIONAL DE</strong><br/>
                <strong>ENERGÍA</strong>
              </div>
            </>
          )}
        </div>
        <div className="print-header-title">
          <h3>GERENCIA DE RECURSOS HUMANOS</h3>
          <h2>ACCION DE PERSONAL</h2>
        </div>
        <div className="print-header-info">
          <div><span>1. Fecha</span> <span>{formatDate(data.Fecha)}</span></div>
          <div><span>2. Acción Número</span> <span>{data.AccionNumero}</span></div>
          <div><span>3. Efectividad</span> <span>{formatDate(data.Efectividad)}</span></div>
        </div>
      </div>

      <div className="print-row grid-4">
        <div className="print-cell">
          <label>4. Apellidos</label>
          <div className="print-value">{data.Apellidos?.toUpperCase() || 'N/A'}</div>
        </div>
        <div className="print-cell">
          <label>5. Nombres</label>
          <div className="print-value">{data.Nombres?.toUpperCase() || 'N/A'}</div>
        </div>
        <div className="print-cell">
          <label>6. Cédula</label>
          <div className="print-value">{data.Cedula || 'N/A'}</div>
        </div>
        <div className="print-cell">
          <label>7. Código</label>
          <div className="print-value">{data.Codigo || 'N/A'}</div>
        </div>
      </div>

      <div className="print-row grid-4">
        <div className="print-cell">
          <label>8. Estado Civil</label>
          <div className="print-value">{data.EstadoCivil === 1 ? 'Soltero(a)' : data.EstadoCivil === 2 ? 'Casado(a)' : data.EstadoCivil === 3 ? 'Unido(a)' : 'N/A'}</div>
        </div>
        <div className="print-cell">
          <label>9. Fecha Nacimiento</label>
          <div className="print-value">{formatDate(data.FechaNacimiento) || 'N/A'}</div>
        </div>
        <div className="print-cell">
          <label>10. Nacionalidad</label>
          <div className="print-value">{data.Nacionalidad?.toUpperCase() || 'DOMINICANO'}</div>
        </div>
        <div className="print-cell">
          <label>11. Sexo</label>
          <div className="print-value">{data.Sexo === 1 ? 'Masculino' : data.Sexo === 2 ? 'Femenino' : 'N/A'}</div>
        </div>
      </div>

      <div className="print-row">
        <div className="print-cell" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <label>12. Direccion</label>
            <span className="print-value" style={{ marginLeft: '10px' }}>{data.Direccion?.toUpperCase() || 'N/A'}</span>
          </div>
          <div>
            <span>Telefono: {data.Telefono || 'N/A'}</span>
            <span style={{ marginLeft: '20px' }}>Celular: {data.Celular || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="print-row" style={{ display: 'grid', gridTemplateColumns: '75% 25%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #000' }}>
          <div className="print-cell" style={{ borderRight: 'none', borderBottom: '1px solid #000', padding: 0, display: 'flex' }}>
            <div style={{ flex: 1, padding: '15px', borderRight: '1px solid #000' }}>
              <label>13. Area Funcional</label>
              <div className="print-value" style={{ marginBottom: '10px' }}>{data.AreaFuncional?.toUpperCase() || 'N/A'}</div>
              <label>14. Cargo</label>
              <div className="print-value">{data.Cargo?.toUpperCase() || 'N/A'}</div>
            </div>
            <div style={{ flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>FECHA INICIO</label>
                <div className="print-value" style={{ marginTop: '5px' }}>{formatDate(data.FechaDesde)}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>FECHA FIN</label>
                <div className="print-value" style={{ marginTop: '5px' }}>{formatDate(data.FechaHasta)}</div>
              </div>
            </div>
          </div>
          
          <div className="print-cell grid-3" style={{ borderRight: 'none', borderBottom: '1px solid #000' }}>
            <div>
              <label>15. Fecha Ingreso</label>
              <div className="print-value">{formatDate(data.FechaIngreso) || 'N/A'}</div>
            </div>
            <div>
              <label>16. Sede</label>
              <div className="print-value">SEDE PRINCIPAL</div>
            </div>
            <div>
              <label>17. Sueldo RD$</label>
              <div className="print-value">{formatSueldo(data.Sueldo)}</div>
            </div>
          </div>

          <div className="print-cell grid-3" style={{ borderRight: 'none' }}>
            <div>
              <label>18. Nivel Académico</label>
              <div className="print-value">Secundaria</div>
            </div>
            <div>
              <label>19. Años de Servicios para el Estado</label>
              <div className="print-value">0 Años 0 Meses</div>
            </div>
            <div>
              <label>20. Total Años CNE</label>
              <div className="print-value">0 Años 0 Meses</div>
            </div>
          </div>
        </div>

        <div className="print-cell" style={{ borderRight: 'none', padding: 0 }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #000', padding: '10px 5px' }}>
            Modalidad Laboral
          </div>
          <div style={{ padding: '20px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span>21. Trabajo Presencial</span>
              <div className="print-checkbox checked"></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>22. Teletrabajo</span>
              <div className="print-checkbox"></div>
            </div>
          </div>
        </div>
      </div>

      {/* B. NATURALEZA DE LA ACCION */}
      <div className="print-section-title">
        B. NATURALEZA DE LA ACCION
      </div>

      <div className="print-row" style={{ flexDirection: 'column', flex: 1, borderBottom: 'none' }}>
        <div className="print-cell" style={{ borderRight: 'none', borderBottom: '1px solid #000' }}>
          <label style={{ fontSize: '13px' }}>11. AUSENCIAS</label>
          <div className="grid-2" style={{ marginTop: '10px', padding: '0 20px', paddingBottom: '5px' }}>
            <div>
              {col1.map((ta) => (
                <div key={ta.TipoAccionID} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div className={`print-checkbox ${data.TipoAccionID === ta.TipoAccionID ? 'checked' : ''}`}></div> 
                  <span style={{ fontSize: '12px' }}>{ta.Descripcion}</span>
                </div>
              ))}
            </div>
            <div>
              {col2.map((ta) => (
                <div key={ta.TipoAccionID} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div className={`print-checkbox ${data.TipoAccionID === ta.TipoAccionID ? 'checked' : ''}`}></div> 
                  <span style={{ fontSize: '12px' }}>{ta.Descripcion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Firmas Dinámicas conectadas al bloque anterior */}
      <div className="print-row" style={{ minHeight: '90px', display: 'flex', borderBottom: 'none' }}>
        {firmas.map((firma, idx) => (
          <div key={idx} className="print-cell" style={{ 
            flex: 1, 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            paddingBottom: '10px',
            borderRight: idx === firmas.length - 1 ? 'none' : '1px solid #000'
          }}>
            <div style={{ borderBottom: '1px solid #000', width: '80%', marginTop: '30px' }}></div>
            <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>{firma.nombre.toUpperCase()}</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>{firma.cargo.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AusenciaPrint;
