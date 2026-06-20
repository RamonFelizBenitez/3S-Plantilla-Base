import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';
import { Trash2, Users } from 'lucide-react';
import DependenciaCargosModal from './DependenciaCargosModal';

const DependenciasModal = ({ isOpen, onClose, direccionId, direccionDesc }) => {
  const [dependencias, setDependencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ DependenciaID: '', Descripcion: '' });

  // Cargos Modal
  const [isCargosModalOpen, setIsCargosModalOpen] = useState(false);
  const [selectedDepId, setSelectedDepId] = useState(null);
  const [selectedDepDesc, setSelectedDepDesc] = useState('');

  useEffect(() => {
    if (isOpen && direccionId) {
      fetchDependencias();
      setFormData({ DependenciaID: '', Descripcion: '' });
    }
  }, [isOpen, direccionId]);

  const fetchDependencias = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/configuracion/direcciones/${direccionId}/dependencias`);
      const json = await res.json();
      if (Array.isArray(json)) {
        setDependencias(json);
      } else {
        throw new Error(json.message || 'Error del servidor');
      }
    } catch (err) {
      setDependencias([]);
      Swal.fire('Error', 'Error al cargar dependencias', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.DependenciaID || !formData.Descripcion) {
      Swal.fire('Atención', 'Complete todos los campos', 'warning');
      return;
    }

    // Validación frontal rápida del prefijo (Primeros 2 caracteres)
    const prefijoRequerido = String(direccionId).substring(0, 2);
    if (!String(formData.DependenciaID).startsWith(prefijoRequerido)) {
      Swal.fire('Código Inválido', `El código de la dependencia debe iniciar con "${prefijoRequerido}"`, 'warning');
      return;
    }

    try {
      const response = await fetch(`/api/configuracion/direcciones/${direccionId}/dependencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EmpresaID: 1,
          ...formData
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Error al guardar');
      }

      setFormData({ DependenciaID: '', Descripcion: '' }); // limpiar
      fetchDependencias(); // recargar
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar Dependencia?',
      text: "No se podrá revertir.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/configuracion/direcciones/${direccionId}/dependencias/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      fetchDependencias();
    } catch (err) {
      Swal.fire('Error', 'Error al eliminar', 'error');
    }
  };

  return (
    <>
    <Modal 
      title={`Dependencias - ${direccionDesc || direccionId}`} 
      isOpen={isOpen} 
      onClose={onClose}
      hideFooter={true}
      size="lg"
    >
      {/* Formulario de Agregado */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '14px' }}>Agregar Nueva Dependencia</h4>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#64748b' }}>Código * (Prefijo: {String(direccionId).substring(0,2)})</label>
            <input 
              type="text" 
              name="DependenciaID" 
              value={formData.DependenciaID} 
              onChange={handleChange}
              placeholder="Ej: DIR-01-A"
              maxLength={20}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <div style={{ flex: '2' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#64748b' }}>Descripción *</label>
            <input 
              type="text" 
              name="Descripcion" 
              value={formData.Descripcion} 
              onChange={handleChange}
              placeholder="Descripción de la dependencia"
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <div>
            <button 
              type="submit" 
              style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              Agregar
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Dependencias */}
      <div>
        <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '14px' }}>Dependencias Registradas</h4>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Cargando...</p>
        ) : dependencias.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', background: '#f1f5f9', borderRadius: '6px', color: '#64748b' }}>No hay dependencias registradas para esta dirección.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Código</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600', fontSize: '13px' }}>Descripción</th>
                <th style={{ padding: '12px 16px', width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {dependencias.map(dep => (
                <tr key={dep.DependenciaID} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#334155' }}>{dep.DependenciaID}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#334155' }}>{dep.Descripcion}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button 
                      onClick={() => {
                        setSelectedDepId(dep.DependenciaID);
                        setSelectedDepDesc(dep.Descripcion);
                        setIsCargosModalOpen(true);
                      }}
                      title="Asignar Cargos (Estructura Organizativa)"
                      style={{ background: '#3b82f6', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px 8px', borderRadius: '4px', marginRight: '8px' }}
                    >
                      <Users size={14} /> Cargos
                    </button>
                    <button 
                      onClick={() => handleDelete(dep.DependenciaID)}
                      title="Eliminar Dependencia"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </Modal>
    
    <DependenciaCargosModal 
      isOpen={isCargosModalOpen}
      onClose={() => setIsCargosModalOpen(false)}
      dependenciaId={selectedDepId}
      dependenciaDesc={selectedDepDesc}
    />
    </>
  );
};

export default DependenciasModal;
