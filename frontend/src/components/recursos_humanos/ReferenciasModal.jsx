import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';
import { showToast, showConfirm } from '../../utils/alerts';
import { Plus } from 'lucide-react';

const ReferenciasModal = ({ isOpen, onClose, solicitudId }) => {
  const [referenciasList, setReferenciasList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    ReferenciaID: '',
    Nombre: '',
    Direccion: '',
    Telefono: '',
    Anios: ''
  });

  const fetchData = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/referencias/${solicitudId}?empresaId=${empresaId}`, config);
      setReferenciasList(res.data);
    } catch (err) {
      showToast('Error cargando referencias', 'error');
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

  const handleOpenForm = (ref = null) => {
    if (ref) {
      setFormData({
        ReferenciaID: ref.ReferenciaID,
        Nombre: ref.Nombre,
        Direccion: ref.Direccion || '',
        Telefono: ref.Telefono || '',
        Anios: ref.Anios || ''
      });
      setEditMode(true);
    } else {
      setFormData({
        ReferenciaID: '',
        Nombre: '',
        Direccion: '',
        Telefono: '',
        Anios: ''
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
        await axios.put(`/api/referencias/${formData.ReferenciaID}`, payload, config);
        showToast('Referencia actualizada exitosamente');
      } else {
        await axios.post(`/api/referencias`, payload, config);
        showToast('Referencia agregada exitosamente');
      }
      
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast('Error guardando referencia: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm('¿Está seguro de eliminar esta referencia?');
    if (!confirm) return;

    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/referencias/${id}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Referencia eliminada exitosamente');
      fetchData();
    } catch (err) {
      showToast('Error eliminando referencia', 'error');
    }
  };

  const columns = [
    { accessor: 'Nombre', header: 'Nombre' },
    { accessor: 'Telefono', header: 'Teléfono' },
    { accessor: 'Anios', header: 'Años de conocerle' },
    { accessor: 'Direccion', header: 'Dirección' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (showForm) setShowForm(false);
        else onClose();
      }}
      title="Referencias"
      size="md"
      hideFooter={true}
    >
      {!showForm ? (
        <div>
          <DataTable
            data={referenciasList}
            columns={columns}
            loading={loading}
            hideMainHeader={true}
            onEdit={handleOpenForm}
            onDelete={(item) => handleDelete(item.ReferenciaID)}
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500, color: '#334155' }}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 500 }}>
              <Plus size={16} /> Agregar Referencia
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Nombre Completo <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="Nombre" value={formData.Nombre} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ej. Juan Pérez" />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Dirección</label>
            <input type="text" name="Direccion" value={formData.Direccion} onChange={handleChange} className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ej. C/ Sol #4..." />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Teléfono <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="Telefono" value={formData.Telefono} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="(000) 000-0000" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Años de conocerle</label>
            <input type="number" name="Anios" value={formData.Anios} onChange={handleChange} min="0" max="100" className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
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

export default ReferenciasModal;
