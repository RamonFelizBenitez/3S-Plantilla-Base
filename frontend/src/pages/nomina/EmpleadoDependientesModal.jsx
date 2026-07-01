import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import { showToast, showConfirm } from '../../utils/alerts';
import { Plus } from 'lucide-react';

const EmpleadoDependientesModal = ({ isOpen, onClose, empleado, empresaId }) => {
  const [dependientes, setDependientes] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [solicitanteDependientes, setSolicitanteDependientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    DependienteID: '',
    NombreDependiente: '',
    Cobrar: true,
    TransaccionID: ''
  });

  const fetchData = async () => {
    if (!empleado) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/empleados-dependientes/${empleado.EmpleadoID}?empresaId=${empresaId}`, config);
      setDependientes(res.data);
    } catch (err) {
      showToast('Error cargando dependientes del empleado', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransaccionesConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/tipos-transacciones?empresaId=${empresaId}`, config);
      setTransacciones(res.data);
    } catch (err) {
      console.error('Error cargando tipos de transacciones:', err);
    }
  };

  const fetchSolicitanteDependientes = async () => {
    if (!empleado) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/empleados-dependientes/${empleado.EmpleadoID}/solicitante-dependientes?empresaId=${empresaId}`, config);
      setSolicitanteDependientes(res.data);
    } catch (err) {
      console.error('Error cargando dependientes del solicitante:', err);
    }
  };

  useEffect(() => {
    if (isOpen && empleado) {
      fetchData();
      fetchTransaccionesConfig();
      fetchSolicitanteDependientes();
      setShowForm(false);
    }
  }, [isOpen, empleado]);

  const handleOpenForm = (dependiente = null) => {
    if (dependiente) {
      setFormData({
        DependienteID: dependiente.DependienteID,
        NombreDependiente: dependiente.NombreDependiente || '',
        Cobrar: !!dependiente.Cobrar,
        TransaccionID: dependiente.TransaccionID || ''
      });
      setEditMode(true);
    } else {
      setFormData({
        DependienteID: '',
        NombreDependiente: '',
        Cobrar: true,
        TransaccionID: transacciones.length > 0 ? transacciones[0].TipoTransId : ''
      });
      setEditMode(false);
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.TransaccionID) {
      showToast('Debe seleccionar un tipo de transacción', 'error');
      return;
    }
    try {
      const username = localStorage.getItem('username') || 'SYSTEM';
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ...formData,
        EmpresaID: empresaId,
        EmpleadoID: empleado.EmpleadoID,
        CreadoPor: username,
        ModificadoPor: username
      };

      if (editMode) {
        await axios.put(`/api/empleados-dependientes/${formData.DependienteID}`, payload, config);
        showToast('Dependiente actualizado exitosamente');
      } else {
        await axios.post(`/api/empleados-dependientes`, payload, config);
        showToast('Dependiente agregado exitosamente');
      }
      
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast('Error guardando dependiente: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm('¿Está seguro de eliminar este dependiente?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/empleados-dependientes/${id}?empresaId=${empresaId}&empleadoId=${empleado.EmpleadoID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Dependiente eliminado exitosamente');
      fetchData();
    } catch (err) {
      showToast('Error eliminando dependiente', 'error');
    }
  };

  const columns = [
    { accessor: 'DependienteID', header: 'Código' },
    { accessor: 'NombreDependiente', header: 'Nombre' },
    { 
      accessor: 'TransaccionID', 
      header: 'Transacción',
      render: (item) => `${item.TransaccionID} - ${item.TransaccionDescripcion || ''}`
    },
    {
      accessor: 'Cobrar',
      header: 'Activo',
      render: (item) => item.Cobrar ? 'Sí' : 'No'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (showForm) setShowForm(false);
        else onClose();
      }}
      title={`Dependientes del Empleado: ${empleado?.Nombres || ''} ${empleado?.Apellido1 || ''}`}
      size="lg"
      hideFooter={true}
    >
      {!showForm ? (
        <div style={{ padding: '20px' }}>
          <DataTable
            data={dependientes}
            columns={columns}
            loading={loading}
            hideMainHeader={true}
            onEdit={handleOpenForm}
            onDelete={(item) => handleDelete(item.DependienteID)}
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={16} /> Agregar Dependiente
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
              {editMode ? 'Modificar Dependiente' : 'Nuevo Dependiente'}
            </h4>
            <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', marginBottom: '15px' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Nombre Completo <span style={{ color: 'red' }}>*</span></label>
            <select 
              name="NombreDependiente" 
              value={formData.NombreDependiente} 
              onChange={handleChange} 
              required 
              className="form-control" 
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white' }}
            >
              <option value="">Seleccione dependiente de la solicitud...</option>
              {[
                ...solicitanteDependientes,
                ...(editMode && formData.NombreDependiente && !solicitanteDependientes.some(sd => sd.NombreDependiente === formData.NombreDependiente)
                  ? [{ DependienteSolicitanteID: 'temp', NombreDependiente: formData.NombreDependiente, Cedula: '' }]
                  : [])
              ].map(sd => (
                <option key={sd.DependienteSolicitanteID} value={sd.NombreDependiente}>
                  {sd.NombreDependiente} {sd.Cedula ? `(Cédula: ${sd.Cedula})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Transacción (NMTIPOSTRANSACCIONES) <span style={{ color: 'red' }}>*</span></label>
            <select name="TransaccionID" value={formData.TransaccionID} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white' }}>
              <option value="">Seleccione...</option>
              {transacciones.map(t => (
                <option key={t.TipoTransId} value={t.TipoTransId}>{t.TipoTransId} - {t.Descripcion}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
              <input type="checkbox" name="Cobrar" checked={formData.Cobrar} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
              Activo
            </label>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EmpleadoDependientesModal;
