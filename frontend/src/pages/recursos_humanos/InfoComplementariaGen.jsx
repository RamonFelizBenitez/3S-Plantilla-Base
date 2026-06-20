import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { showToast, showConfirm } from '../../utils/alerts';

const InfoComplementariaGen = ({ title, endpoint, idField }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    Descripcion: '',
    Activo: true
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/info/${endpoint}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data);
    } catch (err) {
      showToast(`Error cargando ${title}: ` + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, [endpoint]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setFormData({
        id: record[idField],
        Descripcion: record.Descripcion,
        Activo: record.Activo
      });
      setEditMode(true);
    } else {
      setFormData({ id: '', Descripcion: '', Activo: true });
      setEditMode(false);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ id: '', Descripcion: '', Activo: true });
    setEditMode(false);
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
      const username = localStorage.getItem('username');
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        Descripcion: formData.Descripcion,
        Activo: formData.Activo,
        EmpresaID: empresaId,
        CreadoPor: userId,
        ModificadoPor: userId
      };

      if (editMode) {
        await axios.put(`/api/info/${endpoint}/${formData.id}`, payload, config);
        showToast('Registro actualizado exitosamente');
      } else {
        await axios.post(`/api/info/${endpoint}`, payload, config);
        showToast('Registro creado exitosamente');
      }
      
      handleCloseModal();
      fetchRecords();
    } catch (err) {
      showToast('Error guardando registro: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm('¿Está seguro de eliminar este registro?');
    if (!confirm) return;

    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/info/${endpoint}/${id}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Registro eliminado exitosamente');
      fetchRecords();
    } catch (err) {
      showToast('Error eliminando registro: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const columns = [
    { accessor: idField, header: 'ID' },
    { accessor: 'Descripcion', header: 'Descripción' },
    { 
      accessor: 'Activo', 
      header: 'Estado',
      render: (item) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          backgroundColor: item.Activo ? '#dcfce7' : '#fee2e2',
          color: item.Activo ? '#166534' : '#991b1b',
          fontWeight: 500
        }}>
          {item.Activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <DataTable
        title={title}
        data={records}
        columns={columns}
        loading={loading}
        onAdd={() => handleOpenModal()}
        onEdit={(item) => handleOpenModal(item)}
        onDelete={(item) => handleDelete(item[idField])}
      />

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        hideFooter={true}
        title={editMode ? `Editar ${title}` : `Nuevo ${title}`}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500, color: '#334155' }}>
              Descripción <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="Descripcion"
              value={formData.Descripcion}
              onChange={handleChange}
              required
              className="form-control"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              placeholder="Ej. Grado, Padre, Inglés..."
            />
          </div>

          {editMode && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, color: '#334155' }}>
                <input
                  type="checkbox"
                  name="Activo"
                  checked={formData.Activo}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Activo
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '4px', color: '#334155', fontWeight: 500 }}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 500 }}>
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InfoComplementariaGen;
