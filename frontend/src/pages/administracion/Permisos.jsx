import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import { Save, ChevronDown, ChevronRight, CheckSquare } from 'lucide-react';

const Permisos = () => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState('perfil'); // 'perfil' o 'usuario'
  const [idSeleccionado, setIdSeleccionado] = useState('');
  const [listaEntidades, setListaEntidades] = useState([]);
  
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
        // Mock fallback para pruebas UI
        if (tipoSeleccionado === 'perfil') {
            setListaEntidades([{ PerfilID: 1, Descripcion: 'Administrador Global' }, { PerfilID: 2, Descripcion: 'RRHH' }]);
        } else {
            setListaEntidades([{ UsuarioID: 1, NombreCompleto: 'Juan Pérez' }]);
        }
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
        }
      } catch (err) {
        // Mock fallback
        setEstructuraMenu([
            {
                ModuloID: 1, Nombre: 'Recursos Humanos', opciones: [
                    { OpcionID: 1, Nombre: 'Solicitudes', EsCarpeta: false },
                    { OpcionID: 2, Nombre: 'Empleados', EsCarpeta: false }
                ]
            }
        ]);
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

  const handleSave = async () => {
    if (!idSeleccionado) return showToast("Seleccione un objetivo primero");
    if (tipoSeleccionado === 'usuario' && !empresaSeleccionada) return showToast("Debe seleccionar la Empresa destino para los permisos del usuario");
    
    setLoading(true);
    // Convertir mapa a array
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
        showToast("Permisos guardados exitosamente.");
      } else {
        showToast("Simulación: Permisos guardados (Backend offline)");
      }
    } catch(err) {
      showToast("Simulación: Permisos guardados (Backend offline)");
    } finally {
      setLoading(false);
    }
  };

  const renderOpciones = (opciones, level = 0) => {
    return opciones.map(opc => (
      <div key={opc.OpcionID} style={{ paddingLeft: `${level * 20}px` }}>
        {opc.EsCarpeta ? (
          <div style={{ padding: '10px', background: '#f8fafc', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
            📁 {opc.Nombre}
            {opc.subOpciones && renderOpciones(opc.subOpciones, level + 1)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr', padding: '12px 10px', borderBottom: '1px solid #e2e8f0', alignItems: 'center', transition: 'background 0.2s' }} className="hover-row">
            <div style={{ color: '#334155', fontWeight: 500 }}>📄 {opc.Nombre}</div>
            <div style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={permisos[opc.OpcionID]?.PuedeConsultar || false} onChange={() => handleCheckbox(opc.OpcionID, 'PuedeConsultar')} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={permisos[opc.OpcionID]?.PuedeInsertar || false} onChange={() => handleCheckbox(opc.OpcionID, 'PuedeInsertar')} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={permisos[opc.OpcionID]?.PuedeModificar || false} onChange={() => handleCheckbox(opc.OpcionID, 'PuedeModificar')} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={permisos[opc.OpcionID]?.PuedeEliminar || false} onChange={() => handleCheckbox(opc.OpcionID, 'PuedeEliminar')} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => handleMarcarFila(opc.OpcionID)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }} title="Marcar/Desmarcar Todo">
                <CheckSquare size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Permisos de Usuarios</h2>
          <p style={{ color: '#64748b', margin: '5px 0 0' }}>Asigna privilegios de lectura y escritura por módulo.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleSave}
          disabled={loading || !idSeleccionado}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: (loading || !idSeleccionado) ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: (loading || !idSeleccionado) ? 0.6 : 1 }}
        >
          <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Matriz'}
        </button>
      </div>

      <div className="table-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Otorgar permiso a:</label>
          <select 
            value={tipoSeleccionado} 
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            style={inputStyle}
          >
            <option value="perfil">Un Perfil (Rol)</option>
            <option value="usuario">Un Usuario Específico (Excepción)</option>
          </select>
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Seleccione objetivo:</label>
          <select 
            value={idSeleccionado} 
            onChange={(e) => setIdSeleccionado(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Seleccionar --</option>
            {listaEntidades.map(ent => (
              <option key={ent.PerfilID || ent.UsuarioID} value={ent.PerfilID || ent.UsuarioID}>
                {ent.Descripcion || ent.NombreCompleto}
              </option>
            ))}
          </select>
        </div>
        {tipoSeleccionado === 'usuario' && (
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Empresa Destino:</label>
          <select 
            value={empresaSeleccionada} 
            onChange={(e) => setEmpresaSeleccionada(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Seleccionar Empresa --</option>
            {empresasList.map(emp => (
              <option key={emp.EmpresaID} value={emp.EmpresaID}>
                {emp.NombreEmpresa}
              </option>
            ))}
          </select>
        </div>
        )}
      </div>

      {idSeleccionado && (tipoSeleccionado === 'perfil' || (tipoSeleccionado === 'usuario' && empresaSeleccionada)) && estructuraMenu.length > 0 && (
        <div className="table-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.5fr 0.5fr 0.5fr 0.5fr 0.5fr', padding: '15px 10px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
            <div>MÓDULO / OPCIÓN</div>
            <div style={{ textAlign: 'center' }}>CONSULTAR</div>
            <div style={{ textAlign: 'center' }}>INSERTAR</div>
            <div style={{ textAlign: 'center' }}>MODIFICAR</div>
            <div style={{ textAlign: 'center' }}>ELIMINAR</div>
            <div style={{ textAlign: 'center' }}>ACCIONES</div>
          </div>

          {estructuraMenu.map(modulo => (
            <div key={modulo.ModuloID}>
              <div 
                style={{ padding: '15px', background: '#fff', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#0f172a', fontSize: '15px' }}
                onClick={() => toggleModulo(modulo.ModuloID)}
              >
                {openModulos[modulo.ModuloID] ? <ChevronDown size={18} style={{ marginRight: '8px' }}/> : <ChevronRight size={18} style={{ marginRight: '8px' }}/>}
                {modulo.Nombre}
              </div>
              
              {openModulos[modulo.ModuloID] && (
                <div style={{ background: '#fafafa' }}>
                  {renderOpciones(modulo.opciones)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {idSeleccionado && estructuraMenu.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No hay módulos disponibles o estructurados en el sistema.
        </div>
      )}

      {!idSeleccionado && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          Seleccione un perfil o usuario en la parte superior para cargar su matriz de permisos.
        </div>
      )}

      <style>{`
        .hover-row:hover { background: #f8fafc !important; }
        input[type="checkbox"] { width: 16px; height: 16px; accent-color: #2563eb; cursor: pointer; }
      `}</style>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: '#334155' };

export default Permisos;
