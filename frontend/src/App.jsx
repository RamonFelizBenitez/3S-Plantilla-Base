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
import PeriodosContables from './pages/administracion/PeriodosContables';
import CatalogoCuentas from './pages/administracion/CatalogoCuentas';
import Monedas from './pages/administracion/Monedas';
import DepartamentosContables from './pages/administracion/DepartamentosContables';
import CentroCostos from './pages/administracion/CentroCostos';
import Propositos from './pages/administracion/Propositos';
import UnidadesMedidas from './pages/administracion/UnidadesMedidas';
import ConversionUnidades from './pages/administracion/ConversionUnidades';
import Placeholder from './pages/Placeholder';

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Protegidas (simuladas aquí, idealmente usar un componente PrivateRoute) */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Módulo RECURSOS HUMANOS -> Solicitudes y Personal */}
            <Route path="solicitudes" element={<Placeholder title="Solicitudes" />} />
            <Route path="personal" element={<Placeholder title="Personal" />} />
            
            {/* ACCIONES (RRHH) */}
            <Route path="designacion" element={<Placeholder title="Designación" />} />
            <Route path="cambios" element={<Placeholder title="Cambios" />} />
            <Route path="separacion" element={<Placeholder title="Separación de Servicios" />} />
            <Route path="amonestaciones" element={<Placeholder title="Amonestaciones" />} />
            <Route path="vacaciones" element={<Placeholder title="Vacaciones" />} />
            <Route path="ausencias" element={<Placeholder title="Registro de Ausencias" />} />
            
            {/* INFORMES (RRHH) */}
            <Route path="informes/solicitudes" element={<Placeholder title="Lista de Solicitudes" />} />
            <Route path="informes/empleados" element={<Placeholder title="Lista de Empleados" />} />
            <Route path="informes/acciones" element={<Placeholder title="Lista de Acciones" />} />
            
            {/* CONFIGURACIÓN (RRHH) */}
            <Route path="configuracion/cargos" element={<Placeholder title="Cargos" />} />
            <Route path="configuracion/direcciones" element={<Placeholder title="Direcciones" />} />
            <Route path="configuracion/tipos-acciones" element={<Placeholder title="Tipos de Acciones" />} />
            <Route path="configuracion/parametros" element={<Placeholder title="Parámetros" />} />

            {/* MÓDULO NÓMINA */}
            <Route path="nomina/empleados" element={<Placeholder title="Empleados" />} />
            
            {/* Transacciones de nomina */}
            <Route path="nomina/transacciones/abrir" element={<Placeholder title="Abrir nómina" />} />
            <Route path="nomina/transacciones/subir-excel" element={<Placeholder title="Subir nómina desde Excel" />} />
            <Route path="nomina/transacciones/aplicar-descuentos" element={<Placeholder title="Aplicar descuentos externo" />} />

            {/* Calculos */}
            <Route path="nomina/calculos/bonificaciones" element={<Placeholder title="Cálculo de bonificaciones" />} />
            <Route path="nomina/calculos/vacaciones" element={<Placeholder title="Cálculo de vacaciones" />} />
            <Route path="nomina/calculos/regalia" element={<Placeholder title="Cálculo de regalía pascual" />} />

            {/* Proceso */}
            <Route path="nomina/proceso/generar" element={<Placeholder title="Generar nómina" />} />
            <Route path="nomina/proceso/cerrar" element={<Placeholder title="Cerrar nómina" />} />
            <Route path="nomina/proceso/archivo-banco" element={<Placeholder title="Generar archivo de banco" />} />
            <Route path="nomina/proceso/entrada-diarios" element={<Placeholder title="Generar entrada de diarios" />} />

            {/* Informes (Nómina) */}
            <Route path="nomina/informes/detallada" element={<Placeholder title="Nómina detallada" />} />
            <Route path="nomina/informes/resumen" element={<Placeholder title="Resumen de nómina" />} />
            <Route path="nomina/informes/transacciones" element={<Placeholder title="Transacciones de nómina" />} />
            <Route path="nomina/informes/volantes" element={<Placeholder title="Volantes de pago" />} />
            <Route path="nomina/informes/tesoreria" element={<Placeholder title="Generar reporte de tesorería" />} />

            {/* Configuración (Nómina) */}
            <Route path="nomina/configuracion/tipos-transacciones" element={<Placeholder title="Tipos de transacciones" />} />
            <Route path="nomina/configuracion/tipos-nominas" element={<Placeholder title="Tipos de nóminas" />} />
            <Route path="nomina/configuracion/contabilizacion" element={<Placeholder title="Contabilización de nóminas" />} />
            <Route path="nomina/configuracion/cargos" element={<Placeholder title="Cargos" />} />
            <Route path="nomina/configuracion/isr" element={<Placeholder title="ISR" />} />
            <Route path="nomina/configuracion/ley8701" element={<Placeholder title="LEY 87-01" />} />
            <Route path="nomina/configuracion/periodos" element={<Placeholder title="Periodos de nóminas" />} />
            <Route path="nomina/configuracion/param-bonificacion" element={<Placeholder title="Parámetros de bonificación" />} />
            <Route path="nomina/configuracion/parametros" element={<Placeholder title="Parámetros" />} />
            
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
          
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;
