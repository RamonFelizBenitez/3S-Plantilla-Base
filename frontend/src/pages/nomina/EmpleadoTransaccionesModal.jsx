import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';

const EmpleadoTransaccionesModal = ({ isOpen, onClose, empleado }) => {
  const empresaId = '1';
  const [transacciones, setTransacciones] = useState([]);
  const [tiposNominas, setTiposNominas] = useState([]);
  const [tiposTransacciones, setTiposTransacciones] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = Lista, 1 = Formulario
  const [editingRow, setEditingRow] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    TipoNominaId: '',
    TipoTransId: '',
    Intervalo: 0,
    TipoNovedad: 0,
    Monto: '',
    Frecuencia: '',
    Abono: '',
    Inactiva: false,
    Fecha: new Date().toISOString().substring(0, 10)
  });

  useEffect(() => {
    if (isOpen && empleado) {
      setActiveTab(0); // Reset to list view when opening modal
      fetchCatalogos();
      fetchTransacciones();
    }
  }, [isOpen, empleado]);

  const fetchCatalogos = async () => {
    try {
      const [resNominas, resTrans] = await Promise.all([
        axios.get(`/api/abrir-nomina/tipos?EmpresaID=${empresaId}&_t=${new Date().getTime()}`),
        axios.get(`/api/tipos-transacciones?empresaId=${empresaId}&_t=${new Date().getTime()}`)
      ]);
      setTiposNominas(resNominas.data || []);
      setTiposTransacciones(resTrans.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los catálogos.', 'error');
    }
  };

  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/transacciones-empleados/${empleado.EmpleadoID}?empresaId=${empresaId}`);
      setTransacciones(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar las transacciones.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    if (name === 'Intervalo' || name === 'TipoNovedad') {
      newValue = parseInt(newValue, 10);
    }

    setFormData(prev => {
      let updated = { ...prev, [name]: newValue };

      // Si se cambia el Monto, copiarlo al Abono por defecto (a menos que sea recurrente y tenga frecuencia, en cuyo caso calculamos)
      if (name === 'Monto') {
        const m = parseFloat(newValue) || 0;
        if (updated.TipoNovedad === 2 && updated.Frecuencia) {
          const f = parseFloat(updated.Frecuencia) || 0;
          if (f > 0) updated.Abono = (m / f).toFixed(2);
          else updated.Abono = newValue;
        } else {
          updated.Abono = newValue;
        }
      }

      // Lógica bidireccional si es novedad recurrente (2)
      if (updated.TipoNovedad === 2) {
        if (name === 'Frecuencia') {
          const m = parseFloat(updated.Monto) || 0;
          const f = parseFloat(updated.Frecuencia) || 0;
          if (m > 0 && f > 0) {
            updated.Abono = (m / f).toFixed(2);
          } else {
            updated.Abono = updated.Monto;
          }
        } else if (name === 'Abono') {
          const m = parseFloat(updated.Monto) || 0;
          const a = parseFloat(updated.Abono) || 0;
          if (m > 0 && a > 0) {
            updated.Frecuencia = Math.ceil(m / a);
          } else {
            updated.Frecuencia = '';
          }
        }
      } else {
        // Reset frecuencia si no es recurrente
        if (name === 'TipoNovedad') {
          updated.Frecuencia = '';
          updated.Abono = updated.Monto || '';
        }
      }

      return updated;
    });
  };

  const handleEdit = (row) => {
    setEditingRow(row);
    setFormData({
      TipoNominaId: row.TipoNominaId || '',
      TipoTransId: row.TipoTransId || '',
      Intervalo: row.Intervalo || 0,
      TipoNovedad: row.TipoNovedad || 0,
      Monto: row.Monto != null ? row.Monto : '',
      Frecuencia: row.Frecuencia || '',
      Abono: row.Abono != null ? row.Abono : '',
      Inactiva: row.Inactiva || false,
      Fecha: row.Fecha ? row.Fecha.substring(0, 10) : new Date().toISOString().substring(0, 10)
    });
    setActiveTab(1);
  };

  const handleAddNew = () => {
    setEditingRow(null);
    setFormData({
      TipoNominaId: '',
      TipoTransId: '',
      Intervalo: 0,
      TipoNovedad: 0,
      Monto: '',
      Frecuencia: '',
      Abono: '',
      Inactiva: false,
      Fecha: new Date().toISOString().substring(0, 10)
    });
    setActiveTab(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.TipoNominaId || !formData.TipoTransId || !formData.Monto) {
      return Swal.fire('Atención', 'Debe completar los campos requeridos (Nómina, Transacción y Monto)', 'warning');
    }

    if (formData.TipoNovedad === 2 && (!formData.Frecuencia || !formData.Abono)) {
      return Swal.fire('Atención', 'Para novedades recurrentes, la Frecuencia y el Abono son obligatorios.', 'warning');
    }

    try {
      setSubmitting(true);
      
      const payload = {
        ...formData,
        Monto: parseFloat(formData.Monto),
        Abono: formData.Abono ? parseFloat(formData.Abono) : 0,
        Frecuencia: formData.Frecuencia ? parseInt(formData.Frecuencia, 10) : 0
      };

      if (editingRow) {
        await axios.put(`/api/transacciones-empleados/${empleado.EmpleadoID}/${editingRow.TipoNovedad}/${editingRow.LineaNumero}?empresaId=${empresaId}`, payload);
        Swal.fire('Éxito', 'Transacción actualizada.', 'success');
      } else {
        await axios.post(`/api/transacciones-empleados/${empleado.EmpleadoID}?empresaId=${empresaId}`, payload);
        Swal.fire('Éxito', 'Transacción guardada.', 'success');
      }
      
      // Reset form (mantener nómina e intervalo por comodidad)
      setFormData(prev => ({
        ...prev,
        TipoTransId: '',
        Monto: '',
        Frecuencia: '',
        Abono: '',
        Inactiva: false,
        Fecha: new Date().toISOString().substring(0, 10)
      }));

      fetchTransacciones();
      setActiveTab(0); // Volver a la vista de lista
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo guardar la transacción.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: '¿Eliminar transacción?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/transacciones-empleados/${empleado.EmpleadoID}/${row.TipoNovedad}/${row.LineaNumero}?empresaId=${empresaId}`);
        Swal.fire('Eliminada', 'La transacción ha sido eliminada.', 'success');
        fetchTransacciones();
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo eliminar.', 'error');
      }
    }
  };

  const getNovedadText = (tipo) => {
    switch (tipo) {
      case 0: return 'Fija';
      case 1: return 'Ocasional';
      case 2: return 'Recurrente';
      default: return '';
    }
  };

  const getIntervaloText = (intervalo) => {
    switch (intervalo) {
      case 0: return 'Ambas Qnas';
      case 1: return '1era Qna';
      case 2: return '2da Qna';
      default: return '';
    }
  };

  const columns = [
    { header: 'Fecha', render: (row) => row.Fecha ? row.Fecha.substring(0, 10) : '' },
    { header: 'Nómina', accessor: 'TipoNominaId' },
    { header: 'Transacción', accessor: 'TipoTransId' },
    { header: 'Novedad', render: (row) => getNovedadText(row.TipoNovedad) },
    { header: 'Intervalo', render: (row) => getIntervaloText(row.Intervalo) },
    { header: 'Monto', render: (row) => row.Monto != null ? row.Monto.toFixed(2) : '0.00' },
    { header: 'Abono', render: (row) => row.Abono != null ? row.Abono.toFixed(2) : '0.00' },
    { header: 'Activa', render: (row) => (
        <span style={{ color: row.Inactiva ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
          {row.Inactiva ? 'NO' : 'SÍ'}
        </span>
      ) 
    }
  ];

  const renderActions = (row) => (
    <button
      onClick={() => handleDelete(row)}
      style={{
        background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px',
        borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
      }}
    >
      Eliminar
    </button>
  );

  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' };
  const formGroup = { marginBottom: '15px' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Transacciones de Empleado - ${empleado?.Nombres || ''}`} size="lg" hideFooter={true}>
      
      {activeTab === 0 ? (
        /* VISTA 1: Historial de Transacciones */
        <DataTable
          title="Historial de Transacciones"
          data={transacciones}
          columns={columns}
          loading={loading}
          hideMainHeader={true}
          renderActions={renderActions}
          editLabel="Editar"
          onEdit={handleEdit}
          onAdd={handleAddNew} // Botón "Nueva Transacción"
          addButtonLabel="Nueva Transacción"
        />
      ) : (
        /* VISTA 2: Formulario de Adición */
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
            {editingRow ? 'Editar Transacción' : 'Agregar Nueva Transacción'}
          </h3>
          <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            
            <div style={formGroup}>
              <label style={labelStyle}>Nómina a aplicar *</label>
              <select name="TipoNominaId" value={formData.TipoNominaId} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Seleccionar Nómina --</option>
                {tiposNominas.map(tn => (
                  <option key={tn.TipoNominaID} value={tn.TipoNominaID}>{tn.Descripcion}</option>
                ))}
              </select>
            </div>

            <div style={formGroup}>
              <label style={labelStyle}>Tipo Transacción *</label>
              <select name="TipoTransId" value={formData.TipoTransId} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Seleccionar Transacción --</option>
                {tiposTransacciones.map(tt => (
                  <option key={tt.TipoTransId} value={tt.TipoTransId}>{tt.Descripcion}</option>
                ))}
              </select>
            </div>

            <div style={formGroup}>
              <label style={labelStyle}>Intervalo de Aplicación</label>
              <select name="Intervalo" value={formData.Intervalo} onChange={handleChange} style={inputStyle}>
                <option value={0}>Ambas Quincenas</option>
                <option value={1}>1era. Quincena</option>
                <option value={2}>2da. Quincena</option>
              </select>
            </div>

            <div style={formGroup}>
              <label style={labelStyle}>Tipo de Novedad</label>
              <select name="TipoNovedad" value={formData.TipoNovedad} onChange={handleChange} style={inputStyle}>
                <option value={0}>Fija</option>
                <option value={1}>Ocasional</option>
                <option value={2}>Recurrente (Préstamo)</option>
              </select>
            </div>

            <div style={formGroup}>
              <label style={labelStyle}>Monto Total *</label>
              <input type="number" step="0.01" name="Monto" value={formData.Monto} onChange={handleChange} style={inputStyle} required />
            </div>

            <div style={formGroup}>
              <label style={labelStyle}>Fecha de Inicio/Transacción *</label>
              <input type="date" name="Fecha" value={formData.Fecha} onChange={handleChange} style={inputStyle} required />
            </div>

            <div style={formGroup}>
              <label style={labelStyle}>Monto del Abono *</label>
              <input type="number" step="0.01" name="Abono" value={formData.Abono} onChange={handleChange} style={inputStyle} required />
            </div>

            {formData.TipoNovedad === 2 && (
              <div style={formGroup}>
                <label style={labelStyle}>Frecuencia (Cantidad de Pagos) *</label>
                <input type="number" name="Frecuencia" value={formData.Frecuencia} onChange={handleChange} style={inputStyle} required />
              </div>
            )}

            <div style={{ ...formGroup, display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
                <input 
                  type="checkbox" 
                  name="Inactiva" 
                  checked={!formData.Inactiva} // Si Inactiva es false, el checkbox "Activo" debe estar marcado
                  onChange={(e) => setFormData(prev => ({ ...prev, Inactiva: !e.target.checked }))} 
                  style={{ marginRight: '8px', width: '18px', height: '18px' }} 
                />
                Activo
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={() => setActiveTab(0)} 
              style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}
            >
              Cancelar
            </button>
            <button type="submit" disabled={submitting} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {submitting ? 'Guardando...' : 'Guardar Transacción'}
            </button>
          </div>
        </form>
      </div>
      )}

    </Modal>
  );
};

export default EmpleadoTransaccionesModal;
