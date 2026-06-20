import React, { useState, useEffect, useMemo } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import { Save, ChevronDown, ChevronRight, CheckSquare, Search, User, Shield, Info } from 'lucide-react';

const Permisos = () => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('perfil'); // 'perfil' o 'usuario'
  const [idSeleccionado, setIdSeleccionado] = useState('');
  const [listaEntidades, setListaEntidades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [estructuraMenu, setEstructuraMenu] = useState([]);
  const [permisos, setPermisos] = useState({}); // { opcionId: { PuedeConsultar, PuedeInsertar, ... } }
  
  const [loading, setLoading] = useState(false);
  const [openModulos, setOpenModulos] = useState({});

  const [empresasList, setEmpresasList] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');

  // Cargar lista de Empresas
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await fetch('/api/empresas');
        if (res.ok) {
          const json = await res.json();
          setEmpresasList(json.data || []);
          if(json.data && json.data.length > 0) setEmpresaSeleccionada(json.data[0].EmpresaID.toString());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmpresas();
  }, []);

  // Cargar lista de entidades (Perfiles o Usuarios)
  useEffect(() => {
    const fetchEntidades = async () => {
      try {
        const endpoint = tipoSeleccionado === 'perfil' ? '/api/perfiles' : '/api/usuarios';
        const res = await fetch(endpoint);
        if (res.ok) {
          const json = await res.json();
          setListaEntidades(json.data || []);
          setIdSeleccionado('');
          setPermisos({});
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEntidades();
  }, [tipoSeleccionado]);

  // Cargar Estructura del Menú
  useEffect(() => {
    const fetchEstructura = async () => {
      try {
        const res = await fetch('/api/permisos/estructura');
        if (res.ok) {
          const json = await res.json();
          setEstructuraMenu(json.data || []);
          
          // Abrir primer modulo por defecto
          if(json.data && json.data.length > 0) {
             setOpenModulos({ [json.data[0].ModuloID]: true });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEstructura();
  }, []);

  // Cargar Permisos actuales de la entidad seleccionada
  useEffect(() => {
    if (!idSeleccionado) {
      setPermisos({});
      return;
    }

    const fetchPermisosActuales = async () => {
      try {
        setLoading(true);
        let url = `/api/permisos/${tipoSeleccionado}/${idSeleccionado}`;
        if (tipoSeleccionado === 'usuario' && empresaSeleccionada) {
           url += `?empresaId=${empresaSeleccionada}`;
        } else if (tipoSeleccionado === 'usuario' && !empresaSeleccionada) {
           setPermisos({});
           setLoading(false);
           return;
        }

        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          const pMap = {};
          json.data.forEach(p => {
            pMap[p.OpcionID] = {
              PuedeConsultar: p.PuedeConsultar,
              PuedeInsertar: p.PuedeInsertar,
              PuedeModificar: p.PuedeModificar,
              PuedeEliminar: p.PuedeEliminar
            };
          });
          setPermisos(pMap);
        }
      } catch (err) {
        setPermisos({});
      } finally {
        setLoading(false);
      }
    };
    fetchPermisosActuales();
  }, [idSeleccionado, tipoSeleccionado, empresaSeleccionada]);

  const toggleModulo = (moduloId) => {
    setOpenModulos(prev => ({ ...prev, [moduloId]: !prev[moduloId] }));
  };

  const handleCheckbox = (opcionId, permiso) => {
    setPermisos(prev => {
      const current = prev[opcionId] || { PuedeConsultar: false, PuedeInsertar: false, PuedeModificar: false, PuedeEliminar: false };
      return {
        ...prev,
        [opcionId]: { ...current, [permiso]: !current[permiso] }
      };
    });
  };

  const handleMarcarFila = (opcionId) => {
    setPermisos(prev => {
        const current = prev[opcionId] || {};
        const allChecked = current.PuedeConsultar && current.PuedeInsertar && current.PuedeModificar && current.PuedeEliminar;
        
        return {
            ...prev,
            [opcionId]: {
                PuedeConsultar: !allChecked,
                PuedeInsertar: !allChecked,
                PuedeModificar: !allChecked,
                PuedeEliminar: !allChecked
            }
        }
    });
  };

  const handleToggleModuloFila = (moduloId, checkAll) => {
    // Activa/desactiva todo el modulo
    const modulo = estructuraMenu.find(m => m.ModuloID === moduloId);
    if (!modulo) return;
    
    const newPermisos = { ...permisos };
    const extractOpciones = (ops) => {
        ops.forEach(o => {
            if (o.EsCarpeta && o.subOpciones) extractOpciones(o.subOpciones);
            else if (!o.EsCarpeta) {
                newPermisos[o.OpcionID] = {
                    PuedeConsultar: checkAll,
                    PuedeInsertar: checkAll,
                    PuedeModificar: checkAll,
                    PuedeEliminar: checkAll
                };
            }
        });
    };
    extractOpciones(modulo.opciones);
    setPermisos(newPermisos);
  };

  const handleSave = async () => {
    if (!idSeleccionado) return showToast("Seleccione un objetivo primero", "warning");
    if (tipoSeleccionado === 'usuario' && !empresaSeleccionada) return showToast("Debe seleccionar la Empresa destino para los permisos del usuario", "warning");
    
    setLoading(true);
    const permisosArray = Object.keys(permisos).map(opcionId => ({
      OpcionID: parseInt(opcionId),
      ...permisos[opcionId]
    }));

    try {
      const payload = { permisos: permisosArray };
      if (tipoSeleccionado === 'usuario') {
          payload.empresaId = parseInt(empresaSeleccionada);
      }

      const res = await fetch(`/api/permisos/guardar/${tipoSeleccionado}/${idSeleccionado}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if(res.ok) {
        showToast("Permisos guardados exitosamente.", "success");
      } else {
        showToast("Error al guardar permisos", "error");
      }
    } catch(err) {
        showToast("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const entidadesFiltradas = useMemo(() => {
    if(!searchTerm) return listaEntidades;
    return listaEntidades.filter(ent => {
       const text = ent.Descripcion || ent.NombreCompleto || '';
       return text.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [listaEntidades, searchTerm]);

  // Switch component for better UI
  const Switch = ({ checked, onChange }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{
        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: checked ? '#22c55e' : '#cbd5e1', transition: '.4s', borderRadius: '34px'
      }}>
        <span style={{
          position: 'absolute', content: '""', height: '16px', width: '16px', left: '2px', bottom: '2px',
          backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
          transform: checked ? 'translateX(16px)' : 'translateX(0)'
        }} />
      </span>
    </label>
  );

  const renderOpciones = (opciones, level = 0) => {
    return opciones.map(opc => (
      <div key={opc.OpcionID}>
        {opc.EsCarpeta ? (
          <div style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ padding: `10px 15px 10px ${15 + level * 20}px`, background: '#f8fafc', fontWeight: 'bold', color: '#475569', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>📂</span> {opc.Nombre}
            </div>
            {opc.subOpciones && renderOpciones(opc.subOpciones, level + 1)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr', padding: `12px 15px`, borderBottom: '1px solid #e2e8f0', alignItems: 'center', transition: 'background 0.2s' }} className="hover-row">
            <div style={{ color: '#334155', fontWeight: 500, display: 'flex', alignItems: 'center', paddingLeft: `${level * 20}px` }}>
               <span style={{ marginRight: '8px', color: '#94a3b8' }}>📄</span> {opc.Nombre}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Switch checked={permisos[opc.OpcionID]?.PuedeConsultar || false} onChange={() => handleCheckbox(opc.OpcionID, 'PuedeConsultar')} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Switch checked={permisos[opc.OpcionID]?.PuedeInsertar || false} onChange={() => handleCheckbox(opc.OpcionID, 'PuedeInsertar')} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Switch checked={permisos[opc.OpcionID]?.PuedeModificar || false} onChange={() => handleCheckbox(opc.OpcionID, 'PuedeModificar')} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Switch checked={permisos[opc.OpcionID]?.PuedeEliminar || false} onChange={() => handleCheckbox(opc.OpcionID, 'PuedeEliminar')} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => handleMarcarFila(opc.OpcionID)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }} title="Alternar Acceso Total">
                <CheckSquare size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    ));
  };

  const getSeleccionadoName = () => {
    if (!idSeleccionado) return "";
    const ent = listaEntidades.find(e => (e.PerfilID || e.UsuarioID).toString() === idSeleccionado.toString());
    return ent ? (ent.Descripcion || ent.NombreCompleto) : "";
  };

  return (
    <div className="page-section active" style={{ animation: 'none', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Seguridad y Accesos</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0' }}>Gestión centralizada de roles y permisos de usuarios</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={loading || !idSeleccionado}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: (loading || !idSeleccionado) ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: (loading || !idSeleccionado) ? 0.6 : 1, transition: 'background 0.2s' }}
        >
          <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
        
        {/* PANEL IZQUIERDO: MAESTRO */}
        <div className="table-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
            <button 
                style={{ flex: 1, padding: '12px', border: 'none', background: tipoSeleccionado === 'perfil' ? '#fff' : '#f8fafc', color: tipoSeleccionado === 'perfil' ? '#0ea5e9' : '#64748b', fontWeight: tipoSeleccionado === 'perfil' ? 600 : 500, borderBottom: tipoSeleccionado === 'perfil' ? '2px solid #0ea5e9' : '2px solid transparent', cursor: 'pointer' }}
                onClick={() => setTipoSeleccionado('perfil')}
            >
                <Shield size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Perfiles
            </button>
            <button 
                style={{ flex: 1, padding: '12px', border: 'none', background: tipoSeleccionado === 'usuario' ? '#fff' : '#f8fafc', color: tipoSeleccionado === 'usuario' ? '#0ea5e9' : '#64748b', fontWeight: tipoSeleccionado === 'usuario' ? 600 : 500, borderBottom: tipoSeleccionado === 'usuario' ? '2px solid #0ea5e9' : '2px solid transparent', cursor: 'pointer' }}
                onClick={() => setTipoSeleccionado('usuario')}
            >
                <User size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Usuarios
            </button>
          </div>

          <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} 
                />
            </div>
            
            {tipoSeleccionado === 'usuario' && (
                <select 
                    value={empresaSeleccionada} 
                    onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', marginTop: '10px' }}
                >
                    <option value="">Seleccione Empresa...</option>
                    {empresasList.map(emp => (
                        <option key={emp.EmpresaID} value={emp.EmpresaID}>{emp.NombreEmpresa}</option>
                    ))}
                </select>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {entidadesFiltradas.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '13px' }}>No hay resultados</div>
            ) : (
                entidadesFiltradas.map(ent => {
                    const id = (ent.PerfilID || ent.UsuarioID).toString();
                    const isSelected = id === idSeleccionado;
                    return (
                        <div 
                            key={id}
                            onClick={() => setIdSeleccionado(id)}
                            style={{ 
                                padding: '12px 15px', 
                                marginBottom: '8px', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                background: isSelected ? '#eff6ff' : '#fff',
                                border: isSelected ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                color: isSelected ? '#1d4ed8' : '#334155',
                                fontWeight: isSelected ? 600 : 400,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            className="hover-card"
                        >
                            {tipoSeleccionado === 'perfil' ? <Shield size={16} style={{ marginRight: '10px', color: isSelected ? '#3b82f6' : '#94a3b8' }}/> : <User size={16} style={{ marginRight: '10px', color: isSelected ? '#3b82f6' : '#94a3b8' }}/>}
                            {ent.Descripcion || ent.NombreCompleto}
                        </div>
                    );
                })
            )}
          </div>

        </div>

        {/* PANEL DERECHO: DETALLE */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {idSeleccionado && (tipoSeleccionado === 'perfil' || (tipoSeleccionado === 'usuario' && empresaSeleccionada)) ? (
              <div className="table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: '#0f172a' }}>
                        Permisos para: <span style={{ color: '#0ea5e9' }}>{getSeleccionadoName()}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Info size={14} /> Expanda un módulo para editar sus opciones
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr', padding: '12px 15px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontWeight: 'bold', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <div>Opción</div>
                  <div style={{ textAlign: 'center' }}>Consultar</div>
                  <div style={{ textAlign: 'center' }}>Insertar</div>
                  <div style={{ textAlign: 'center' }}>Modificar</div>
                  <div style={{ textAlign: 'center' }}>Eliminar</div>
                  <div style={{ textAlign: 'center' }}>Todo</div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {estructuraMenu.map(modulo => (
                      <div key={modulo.ModuloID} style={{ marginBottom: '5px' }}>
                        <div 
                          style={{ 
                              padding: '15px 20px', 
                              background: openModulos[modulo.ModuloID] ? '#eff6ff' : '#fff', 
                              borderBottom: '1px solid #e2e8f0', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontWeight: '600', 
                              color: openModulos[modulo.ModuloID] ? '#1e40af' : '#1e293b', 
                              fontSize: '14px',
                              transition: 'background 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center' }} onClick={() => toggleModulo(modulo.ModuloID)}>
                             {openModulos[modulo.ModuloID] ? <ChevronDown size={18} style={{ marginRight: '10px' }}/> : <ChevronRight size={18} style={{ marginRight: '10px' }}/>}
                             {modulo.Nombre}
                          </div>
                          
                          {/* Boton para prender/apagar modulo completo */}
                          <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={(e) => { e.stopPropagation(); handleToggleModuloFila(modulo.ModuloID, true); }} style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Dar Todo</button>
                              <button onClick={(e) => { e.stopPropagation(); handleToggleModuloFila(modulo.ModuloID, false); }} style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Quitar Todo</button>
                          </div>
                        </div>
                        
                        {openModulos[modulo.ModuloID] && (
                          <div style={{ background: '#fff' }}>
                            {modulo.opciones && modulo.opciones.length > 0 ? (
                                renderOpciones(modulo.opciones)
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>
                                    No hay opciones ni carpetas configuradas para este módulo en la base de datos.
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {estructuraMenu.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay módulos configurados en el sistema</div>
                    )}
                </div>
              </div>
          ) : (
              <div className="table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                  <Shield size={64} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
                  <h3 style={{ color: '#475569', margin: '0 0 10px 0' }}>Ningún objetivo seleccionado</h3>
                  <p style={{ color: '#94a3b8', margin: 0, textAlign: 'center', maxWidth: '300px' }}>
                      Seleccione un perfil o usuario de la lista de la izquierda para ver y editar su matriz de permisos.
                  </p>
              </div>
          )}

        </div>

      </div>

      <style>{`
        .hover-row:hover { background: #f1f5f9 !important; }
        .hover-card:hover { border-color: #cbd5e1 !important; }
      `}</style>
    </div>
  );
};

export default Permisos;
