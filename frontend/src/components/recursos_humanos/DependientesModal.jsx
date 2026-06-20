import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';
import { showToast, showConfirm } from '../../utils/alerts';
import { Plus } from 'lucide-react';

const DependientesModal = ({ isOpen, onClose, solicitudId }) => {
  const [dependientes, setDependientes] = useState([]);
  const [parentescos, setParentescos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    DependienteSolicitanteID: '',
    NombreDependiente: '',
    Cedula: '',
    ParentescoID: '',
    Sexo: 0,
    FechaNacimiento: '',
    AplicaSeguroMedico: false
  });

  const fetchData = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/dependientes/${solicitudId}?empresaId=${empresaId}`, config);
      setDependientes(res.data);
    } catch (err) {
      showToast('Error cargando dependientes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchParentescos = async () => {
    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/info/parentescos?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParentescos(res.data.filter(p => p.Activo));
    } catch (err) {
      console.error('Error cargando parentescos:', err);
    }
  };

  useEffect(() => {
    if (isOpen && solicitudId) {
      fetchData();
      fetchParentescos();
      setShowForm(false);
    }
  }, [isOpen, solicitudId]);

  const handleOpenForm = (dependiente = null) => {
    if (dependiente) {
      setFormData({
        DependienteSolicitanteID: dependiente.DependienteSolicitanteID,
        NombreDependiente: dependiente.NombreDependiente,
        Cedula: dependiente.Cedula || '',
        ParentescoID: dependiente.ParentescoID,
        Sexo: dependiente.Sexo,
        FechaNacimiento: dependiente.FechaNacimiento ? dependiente.FechaNacimiento.split('T')[0] : '',
        AplicaSeguroMedico: dependiente.AplicaSeguroMedico
      });
      setEditMode(true);
    } else {
      setFormData({
        DependienteSolicitanteID: '',
        NombreDependiente: '',
        Cedula: '',
        ParentescoID: parentescos.length > 0 ? parentescos[0].ParentescoID : '',
        Sexo: 0,
        FechaNacimiento: '',
        AplicaSeguroMedico: false
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
    try {
      const empresaId = localStorage.getItem('empresaId');
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ...formData,
        EmpresaID: empresaId,
        SolicitudID: solicitudId,
        CreadoPor: userId,
        ModificadoPor: userId
      };

      if (editMode) {
        await axios.put(`/api/dependientes/${formData.DependienteSolicitanteID}`, payload, config);
        showToast('Dependiente actualizado exitosamente');
      } else {
        await axios.post(`/api/dependientes`, payload, config);
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
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/dependientes/${id}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Dependiente eliminado exitosamente');
      fetchData();
    } catch (err) {
      showToast('Error eliminando dependiente', 'error');
    }
  };

  const columns = [
    { accessor: 'NombreDependiente', header: 'Nombre' },
    { accessor: 'ParentescoNombre', header: 'Parentesco' },
    { 
      accessor: 'FechaNacimiento', 
      header: 'Nacimiento',
      render: (item) => item.FechaNacimiento ? new Date(item.FechaNacimiento).toLocaleDateString() : ''
    },
    {
      accessor: 'AplicaSeguroMedico',
      header: 'Seguro',
      render: (item) => item.AplicaSeguroMedico ? 'Sí' : 'No'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (showForm) setShowForm(false);
        else onClose();
      }}
      title="Dependientes de la Solicitud"
      size="lg"
      hideFooter={true}
    >
      {!showForm ? (
        <div>
          <DataTable
            data={dependientes}
            columns={columns}
            loading={loading}
            hideMainHeader={true}
            onEdit={handleOpenForm}
            onDelete={(item) => handleDelete(item.DependienteSolicitanteID)}
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500, color: '#334155' }}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 500 }}>
              <Plus size={16} /> Agregar Dependiente
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Nombre Completo <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="NombreDependiente" value={formData.NombreDependiente} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Parentesco <span style={{ color: 'red' }}>*</span></label>
            <select name="ParentescoID" value={formData.ParentescoID} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value="">Seleccione...</option>
              {parentescos.map(p => (
                <option key={p.ParentescoID} value={p.ParentescoID}>{p.Descripcion}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Sexo <span style={{ color: 'red' }}>*</span></label>
            <select name="Sexo" value={formData.Sexo} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value={0}>Femenino</option>
              <option value={1}>Masculino</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Cédula</label>
            <input type="text" name="Cedula" value={formData.Cedula} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Fecha Nacimiento <span style={{ color: 'red' }}>*</span></label>
            <input type="date" name="FechaNacimiento" value={formData.FechaNacimiento} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" name="AplicaSeguroMedico" checked={formData.AplicaSeguroMedico} onChange={handleChange} style={{ width: '16px', height: '16px' }} />
            <label style={{ fontWeight: 500, cursor: 'pointer' }}>Aplica Seguro Médico</label>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500 }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 500 }}>Guardar</button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default DependientesModal;
