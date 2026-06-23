import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

const ActualizarDatosEmpleadoModal = ({ isOpen, onClose, empleado, empresaId, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [direcciones, setDirecciones] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [tiposNominas, setTiposNominas] = useState([]);

  // Form State
  const [nomina, setNomina] = useState(false);
  const [isr, setIsr] = useState(false);
  const [afp, setAfp] = useState(false);
  const [ars, setArs] = useState(false);
  const [enCarrera, setEnCarrera] = useState(false);
  
  const [estatus, setEstatus] = useState(1);
  const [tipoNominaId, setTipoNominaId] = useState('');
  const [direccionId, setDireccionId] = useState('');
  const [dependenciaId, setDependenciaId] = useState('');
  const [formaPago, setFormaPago] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && empleado) {
      setNomina(empleado.Nomina || false);
      setIsr(empleado.ISR || false);
      setAfp(empleado.AFP || false);
      setArs(empleado.ARS || false);
      setEnCarrera(empleado.EnCarrera || false);
      setEstatus(empleado.Estatus !== undefined ? empleado.Estatus : 1);
      setTipoNominaId(empleado.TipoNominaID || '');
      setDireccionId(empleado.DireccionID || '');
      setDependenciaId(empleado.DependenciaID || '');
      setFormaPago(empleado.FormaPago !== undefined ? empleado.FormaPago : 1);
    }
  }, [isOpen, empleado]);

  useEffect(() => {
    if (direccionId) {
      fetchDependencias(direccionId);
    } else {
      setDependencias([]);
    }
  }, [direccionId]);

  const fetchOptions = async () => {
    try {
      const [dirRes, nomRes] = await Promise.all([
        axios.get(`/api/configuracion/direcciones?empresaId=${empresaId}`),
        axios.get(`/api/configuracion/tipos-nominas?empresaId=${empresaId}`)
      ]);
      setDirecciones(dirRes.data);
      setTiposNominas(nomRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
      Swal.fire('Error', 'No se pudieron cargar las listas desplegables', 'error');
    }
  };

  const fetchDependencias = async (dirId) => {
    try {
      const res = await axios.get(`/api/configuracion/direcciones/${dirId}/dependencias?empresaId=${empresaId}`);
      setDependencias(res.data);
    } catch (error) {
      console.error('Error fetching dependencias:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        Nomina: nomina,
        ISR: isr,
        AFP: afp,
        ARS: ars,
        EnCarrera: enCarrera,
        Estatus: parseInt(estatus),
        TipoNominaID: tipoNominaId,
        DireccionID: direccionId,
        DependenciaID: dependenciaId,
        FormaPago: parseInt(formaPago)
      };

      await axios.put(`/api/empleados/${empleado.EmpleadoID}/datos-nomina?empresaId=${empresaId}`, payload);
      Swal.fire('Éxito', 'Datos del empleado actualizados correctamente', 'success');
      onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating empleado:', error);
      Swal.fire('Error', 'No se pudieron actualizar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Actualizar Datos: ${empleado?.Nombres} ${empleado?.Apellido1 || ''}`}
      size="md"
      hideFooter={true}
    >
      <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={nomina} onChange={(e) => setNomina(e.target.checked)} />
            En Nómina
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={isr} onChange={(e) => setIsr(e.target.checked)} />
            Aplica ISR
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={afp} onChange={(e) => setAfp(e.target.checked)} />
            Aplica AFP
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={ars} onChange={(e) => setArs(e.target.checked)} />
            Aplica ARS
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={enCarrera} onChange={(e) => setEnCarrera(e.target.checked)} />
            En Carrera
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <BaseInputGroup label="Estatus">
            <select 
              value={estatus} 
              onChange={(e) => setEstatus(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              <option value={0}>Activo</option>
              <option value={1}>Vacaciones</option>
              <option value={2}>Licencia</option>
              <option value={3}>Permiso</option>
              <option value={4}>Inactivo</option>
              <option value={5}>Suspendido</option>
              <option value={6}>Despedido</option>
              <option value={7}>Renuncia</option>
            </select>
          </BaseInputGroup>

          <BaseInputGroup label="Forma de Pago">
            <select 
              value={formaPago} 
              onChange={(e) => setFormaPago(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              <option value={0}>Cheque</option>
              <option value={1}>Tarjeta Débito</option>
              <option value={2}>Efectivo</option>
            </select>
          </BaseInputGroup>

          <BaseInputGroup label="Tipo de Nómina">
            <select 
              value={tipoNominaId} 
              onChange={(e) => setTipoNominaId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              <option value="">Seleccione...</option>
              {tiposNominas.map(tn => (
                <option key={tn.TipoNominaID} value={tn.TipoNominaID}>{tn.Descripcion}</option>
              ))}
            </select>
          </BaseInputGroup>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
          <BaseInputGroup label="Dirección">
            <select 
              value={direccionId} 
              onChange={(e) => setDireccionId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              <option value="">Seleccione...</option>
              {direcciones.map(dir => (
                <option key={dir.DireccionID} value={dir.DireccionID}>{dir.Descripcion}</option>
              ))}
            </select>
          </BaseInputGroup>

          <BaseInputGroup label="Dependencia">
            <select 
              value={dependenciaId} 
              onChange={(e) => setDependenciaId(e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              disabled={!direccionId}
            >
              <option value="">Seleccione...</option>
              {dependencias.map(dep => (
                <option key={dep.DependenciaID} value={dep.DependenciaID}>{dep.Descripcion}</option>
              ))}
            </select>
          </BaseInputGroup>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ActualizarDatosEmpleadoModal;
