import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { LanguageContext } from '../../i18n/LanguageContext';

const mockMenuData = [
  {
    moduloID: 1,
    nombre: 'menu.modules.hr',
    icono: 'Users',
    opciones: [
      { nombre: 'menu.options.requests', ruta: '/recursos-humanos/solicitudes', icono: 'FileText', esCarpeta: false },
      { nombre: 'menu.options.staff', ruta: '/personal', icono: 'Users', esCarpeta: false },
      { 
        nombre: 'menu.options.actions', icono: 'RefreshCw', esCarpeta: true, 
        subOpciones: [
          { nombre: 'menu.options.designation', ruta: '/recursos-humanos/designaciones' },
          { nombre: 'menu.options.changes', ruta: '/cambios' },
          { nombre: 'menu.options.separation', ruta: '/separacion' },
          { nombre: 'menu.options.warnings', ruta: '/amonestaciones' },
          { nombre: 'menu.options.vacations', ruta: '/vacaciones' },
          { nombre: 'menu.options.absences', ruta: '/ausencias' }
        ]
      },
      { 
        nombre: 'menu.options.reports', icono: 'ClipboardList', esCarpeta: true, 
        subOpciones: [
          { nombre: 'Lista de Solicitudes', ruta: '/informes/solicitudes' },
          { nombre: 'Lista de Empleados', ruta: '/informes/empleados' },
          { nombre: 'Lista de Acciones', ruta: '/informes/acciones' }
        ]
      },
      { 
        nombre: 'Información Complementaria', icono: 'Database', esCarpeta: true, 
        subOpciones: [
          { nombre: 'Parentesco', ruta: '/recursos-humanos/info/parentescos' },
          { nombre: 'Nivel Académico', ruta: '/recursos-humanos/info/niveles-academicos' },
          { nombre: 'Título Académico', ruta: '/recursos-humanos/info/titulos-academicos' },
          { nombre: 'Idiomas', ruta: '/recursos-humanos/info/idiomas' },
          { nombre: 'Niveles de Traducción', ruta: '/recursos-humanos/info/traducciones' },
          { nombre: 'Actividades', ruta: '/recursos-humanos/info/actividades' }
        ]
      },
      { 
        nombre: 'menu.options.settings', icono: 'Settings', esCarpeta: true, 
        subOpciones: [
          { nombre: 'Direcciones', ruta: '/configuracion/direcciones' },
          { nombre: 'Cargos', ruta: '/nomina/cargos' },
          { nombre: 'Turnos', ruta: '/configuracion/turnos' },
          { nombre: 'Tipos de Acciones', ruta: '/configuracion/tipos-acciones' },
          { nombre: 'Sedes', ruta: '/configuracion/sedes' },
          { nombre: 'Grupo Ocupacional', ruta: '/configuracion/grupos-ocupacionales' },
          { nombre: 'Clasificación', ruta: '/configuracion/clasificaciones' },
          { nombre: 'Parámetros', ruta: '/configuracion/parametros' }
        ]
      }
    ]
  },
  {
    moduloID: 2,
    nombre: 'menu.modules.payroll',
    icono: 'DollarSign',
    opciones: [
      { nombre: 'menu.options.employees', ruta: '/nomina/empleados', icono: 'Briefcase', esCarpeta: false },
      { 
        nombre: 'menu.options.transactions', icono: 'FolderOpen', esCarpeta: true, 
        subOpciones: [
          { nombre: 'Abrir nómina', ruta: '/nomina/transacciones/abrir' },
          { nombre: 'Subir nómina desde Excel', ruta: '/nomina/transacciones/subir-excel' },
          { nombre: 'Aplicar descuentos externo', ruta: '/nomina/transacciones/aplicar-descuentos' }
        ]
      },
      { 
        nombre: 'menu.options.calculations', icono: 'Calculator', esCarpeta: true, 
        subOpciones: [
          { nombre: 'Cálculo de bonificaciones', ruta: '/nomina/calculos/bonificaciones' },
          { nombre: 'Cálculo de vacaciones', ruta: '/nomina/calculos/vacaciones' },
          { nombre: 'Cálculo de regalía pascual', ruta: '/nomina/calculos/regalia' }
        ]
      },
      { 
        nombre: 'menu.options.process', icono: 'Activity', esCarpeta: true, 
        subOpciones: [
          { nombre: 'Generar nómina', ruta: '/nomina/proceso/generar' },
          { nombre: 'Cerrar nómina', ruta: '/nomina/proceso/cerrar' },
          { nombre: 'Generar archivo de banco', ruta: '/nomina/proceso/archivo-banco' },
          { nombre: 'Generar entrada de diarios', ruta: '/nomina/proceso/entrada-diarios' }
        ]
      },
      { 
        nombre: 'menu.options.reports', icono: 'FileSpreadsheet', esCarpeta: true, 
        subOpciones: [
          { nombre: 'Nómina detallada', ruta: '/nomina/informes/detallada' },
          { nombre: 'Resumen de nómina', ruta: '/nomina/informes/resumen' },
          { nombre: 'Transacciones de nómina', ruta: '/nomina/informes/transacciones' },
          { nombre: 'Volantes de pago', ruta: '/nomina/informes/volantes' },
          { nombre: 'Generar reporte de tesorería', ruta: '/nomina/informes/tesoreria' }
        ]
      },
      { 
        nombre: 'menu.options.settings', icono: 'Settings', esCarpeta: true, 
        subOpciones: [
          { nombre: 'Tipos de transacciones', ruta: '/nomina/configuracion/tipos-transacciones' },
          { nombre: 'Tipos de nóminas', ruta: '/nomina/configuracion/tipos-nominas' },
          { nombre: 'Contabilización de nóminas', ruta: '/nomina/configuracion/contabilizacion' },
          { nombre: 'Cargos', ruta: '/nomina/cargos' },
          { nombre: 'ISR', ruta: '/nomina/configuracion/isr' },
          { nombre: 'LEY 87-01', ruta: '/nomina/configuracion/ley8701' },
          { nombre: 'Periodos de nóminas', ruta: '/nomina/configuracion/periodos' },
          { nombre: 'Parámetros de bonificación', ruta: '/nomina/configuracion/param-bonificacion' },
          { nombre: 'Parámetros', ruta: '/nomina/configuracion/parametros' }
        ]
      }
    ]
  },
  {
    moduloID: 3,
    nombre: 'menu.modules.system_admin',
    icono: 'Shield',
    opciones: [
      { 
        nombre: 'menu.options.company', icono: 'Building', esCarpeta: true, 
        subOpciones: [
          { nombre: 'menu.options.select_company', ruta: '/administracion/empresa/seleccionar' },
          { nombre: 'menu.options.companies', ruta: '/administracion/empresa/empresas' },
          { nombre: 'menu.options.company_info', ruta: '/administracion/empresa/informacion' }
        ]
      },
      { 
        nombre: 'menu.options.user_management', icono: 'Users', esCarpeta: true, 
        subOpciones: [
          { nombre: 'menu.options.users', ruta: '/administracion/usuarios/usuarios' },
          { nombre: 'menu.options.user_profiles', ruta: '/administracion/usuarios/perfiles' },
          { nombre: 'menu.options.user_permissions', ruta: '/administracion/usuarios/permisos' }
        ]
      },
      { 
        nombre: 'menu.options.general', icono: 'Settings', esCarpeta: true, 
        subOpciones: [
          { nombre: 'menu.options.chart_of_accounts', ruta: '/administracion/general/catalogo-cuentas' },
          { nombre: 'menu.options.number_sequences', ruta: '/administracion/general/secuencias-numericas' },
          { nombre: 'menu.options.currencies', ruta: '/administracion/general/monedas' },
          { nombre: 'menu.options.accounting_periods', ruta: '/administracion/general/periodos-contables' },
          { nombre: 'menu.options.general_parameters', ruta: '/administracion/general/parametros-generales' },
          { nombre: 'menu.options.taxes', ruta: '/administracion/general/impuestos' },
          { nombre: 'menu.options.continents', ruta: '/administracion/general/continentes' },
          { nombre: 'menu.options.countries', ruta: '/administracion/general/paises' },
          { nombre: 'menu.options.cities', ruta: '/administracion/general/ciudades' },
          { nombre: 'menu.options.municipalities', ruta: '/administracion/general/municipios' },
          { nombre: 'menu.options.accounting_departments', ruta: '/administracion/general/departamentos-contables' },
          { nombre: 'menu.options.cost_centers', ruta: '/administracion/general/centro-costo' },
          { nombre: 'menu.options.accounting_purpose', ruta: '/administracion/general/proposito-contable' },
          { nombre: 'menu.options.units_of_measure', ruta: '/administracion/general/unidades-medidas' },
          { nombre: 'menu.options.unit_conversion', ruta: '/administracion/general/conversion-unidades' }
        ]
      }
    ]
  }
];

