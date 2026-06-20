import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';
import { showToast, showConfirm } from '../../utils/alerts';
import { Plus } from 'lucide-react';

const ExperienciaModal = ({ isOpen, onClose, solicitudId }) => {
  const [experienciaList, setExperienciaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    ExperienciaLaboralSolicitudID: '',
    InstitucionLabor: '',
    Direccion: '',
    Telefono: '',
    UltimoSueldo: 0,
    FechaInicial: '',
    FechaFinal: ''
  });

  const fetchData = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/experiencia/${solicitudId}?empresaId=${empresaId}`, config);
      setExperienciaList(res.data);
    } catch (err) {
      showToast('Error cargando experiencia laboral', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && solicitudId) {
      fetchData();
      setShowForm(false);
    }
  }, [isOpen, solicitudId]);

  const handleOpenForm = (exp = null) => {
    if (exp) {
      setFormData({
        ExperienciaLaboralSolicitudID: exp.ExperienciaLaboralSolicitudID,
        InstitucionLabor: exp.InstitucionLabor,
        Direccion: exp.Direccion || '',
        Telefono: exp.Telefono || '',
        UltimoSueldo: exp.UltimoSueldo,
        FechaInicial: exp.FechaInicial ? exp.FechaInicial.split('T')[0] : '',
        FechaFinal: exp.FechaFinal ? exp.FechaFinal.split('T')[0] : ''
      });
      setEditMode(true);
    } else {
      setFormData({
        ExperienciaLaboralSolicitudID: '',
        InstitucionLabor: '',
        Direccion: '',
        Telefono: '',
        UltimoSueldo: 0,
        FechaInicial: '',
        FechaFinal: ''
      });
      setEditMode(false);
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de Fechas
    if (new Date(formData.FechaInicial) > new Date(formData.FechaFinal)) {
      showToast('La fecha inicial no puede ser mayor a la fecha final', 'error');
      return;
    }

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
        await axios.put(`/api/experiencia/${formData.ExperienciaLaboralSolicitudID}`, payload, config);
        showToast('Experiencia laboral actualizada exitosamente');
      } else {
        await axios.post(`/api/experiencia`, payload, config);
        showToast('Experiencia laboral agregada exitosamente');
      }
      
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast('Error guardando experiencia: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm('¿Está seguro de eliminar este registro de experiencia laboral?');
    if (!confirm) return;

    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/experiencia/${id}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Registro eliminado exitosamente');
      fetchData();
    } catch (err) {
      showToast('Error eliminando registro', 'error');
    }
  };

  const columns = [
    { accessor: 'InstitucionLabor', header: 'Institución / Empresa' },
    { 
      accessor: 'FechaInicial', 
      header: 'Desde',
      render: (item) => item.FechaInicial ? new Date(item.FechaInicial).toLocaleDateString() : ''
    },
    { 
      accessor: 'FechaFinal', 
      header: 'Hasta',
      render: (item) => item.FechaFinal ? new Date(item.FechaFinal).toLocaleDateString() : ''
    },
    { 
      accessor: 'UltimoSueldo', 
      header: 'Último Sueldo',
      render: (item) => `$ ${parseFloat(item.UltimoSueldo).toFixed(2)}`
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (showForm) setShowForm(false);
        else onClose();
      }}
      title="Experiencia Laboral"
      size="lg"
      hideFooter={true}
    >
      {!showForm ? (
        <div>
          <DataTable
            data={experienciaList}
            columns={columns}
            loading={loading}
            hideMainHeader={true}
            onEdit={handleOpenForm}
            onDelete={(item) => handleDelete(item.ExperienciaLaboralSolicitudID)}
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500, color: '#334155' }}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 500 }}>
              <Plus size={16} /> Agregar Experiencia
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Institución / Empresa <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="InstitucionLabor" value={formData.InstitucionLabor} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ej. Banco Popular" />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Dirección</label>
            <input type="text" name="Direccion" value={formData.Direccion} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Av. Principal #123..." />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Teléfono</label>
            <input type="text" name="Telefono" value={formData.Telefono} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="(000) 000-0000" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Último Sueldo <span style={{ color: 'red' }}>*</span></label>
            <input type="number" step="0.01" name="UltimoSueldo" value={formData.UltimoSueldo} onChange={handleChange} required min="0" className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Fecha Inicial <span style={{ color: 'red' }}>*</span></label>
            <input type="date" name="FechaInicial" value={formData.FechaInicial} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Fecha Final <span style={{ color: 'red' }}>*</span></label>
            <input type="date" name="FechaFinal" value={formData.FechaFinal} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
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

export default ExperienciaModal;
