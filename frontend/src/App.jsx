import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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
          <Route path="administracion/empresa/empresas" element={<Placeholder title="Empresas" />} />
          <Route path="administracion/empresa/informacion" element={<Placeholder title="Información de la Empresa" />} />

          {/* Carpeta Gestión de Usuarios */}
          <Route path="administracion/usuarios/usuarios" element={<Placeholder title="Usuarios" />} />
          <Route path="administracion/usuarios/perfiles" element={<Placeholder title="Perfiles de Usuarios" />} />
          <Route path="administracion/usuarios/permisos" element={<Placeholder title="Permisos de Usuarios" />} />

          {/* Carpeta General */}
          <Route path="administracion/general/catalogo-cuentas" element={<Placeholder title="Catálogo de Cuentas" />} />
          <Route path="administracion/general/secuencias-numericas" element={<Placeholder title="Secuencias Numéricas" />} />
          <Route path="administracion/general/monedas" element={<Placeholder title="Monedas" />} />
          <Route path="administracion/general/periodos-contables" element={<Placeholder title="Periodos Contables" />} />
          <Route path="administracion/general/parametros-generales" element={<Placeholder title="Parámetros Generales" />} />
          <Route path="administracion/general/impuestos" element={<Placeholder title="Impuestos" />} />
          <Route path="administracion/general/continentes" element={<Placeholder title="Continentes" />} />
          <Route path="administracion/general/paises" element={<Placeholder title="Países" />} />
          <Route path="administracion/general/ciudades" element={<Placeholder title="Ciudades" />} />
          <Route path="administracion/general/municipios" element={<Placeholder title="Municipios" />} />
          <Route path="administracion/general/departamentos-contables" element={<Placeholder title="Departamentos Contables" />} />
          <Route path="administracion/general/centro-costo" element={<Placeholder title="Centro de Costo Contable" />} />
          <Route path="administracion/general/proposito-contable" element={<Placeholder title="Propósito Contable" />} />
          <Route path="administracion/general/unidades-medidas" element={<Placeholder title="Unidades de Medidas" />} />
          <Route path="administracion/general/conversion-unidades" element={<Placeholder title="Conversión de Unidades de Medidas" />} />
          
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;