const Sidebar = ({ isCollapsed }) => {
  const [openGroups, setOpenGroups] = useState({});
  const [menuData, setMenuData] = useState([]);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    // Aquí iría el fetch a /api/auth/menu (Simulado con mockMenuData)
    setMenuData(mockMenuData);
  }, []);

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const DynamicIcon = ({ name, size = 18 }) => {
    const IconComponent = Icons[name] || Icons.HelpCircle;
    return <IconComponent size={size} />;
  };

  const renderSectionLabel = (label) => {
    if (isCollapsed) return null;
    return (
      <div style={{ padding: '15px 20px 5px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-shield">RH</div>
        <div className="brand-text">
          <span className="brand-name">{t('app.title')}</span>
          <span className="brand-sub">{t('app.subtitle')}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><Icons.Home size={18} /></span>
          <span className="nav-label">{t('menu.dashboard')}</span>
        </NavLink>

        {menuData.map((modulo, mIdx) => (
          <React.Fragment key={mIdx}>
            {/* Si quisieras mostrar labels, puedes habilitarlo.
                renderSectionLabel(modulo.nombre)
            */}
            
            <div className="nav-group" style={{ marginTop: '10px' }}>
              <button 
                className={`nav-group-toggle ${openGroups['mod_'+modulo.moduloID] ? 'open' : ''}`}
                onClick={() => toggleGroup('mod_'+modulo.moduloID)}
                style={{ fontWeight: '600', color: '#fff' }}
              >
                <span className="nav-icon"><DynamicIcon name={modulo.icono} /></span>
                <span className="nav-label">{t(modulo.nombre)}</span>
                <span className="nav-caret"><Icons.ChevronRight size={16} /></span>
              </button>
              
              <div className={`nav-group-items ${openGroups['mod_'+modulo.moduloID] ? 'open' : ''}`}>
                {modulo.opciones.map((opcion, oIdx) => {
                  const keyOpcion = `opc_${modulo.moduloID}_${oIdx}`;
                  
                  if (!opcion.esCarpeta) {
                    return (
                      <NavLink key={oIdx} to={opcion.ruta} className={({isActive}) => `nav-sub-item ${isActive ? 'active' : ''}`}>
                        {t(opcion.nombre)}
                      </NavLink>
                    );
                  } else {
                    return (
                      <div className="nav-group" key={oIdx}>
                        <button 
                          className={`nav-group-toggle ${openGroups[keyOpcion] ? 'open' : ''}`}
                          onClick={() => toggleGroup(keyOpcion)}
                          style={{ paddingLeft: '32px' }}
                        >
                          <span className="nav-icon"><DynamicIcon name={opcion.icono} size={16} /></span>
                          <span className="nav-label">{t(opcion.nombre)}</span>
                          <span className="nav-caret"><Icons.ChevronRight size={16} /></span>
                        </button>
                        <div className={`nav-group-items ${openGroups[keyOpcion] ? 'open' : ''}`} style={{ marginLeft: '16px', background: 'transparent', borderLeft: '1px dashed rgba(255,255,255,0.1)' }}>
                          {opcion.subOpciones.map((sub, sIdx) => (
                            <NavLink key={sIdx} to={sub.ruta} className={({isActive}) => `nav-sub-item ${isActive ? 'active' : ''}`} style={{ paddingLeft: '48px' }}>
                              {t(sub.nombre) || sub.nombre}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </React.Fragment>
        ))}

      </nav>

      <div className="sidebar-footer">
        <span>{t('app.version')} &mdash; {t('app.title')}</span>
      </div>
    </aside>
  );
};

export default Sidebar;
