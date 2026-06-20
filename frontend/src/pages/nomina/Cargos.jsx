import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { showToast, showConfirm } from '../../utils/alerts';

const Cargos = () => {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    CargoID: '',
    Descripcion: ''
  });

  const fetchCargos = async () => {
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/cargos?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCargos(res.data);
    } catch (err) {
      showToast('Error cargando cargos: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleOpenModal = (cargo = null) => {
    if (cargo) {
      setFormData({
        CargoID: cargo.CargoID,
        Descripcion: cargo.Descripcion
      });
      setEditMode(true);
    } else {
      setFormData({ CargoID: '', Descripcion: '' });
      setEditMode(false);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({ CargoID: '', Descripcion: '' });
    setEditMode(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const empresaId = localStorage.getItem('empresaId');
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        ...formData,
        EmpresaID: empresaId,
        CreadoPor: username,
        ModificadoPor: username
      };

      if (editMode) {
        await axios.put(`/api/cargos/${formData.CargoID}`, payload, config);
        showToast('Cargo actualizado exitosamente');
      } else {
        await axios.post('/api/cargos', payload, config);
        showToast('Cargo creado exitosamente');
      }
      
      handleCloseModal();
      fetchCargos();
    } catch (err) {
      showToast('Error guardando cargo: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (cargoId) => {
    const confirm = await showConfirm('¿Está seguro de eliminar este cargo?');
    if (!confirm) return;

    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/cargos/${cargoId}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Cargo eliminado exitosamente');
      fetchCargos();
    } catch (err) {
      showToast('Error al eliminar cargo: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const columns = [
    { accessor: 'CargoID', label: 'Código de Cargo' },
    { accessor: 'Descripcion', label: 'Descripción' }
  ];

  return (
    <>
      <DataTable
        title="Mantenimiento de Cargos"
        columns={columns}
        data={cargos}
        onAdd={() => handleOpenModal()}
        onEdit={handleOpenModal}
        loading={loading}
      />

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editMode ? "Editar Cargo" : "Nuevo Cargo"} hideFooter={true}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label>Código de Cargo</label>
            <input
              type="text"
              name="CargoID"
              value={formData.CargoID}
              onChange={handleChange}
              required
              disabled={editMode}
              placeholder="Ej. GG"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input
              type="text"
              name="Descripcion"
              value={formData.Descripcion}
              onChange={handleChange}
              required
              placeholder="Ej. Gerente General"
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            {editMode && (
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(formData.CargoID)}>
                Eliminar
              </button>
            )}
            <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar</button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Cargos;
