import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Empresas from './pages/administracion/Empresas';
import EmpresaInfo from './pages/administracion/EmpresaInfo';
import Usuarios from './pages/administracion/Usuarios';
import Perfiles from './pages/administracion/Perfiles';
import Permisos from './pages/administracion/Permisos';
import Continentes from './pages/administracion/Continentes';
import Paises from './pages/administracion/Paises';
import Ciudades from './pages/administracion/Ciudades';
import Municipios from './pages/administracion/Municipios';
import Secuencias from './pages/administracion/Secuencias';
import TiposTransacciones from './pages/nomina/configuracion/TiposTransacciones';
import ISR from './pages/nomina/configuracion/ISR';
import Ley8701 from './pages/nomina/configuracion/Ley8701';
import PeriodosNominas from './pages/nomina/configuracion/PeriodosNominas';
import AbrirNomina from './pages/nomina/transacciones/AbrirNomina';
import CerrarNomina from './pages/nomina/transacciones/CerrarNomina';
import SubirNominaExcel from './pages/nomina/transacciones/SubirNominaExcel';
import AplicarDescuentos from './pages/nomina/transacciones/AplicarDescuentos';
import GenerarNomina from './pages/nomina/procesos/GenerarNomina';
import ArchivoBanco from './pages/nomina/procesos/ArchivoBanco';
import PeriodosContables from './pages/administracion/PeriodosContables';
import CatalogoCuentas from './pages/administracion/CatalogoCuentas';
import Monedas from './pages/administracion/Monedas';
import DepartamentosContables from './pages/administracion/DepartamentosContables';
import CentroCostos from './pages/administracion/CentroCostos';
import Propositos from './pages/administracion/Propositos';
import UnidadesMedidas from './pages/administracion/UnidadesMedidas';
import ConversionUnidades from './pages/administracion/ConversionUnidades';
import Cargos from './pages/nomina/Cargos';
import Solicitudes from './pages/recursos_humanos/Solicitudes';
import InfoComplementariaGen from './pages/recursos_humanos/InfoComplementariaGen';
import GruposOcupacionales from './pages/recursos_humanos/GruposOcupacionales';
import Sedes from './pages/recursos_humanos/Sedes';
import TiposAcciones from './pages/recursos_humanos/TiposAcciones';
import Turnos from './pages/recursos_humanos/Turnos';
import Direcciones from './pages/recursos_humanos/Direcciones';
import Designaciones from './pages/recursos_humanos/Designaciones';
import DesignacionPrint from './pages/recursos_humanos/DesignacionPrint';
import CambioPrint from './pages/recursos_humanos/CambioPrint';
import AmonestacionPrint from './pages/recursos_humanos/AmonestacionPrint';
import VacacionPrint from './pages/recursos_humanos/VacacionPrint';
import TiposNominas from './pages/recursos_humanos/TiposNominas';
import ParametrosRRHH from './pages/recursos_humanos/ParametrosRRHH';
import Clasificaciones from './pages/recursos_humanos/Clasificaciones';
import Separaciones from './pages/recursos_humanos/Separaciones';
import Amonestaciones from './pages/recursos_humanos/Amonestaciones';
import Vacaciones from './pages/recursos_humanos/Vacaciones';
import Ausencias from './pages/recursos_humanos/Ausencias';
import AusenciaPrint from './pages/recursos_humanos/AusenciaPrint';
import Empleados from './pages/nomina/Empleados';
import ParametrosNomina from './pages/nomina/configuracion/ParametrosNomina';
import Cambios from './pages/recursos_humanos/Cambios';
import Placeholder from './pages/Placeholder';

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/imprimir/designacion/:id" element={<DesignacionPrint />} />
          <Route path="/imprimir/cambio/:id" element={<CambioPrint />} />
          <Route path="/imprimir/amonestacion/:id" element={<AmonestacionPrint />} />
          <Route path="/imprimir/vacacion/:id" element={<VacacionPrint />} />
          <Route path="/imprimir/ausencia/:id" element={<AusenciaPrint />} />
          
          {/* Rutas Protegidas (simuladas aquí, idealmente usar un componente PrivateRoute) */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Módulo RECURSOS HUMANOS -> Solicitudes y Personal */}
            <Route path="solicitudes" element={<Placeholder title="Solicitudes" />} />
            <Route path="personal" element={<Placeholder title="Personal" />} />
            
            {/* ACCIONES (RRHH) */}
            <Route path="designacion" element={<Placeholder title="Designación" />} />
            <Route path="cambios" element={<Cambios />} />
            <Route path="amonestaciones" element={<Amonestaciones />} />
            <Route path="vacaciones" element={<Vacaciones />} />
            <Route path="ausencias" element={<Ausencias />} />
            
            {/* INFORMES (RRHH) */}
            <Route path="informes/solicitudes" element={<Placeholder title="Lista de Solicitudes" />} />
            <Route path="informes/empleados" element={<Placeholder title="Lista de Empleados" />} />
            <Route path="informes/acciones" element={<Placeholder title="Lista de Acciones" />} />
            
            {/* INFORMACIÓN COMPLEMENTARIA (RRHH) */}
            <Route path="recursos-humanos/info/parentescos" element={<InfoComplementariaGen title="Parentescos" endpoint="parentescos" idField="ParentescoID" />} />
            <Route path="recursos-humanos/info/niveles-academicos" element={<InfoComplementariaGen title="Niveles Académicos" endpoint="niveles-academicos" idField="NivelAcademicoID" />} />
            <Route path="recursos-humanos/info/titulos-academicos" element={<InfoComplementariaGen title="Títulos Académicos" endpoint="titulos-academicos" idField="TituloAcademicoID" />} />
            <Route path="recursos-humanos/info/idiomas" element={<InfoComplementariaGen title="Idiomas" endpoint="idiomas" idField="IdiomaID" />} />
            <Route path="recursos-humanos/info/traducciones" element={<InfoComplementariaGen title="Niveles de Traducción" endpoint="traducciones" idField="NivelTraduccionID" />} />
            <Route path="recursos-humanos/info/actividades" element={<InfoComplementariaGen title="Actividades" endpoint="actividades" idField="ActividadID" />} />

            {/* CONFIGURACIÓN (RRHH) */}
            <Route path="recursos-humanos/acciones/solicitud" element={<Solicitudes />} />
            <Route path="recursos-humanos/acciones/designacion" element={<Designaciones />} />
            <Route path="recursos-humanos/acciones/toma-posesion" element={<Placeholder title="Toma de Posesión" />} />
            <Route path="configuracion/cargos" element={<Cargos />} />
            <Route path="recursos-humanos/designacion" element={<Designaciones />} />
            <Route path="cambios" element={<Cambios />} />
            <Route path="separacion" element={<Separaciones />} />

            <Route path="recursos-humanos/info/dependientes" element={<Placeholder title="Dependientes" />} />
            <Route path="configuracion/sedes" element={<Sedes />} />
            <Route path="configuracion/grupos-ocupacionales" element={<GruposOcupacionales />} />
            <Route path="/configuracion/tipos-acciones" element={<TiposAcciones />} />
            <Route path="/configuracion/parametros" element={<ParametrosRRHH />} />
            <Route path="/configuracion/clasificaciones" element={<Clasificaciones />} />
            <Route path="/nomina/empleados" element={<Empleados />} />
            
            {/* RUTAS NÓMINA - TRANSACCIONES */}
            <Route path="nomina/transacciones/abrir" element={<AbrirNomina />} />
            <Route path="nomina/transacciones/subir-excel" element={<SubirNominaExcel />} />
            <Route path="nomina/transacciones/aplicar-descuentos" element={<AplicarDescuentos />} />

            {/* Calculos */}
            <Route path="nomina/calculos/bonificaciones" element={<Placeholder title="Cálculo de bonificaciones" />} />
            <Route path="nomina/calculos/vacaciones" element={<Placeholder title="Cálculo de vacaciones" />} />
            <Route path="nomina/calculos/regalia" element={<Placeholder title="Cálculo de regalía pascual" />} />

            {/* RUTAS NÓMINA - PROCESOS */}
            <Route path="nomina/proceso/generar" element={<GenerarNomina />} />
            <Route path="nomina/proceso/cerrar" element={<CerrarNomina />} />
            <Route path="nomina/procesos/calculo-isr" element={<Placeholder title="Cálculo del ISR" />} />
            <Route path="nomina/proceso/archivo-banco" element={<ArchivoBanco />} />
            <Route path="nomina/proceso/entrada-diarios" element={<Placeholder title="Generar entrada de diarios" />} />

            {/* Informes (Nómina) */}
            <Route path="nomina/informes/detallada" element={<Placeholder title="Nómina detallada" />} />
            <Route path="nomina/informes/resumen" element={<Placeholder title="Resumen de nómina" />} />
            <Route path="nomina/informes/transacciones" element={<Placeholder title="Transacciones de nómina" />} />
            <Route path="nomina/informes/volantes" element={<Placeholder title="Volantes de pago" />} />
            <Route path="nomina/informes/tesoreria" element={<Placeholder title="Generar reporte de tesorería" />} />

            <Route path="nomina/configuracion/tipos-transacciones" element={<TiposTransacciones />} />
            <Route path="nomina/configuracion/tipos-nominas" element={<TiposNominas />} />
            <Route path="nomina/configuracion/contabilizacion" element={<Placeholder title="Contabilización de nóminas" />} />
            <Route path="nomina/configuracion/cargos" element={<Cargos />} />
            <Route path="nomina/configuracion/isr" element={<ISR />} />
            <Route path="nomina/configuracion/ley8701" element={<Ley8701 />} />
            <Route path="nomina/configuracion/periodos" element={<PeriodosNominas />} />
            <Route path="nomina/configuracion/param-bonificacion" element={<Placeholder title="Parámetros de bonificación" />} />
            <Route path="nomina/configuracion/parametros" element={<ParametrosNomina />} />
            
            {/* ============================================================== */}
          {/* MÓDULO ADMINISTRACIÓN DEL SISTEMA (Reemplaza Seguridad) */}
          {/* ============================================================== */}
          
          {/* Carpeta Empresa */}
          <Route path="administracion/empresa/seleccionar" element={<Placeholder title="Seleccionar Empresa" />} />
          <Route path="administracion/empresa/empresas" element={<Empresas />} />
          <Route path="administracion/empresa/informacion" element={<EmpresaInfo />} />

          {/* Carpeta Gestión de Usuarios */}
          <Route path="administracion/usuarios/usuarios" element={<Usuarios />} />
          <Route path="administracion/usuarios/perfiles" element={<Perfiles />} />
          <Route path="administracion/usuarios/permisos" element={<Permisos />} />

          {/* Carpeta General */}
          <Route path="administracion/general/catalogo-cuentas" element={<CatalogoCuentas />} />
          <Route path="administracion/general/secuencias-numericas" element={<Secuencias />} />
          <Route path="administracion/general/monedas" element={<Monedas />} />
          <Route path="administracion/general/periodos-contables" element={<PeriodosContables />} />
          <Route path="administracion/general/parametros-generales" element={<Placeholder title="Parámetros Generales" />} />
          <Route path="administracion/general/impuestos" element={<Placeholder title="Impuestos" />} />
          <Route path="administracion/general/continentes" element={<Continentes />} />
          <Route path="administracion/general/paises" element={<Paises />} />
          <Route path="administracion/general/ciudades" element={<Ciudades />} />
          <Route path="administracion/general/municipios" element={<Municipios />} />
          <Route path="administracion/general/departamentos-contables" element={<DepartamentosContables />} />
          <Route path="administracion/general/centro-costo" element={<CentroCostos />} />
          <Route path="administracion/general/proposito-contable" element={<Propositos />} />
          <Route path="administracion/general/unidades-medidas" element={<UnidadesMedidas />} />
          <Route path="administracion/general/conversion-unidades" element={<ConversionUnidades />} />
          <Route path="nomina/cargos" element={<Cargos />} />
          
          <Route path="recursos-humanos/solicitudes" element={<Solicitudes />} />
          <Route path="recursos-humanos/designaciones" element={<Designaciones />} />
          
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;
