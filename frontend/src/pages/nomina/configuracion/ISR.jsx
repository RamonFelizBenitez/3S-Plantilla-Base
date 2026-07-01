import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const BaseInputGroup = ({ label, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
      {label}
    </label>
    {children}
  </div>
);

const ISR = () => {
  const empresaId = '1';
  const [data, setData] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    Ident: '',
    EmpresaID: empresaId,
    TipoTransID: '',
    SueldoInicial: 0,
    SueldoFinal: 0,
    Valor: 0,
    Base: 0,
    FechaInicial: '',
    FechaFinal: '9999-12-31'
  });

  useEffect(() => {
    fetchTransacciones();
    fetchData();
  }, []);

  const fetchTransacciones = async () => {
    try {
      const res = await axios.get(`/api/tipos-transacciones?empresaId=${empresaId}`);
      setTransacciones(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/isr`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los registros ISR', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.substring(0, 10);
  };

  const handleOpenModal = (row = null) => {
    if (row) {
      setFormData({
        Ident: row.Ident,
        EmpresaID: empresaId,
        TipoTransID: row.TipoTransID || '',
        SueldoInicial: row.SueldoInicial || 0,
        SueldoFinal: row.SueldoFinal || 0,
        Valor: row.Valor || 0,
        Base: row.Base || 0,
        FechaInicial: formatDate(row.FechaInicial),
        FechaFinal: formatDate(row.FechaFinal)
      });
      setIsEditing(true);
    } else {
      setFormData({
        Ident: '',
        EmpresaID: empresaId,
        TipoTransID: '',
        SueldoInicial: 0,
        SueldoFinal: 0,
        Valor: 0,
        Base: 0,
        FechaInicial: '',
        FechaFinal: '9999-12-31'
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing) {
        await axios.put(`/api/isr/${formData.Ident}`, formData);
        Swal.fire('Actualizado', 'Registro actualizado correctamente', 'success');
      } else {
        await axios.post(`/api/isr`, formData);
        Swal.fire('Creado', 'Registro creado correctamente', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(`/api/isr/${id}?EmpresaID=${empresaId}`);
        Swal.fire('Eliminado', 'Registro eliminado exitosamente.', 'success');
        fetchData();
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const columns = [
    { header: 'Transacción', accessor: 'TipoTransDescripcion', render: (row) => row.TipoTransDescripcion || row.TipoTransID },
    { header: 'Sueldo Inicial', accessor: 'SueldoInicial', render: (row) => formatMoney(row.SueldoInicial) },
    { header: 'Sueldo Final', accessor: 'SueldoFinal', render: (row) => formatMoney(row.SueldoFinal) },
    { header: 'Valor', accessor: 'Valor', render: (row) => formatMoney(row.Valor) },
    { header: 'Base', accessor: 'Base', render: (row) => formatMoney(row.Base) },
    { header: 'Fecha Inicial', accessor: 'FechaInicial', render: (row) => formatDate(row.FechaInicial) },
    { header: 'Fecha Final', accessor: 'FechaFinal', render: (row) => formatDate(row.FechaFinal) },
    {
      header: 'Acciones',
      accessor: 'acciones',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleOpenModal(row)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(row.Ident)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Mantenimiento de ISR</h2>
        <button
          onClick={() => handleOpenModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Nuevo Rango
        </button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Editar Rango ISR" : "Nuevo Rango ISR"}
        size="md"
        hideFooter={true}
      >
        <form onSubmit={handleSave} style={{ padding: '20px' }}>
          <BaseInputGroup label="Tipo Transacción">
            <select
              name="TipoTransID"
              value={formData.TipoTransID}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            >
              <option value="">Seleccione una transacción</option>
              {transacciones.map(t => (
                <option key={t.TipoTransId} value={t.TipoTransId}>
                  {t.TipoTransId} - {t.Descripcion}
                </option>
              ))}
            </select>
          </BaseInputGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <BaseInputGroup label="Sueldo Inicial">
              <input
                type="number"
                name="SueldoInicial"
                value={formData.SueldoInicial}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </BaseInputGroup>

            <BaseInputGroup label="Sueldo Final">
              <input
                type="number"
                name="SueldoFinal"
                value={formData.SueldoFinal}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </BaseInputGroup>

            <BaseInputGroup label="Valor (%)">
              <input
                type="number"
                name="Valor"
                value={formData.Valor}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </BaseInputGroup>

            <BaseInputGroup label="Excedente (Base)">
              <input
                type="number"
                name="Base"
                value={formData.Base}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </BaseInputGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <BaseInputGroup label="Fecha Inicial">
              <input
                type="date"
                name="FechaInicial"
                value={formData.FechaInicial}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </BaseInputGroup>

            <BaseInputGroup label="Fecha Final">
              <input
                type="date"
                name="FechaFinal"
                value={formData.FechaFinal}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </BaseInputGroup>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ISR;
