import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';
import { showToast, showConfirm } from '../../utils/alerts';
import { Plus } from 'lucide-react';

const EducacionModal = ({ isOpen, onClose, solicitudId }) => {
  const [educacionList, setEducacionList] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [titulos, setTitulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    EducacionSolicitanteID: '',
    NivelAcademicoID: '',
    AnoTitulacion: '',
    TituloAcademicoID: '',
    InstitucionAcademica: ''
  });

  const fetchData = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/educacion/${solicitudId}?empresaId=${empresaId}`, config);
      setEducacionList(res.data);
    } catch (err) {
      showToast('Error cargando educación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [resNiveles, resTitulos] = await Promise.all([
        axios.get(`/api/info/niveles-academicos?empresaId=${empresaId}`, config),
        axios.get(`/api/info/titulos-academicos?empresaId=${empresaId}`, config)
      ]);
      
      setNiveles(resNiveles.data.filter(n => n.Activo));
      setTitulos(resTitulos.data.filter(t => t.Activo));
    } catch (err) {
      console.error('Error cargando catálogos de educación:', err);
    }
  };

  useEffect(() => {
    if (isOpen && solicitudId) {
      fetchData();
      fetchCatalogos();
      setShowForm(false);
    }
  }, [isOpen, solicitudId]);

  const handleOpenForm = (educacion = null) => {
    if (educacion) {
      setFormData({
        EducacionSolicitanteID: educacion.EducacionSolicitanteID,
        NivelAcademicoID: educacion.NivelAcademicoID,
        AnoTitulacion: educacion.AnoTitulacion,
        TituloAcademicoID: educacion.TituloAcademicoID,
        InstitucionAcademica: educacion.InstitucionAcademica || ''
      });
      setEditMode(true);
    } else {
      setFormData({
        EducacionSolicitanteID: '',
        NivelAcademicoID: niveles.length > 0 ? niveles[0].NivelAcademicoID : '',
        AnoTitulacion: new Date().getFullYear(),
        TituloAcademicoID: titulos.length > 0 ? titulos[0].TituloAcademicoID : '',
        InstitucionAcademica: ''
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
        await axios.put(`/api/educacion/${formData.EducacionSolicitanteID}`, payload, config);
        showToast('Educación actualizada exitosamente');
      } else {
        await axios.post(`/api/educacion`, payload, config);
        showToast('Educación agregada exitosamente');
      }
      
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast('Error guardando educación: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm('¿Está seguro de eliminar este registro de educación?');
    if (!confirm) return;

    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/educacion/${id}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Registro eliminado exitosamente');
      fetchData();
    } catch (err) {
      showToast('Error eliminando registro', 'error');
    }
  };

  const columns = [
    { accessor: 'NivelAcademicoNombre', header: 'Nivel Académico' },
    { accessor: 'TituloAcademicoNombre', header: 'Título' },
    { accessor: 'AnoTitulacion', header: 'Año' },
    { accessor: 'InstitucionAcademica', header: 'Institución' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (showForm) setShowForm(false);
        else onClose();
      }}
      title="Educación de la Solicitud"
      size="lg"
      hideFooter={true}
    >
      {!showForm ? (
        <div>
          <DataTable
            data={educacionList}
            columns={columns}
            loading={loading}
            hideMainHeader={true}
            onEdit={handleOpenForm}
            onDelete={(item) => handleDelete(item.EducacionSolicitanteID)}
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500, color: '#334155' }}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 500 }}>
              <Plus size={16} /> Agregar Educación
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Nivel Académico <span style={{ color: 'red' }}>*</span></label>
            <select name="NivelAcademicoID" value={formData.NivelAcademicoID} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value="">Seleccione...</option>
              {niveles.map(n => (
                <option key={n.NivelAcademicoID} value={n.NivelAcademicoID}>{n.Descripcion}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Título Académico <span style={{ color: 'red' }}>*</span></label>
            <select name="TituloAcademicoID" value={formData.TituloAcademicoID} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value="">Seleccione...</option>
              {titulos.map(t => (
                <option key={t.TituloAcademicoID} value={t.TituloAcademicoID}>{t.Descripcion}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Año de Titulación <span style={{ color: 'red' }}>*</span></label>
            <input type="number" name="AnoTitulacion" value={formData.AnoTitulacion} onChange={handleChange} required min="1900" max="2100" className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Institución Académica <span style={{ color: 'red' }}>*</span></label>
            <input type="text" name="InstitucionAcademica" value={formData.InstitucionAcademica} onChange={handleChange} required className="form-control" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} placeholder="Ej. Universidad Autónoma..." />
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

export default EducacionModal;
