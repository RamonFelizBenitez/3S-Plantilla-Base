import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';
import { showToast, showConfirm } from '../../utils/alerts';
import { Plus } from 'lucide-react';

const IdiomasModal = ({ isOpen, onClose, solicitudId }) => {
  const [idiomasList, setIdiomasList] = useState([]);
  const [catalogoIdiomas, setCatalogoIdiomas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    IdiomaSolicitanteID: '',
    IdiomaID: '',
    HablaBien: false,
    HablaRegular: false,
    LeeBien: false,
    LeeRegular: false,
    EscribeBien: false,
    EscribeRegular: false,
    TraduceBien: false,
    TraduceRegular: false
  });

  const fetchData = async () => {
    if (!solicitudId) return;
    try {
      setLoading(true);
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.get(`/api/idiomas/${solicitudId}?empresaId=${empresaId}`, config);
      setIdiomasList(res.data);
    } catch (err) {
      showToast('Error cargando idiomas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/info/idiomas?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCatalogoIdiomas(res.data.filter(i => i.Activo));
    } catch (err) {
      console.error('Error cargando catálogo de idiomas:', err);
    }
  };

  useEffect(() => {
    if (isOpen && solicitudId) {
      fetchData();
      fetchCatalogos();
      setShowForm(false);
    }
  }, [isOpen, solicitudId]);

  const handleOpenForm = (idioma = null) => {
    if (idioma) {
      setFormData({
        IdiomaSolicitanteID: idioma.IdiomaSolicitanteID,
        IdiomaID: idioma.IdiomaID,
        HablaBien: idioma.HablaBien,
        HablaRegular: idioma.HablaRegular,
        LeeBien: idioma.LeeBien,
        LeeRegular: idioma.LeeRegular,
        EscribeBien: idioma.EscribeBien,
        EscribeRegular: idioma.EscribeRegular,
        TraduceBien: idioma.TraduceBien,
        TraduceRegular: idioma.TraduceRegular
      });
      setEditMode(true);
    } else {
      setFormData({
        IdiomaSolicitanteID: '',
        IdiomaID: catalogoIdiomas.length > 0 ? catalogoIdiomas[0].IdiomaID : '',
        HablaBien: false,
        HablaRegular: false,
        LeeBien: false,
        LeeRegular: false,
        EscribeBien: false,
        EscribeRegular: false,
        TraduceBien: false,
        TraduceRegular: false
      });
      setEditMode(false);
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRadioChange = (habilidad, nivel) => {
    // Si selecciona Bien, apaga Regular, y viceversa. O puede apagar ambos.
    const bienKey = `${habilidad}Bien`;
    const regularKey = `${habilidad}Regular`;
    
    setFormData({
      ...formData,
      [bienKey]: nivel === 'Bien',
      [regularKey]: nivel === 'Regular'
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
        await axios.put(`/api/idiomas/${formData.IdiomaSolicitanteID}`, payload, config);
        showToast('Idioma actualizado exitosamente');
      } else {
        await axios.post(`/api/idiomas`, payload, config);
        showToast('Idioma agregado exitosamente');
      }
      
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast('Error guardando idioma: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm('¿Está seguro de eliminar este registro de idioma?');
    if (!confirm) return;

    try {
      const empresaId = localStorage.getItem('empresaId');
      const token = localStorage.getItem('token');
      await axios.delete(`/api/idiomas/${id}?empresaId=${empresaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Registro eliminado exitosamente');
      fetchData();
    } catch (err) {
      showToast('Error eliminando registro', 'error');
    }
  };

  const columns = [
    { accessor: 'IdiomaNombre', header: 'Idioma' },
    { 
      accessor: 'Habla', 
      header: 'Habla',
      render: (item) => item.HablaBien ? 'Bien' : item.HablaRegular ? 'Regular' : 'No'
    },
    { 
      accessor: 'Lee', 
      header: 'Lee',
      render: (item) => item.LeeBien ? 'Bien' : item.LeeRegular ? 'Regular' : 'No'
    },
    { 
      accessor: 'Escribe', 
      header: 'Escribe',
      render: (item) => item.EscribeBien ? 'Bien' : item.EscribeRegular ? 'Regular' : 'No'
    },
    { 
      accessor: 'Traduce', 
      header: 'Traduce',
      render: (item) => item.TraduceBien ? 'Bien' : item.TraduceRegular ? 'Regular' : 'No'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (showForm) setShowForm(false);
        else onClose();
      }}
      title="Idiomas de la Solicitud"
      size="lg"
      hideFooter={true}
    >
      {!showForm ? (
        <div>
          <DataTable
            data={idiomasList}
            columns={columns}
            loading={loading}
            hideMainHeader={true}
            onEdit={handleOpenForm}
            onDelete={(item) => handleDelete(item.IdiomaSolicitanteID)}
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f1f5f9', fontWeight: 500, color: '#334155' }}>
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 500 }}>
              <Plus size={16} /> Agregar Idioma
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Idioma <span style={{ color: 'red' }}>*</span></label>
            <select name="IdiomaID" value={formData.IdiomaID} onChange={handleChange} required className="form-control" style={{ width: '100%', maxWidth: '300px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
              <option value="">Seleccione...</option>
              {catalogoIdiomas.map(i => (
                <option key={i.IdiomaID} value={i.IdiomaID}>{i.Descripcion}</option>
              ))}
            </select>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#334155', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Evaluación de Nivel</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 100px 100px', gap: '15px', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, color: '#475569' }}></div>
              <div style={{ fontWeight: 600, color: '#475569', textAlign: 'center' }}>Bien</div>
              <div style={{ fontWeight: 600, color: '#475569', textAlign: 'center' }}>Regular</div>
              <div style={{ fontWeight: 600, color: '#475569', textAlign: 'center' }}>Nada</div>

              {/* Habla */}
              <div style={{ fontWeight: 500 }}>Habla</div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={formData.HablaBien} onChange={() => handleRadioChange('Habla', 'Bien')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={formData.HablaRegular} onChange={() => handleRadioChange('Habla', 'Regular')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={!formData.HablaBien && !formData.HablaRegular} onChange={() => handleRadioChange('Habla', 'Nada')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>

              {/* Lee */}
              <div style={{ fontWeight: 500 }}>Lee</div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={formData.LeeBien} onChange={() => handleRadioChange('Lee', 'Bien')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={formData.LeeRegular} onChange={() => handleRadioChange('Lee', 'Regular')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={!formData.LeeBien && !formData.LeeRegular} onChange={() => handleRadioChange('Lee', 'Nada')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>

              {/* Escribe */}
              <div style={{ fontWeight: 500 }}>Escribe</div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={formData.EscribeBien} onChange={() => handleRadioChange('Escribe', 'Bien')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={formData.EscribeRegular} onChange={() => handleRadioChange('Escribe', 'Regular')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={!formData.EscribeBien && !formData.EscribeRegular} onChange={() => handleRadioChange('Escribe', 'Nada')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>

              {/* Traduce */}
              <div style={{ fontWeight: 500 }}>Traduce</div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={formData.TraduceBien} onChange={() => handleRadioChange('Traduce', 'Bien')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={formData.TraduceRegular} onChange={() => handleRadioChange('Traduce', 'Regular')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <input type="radio" checked={!formData.TraduceBien && !formData.TraduceRegular} onChange={() => handleRadioChange('Traduce', 'Nada')} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
            </div>
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

export default IdiomasModal;
