import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';
import { showToast, showConfirm } from '../../utils/alerts';
import { Plus } from 'lucide-react';

const OtrosModal = ({ isOpen, onClose, solicitudId }) => {
  const [otrosList, setOtrosList] = useState([]);
  const [catalogoActividades, setCatalogoActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    OtrosID: '',
    ActividadID: '',
    Descripcion: ''
  });

  const fetchData = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/otros/${solicitudId}?empresaId=${empresaId}`, config);
      setOtrosList(res.data);
    } catch (err) {
      showToast('Error cargando actividades (otros)', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/info/actividades?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCatalogoActividades(res.data.filter(a => a.Activo));
    } catch (err) {
      console.error('Error cargando catálogo de actividades:', err);
    }
  };

  useEffect(() => {
    if (isOpen && solicitudId) {
      fetchData();
      fetchCatalogos();
      setShowForm(false);
    }
  }, [isOpen, solicitudId]);

  const handleOpenForm = (otro = null) => {
    if (otro) {
      setFormData({
        OtrosID: otro.OtrosID,
        ActividadID: otro.ActividadID,
        Descripcion: otro.Descripcion || ''
      });
      setEditMode(true);
    } else {
      setFormData({
        OtrosID: '',
        ActividadID: catalogoActividades.length > 0 ? catalogoActividades[0].ActividadID : '',
        Descripcion: ''
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
        await axios.put(`/api/otros/${formData.OtrosID}`, payload, config);
        showToast('Actividad actualizada exitosamente');
      } else {
        await axios.post(`/api/otros`, payload, config);
        showToast('Actividad agregada exitosamente');
      }
      
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast('Error guardando actividad: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm('¿Está seguro de eliminar este registro?');
    if (!confirm) return;

    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/otros/${id}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Registro eliminado exitosamente');
      fetchData();
    } catch (err) {
      showToast('Error eliminando registro', 'error');
    }
  };

  const columns = [
    { accessor: 'ActividadNombre', header: 'Categoría (Actividad)' },
    { accessor: 'Descripcion', header: 'Descripción / Detalle' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (showForm) setShowForm(false);
        else onClose();
      }}
      title="Otras Actividades"
      size="md"
      hideFooter={true}
    >
      {!showForm ? (
        <div>
          <DataTable
            data={otrosList}
            columns={columns}
            loading={loading}
            hideMainHeader={true}
            onEdit={handleOpenForm}
            onDelete={(item) => handleDelete(item.OtrosID)}
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500, color: '#334155' }}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 500 }}>
              <Plus size={16} /> Agregar Actividad
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Categoría / Actividad <span style={{ color: 'red' }}>*</span></label>
            <select name="ActividadID" value={formData.ActividadID} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value="">Seleccione...</option>
              {catalogoActividades.map(a => (
                <option key={a.ActividadID} value={a.ActividadID}>{a.Descripcion}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Descripción / Detalles</label>
            <textarea name="Descripcion" value={formData.Descripcion} onChange={handleChange} className="form-control" rows="3" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ej. Lunes a viernes en las tardes..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500 }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 500 }}>Guardar</button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default OtrosModal;
