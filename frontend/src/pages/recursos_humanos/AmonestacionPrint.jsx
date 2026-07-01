import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import './DesignacionPrint.css';

const AmonestacionPrint = () => {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [empresa, setEmpresa] = useState(null);
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
          axios.get('/api/amonestaciones?empresaId=1'),
          axios.get('/api/empleados?empresaId=1'),
          axios.get('/api/configuracion/tipos-acciones?empresaId=1'),
          axios.get('/api/configuracion/clasificaciones?empresaId=1'),
          axios.get('/api/configuracion/parametros-rrhh?empresaId=1').catch(() => ({ data: {} })),
          axios.get('/api/cargos?empresaId=1').catch(() => ({ data: [] })),
          axios.get('/api/empresas/1').catch(() => ({ data: null }))
        ]);
        
        const amonestacion = resAmonestaciones.data.find(a => String(a.AmonestacionID) === String(id));
        if (!amonestacion) throw new Error('Amonestación no encontrada');

        const empleado = resEmpleados.data.find(e => String(e.EmpleadoID) === String(amonestacion.EmpleadoID));
        if (!empleado) throw new Error('Empleado no encontrado');

        const tipoAccion = resTipos.data.find(t => String(t.TipoAccionID) === String(amonestacion.TipoAccionID));
        const clasificacion = resClasif.data.find(c => String(c.ClasificacionID) === String(amonestacion.ClasificacionID));

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
          Fecha: amonestacion.Fecha,
          AccionNumero: amonestacion.AmonestacionID,
          Efectividad: amonestacion.Fecha,
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
          AreaFuncional: empleado.DependenciaDesc || amonestacion.DependenciaDesc,
          Cargo: empleado.CargoDesc || amonestacion.CargoDesc,
          FechaIngreso: empleado.FechaIngreso,
          Sueldo: sueldoActual,
          TipoAccionDesc: tipoAccion ? tipoAccion.Descripcion : '',
          Grado: amonestacion.Grado,
          ClasificacionDesc: clasificacion ? clasificacion.Descripcion : ''
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
        }, 500);
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
          <div className="print-cell" style={{ borderRight: 'none', borderBottom: '1px solid #000', paddingBottom: '15px' }}>
            <label>13. Area Funcional</label>
            <div className="print-value" style={{ marginBottom: '10px' }}>{data.AreaFuncional?.toUpperCase() || 'N/A'}</div>
            <label>14. Cargo</label>
            <div className="print-value">{data.Cargo?.toUpperCase() || 'N/A'}</div>
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

      {/* Amonestacion specific fields */}
      <div className="print-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="print-cell" style={{ borderRight: '1px solid #000', padding: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>TIPO DE ACCIÓN SELECCIONADO</label>
          <div style={{ fontSize: '14px', marginTop: '10px' }}>{data.TipoAccionDesc}</div>
        </div>
        <div className="print-cell" style={{ borderRight: '1px solid #000', padding: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>GRADO SELECCIONADO</label>
          <div style={{ fontSize: '14px', marginTop: '10px' }}>{data.Grado}</div>
        </div>
        <div className="print-cell" style={{ borderRight: 'none', padding: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>CLASIFICACIÓN SELECCIONADA</label>
          <div style={{ fontSize: '14px', marginTop: '10px' }}>{data.ClasificacionDesc}</div>
        </div>
      </div>

      {/* C. FIRMAS */}
      <div className="print-section-title">
        C. FIRMAS
      </div>
      <div className="print-firmas-container" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', minHeight: '120px', padding: '20px', gap: '20px' }}>
        {firmas.map((firma, idx) => (
          <div key={idx} className="print-firma-box" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #000', width: '100%', marginBottom: '5px' }}></div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{firma.nombre}</div>
            <div style={{ fontSize: '12px' }}>{firma.cargo}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmonestacionPrint;
