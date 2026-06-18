import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const Monedas = () => {
  const [data, setData] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const [formData, setFormData] = useState({
    MonedaID: '',
    Descripcion: '',
    MgCuentaPerdida: '',
    MgCuentaGanancia: '',
    Simbolo: '',
    Multiplicador: 0
  });

  const fetchData = async () => {
    try {
      const [monedasRes, cuentasRes] = await Promise.all([
        fetch('/api/monedas').then(r => r.json()),
        fetch('/api/catalogo').then(r => r.json())
      ]);
      setData(monedasRes.data || []);
      setCuentas(cuentasRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({
      ...record,
      Multiplicador: parseFloat(record.Multiplicador) || 0
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({
      MonedaID: '',
      Descripcion: '',
      MgCuentaPerdida: '',
      MgCuentaGanancia: '',
      Simbolo: '',
      Multiplicador: 0
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (record) => {
    if (!(await showConfirm(`¿Seguro que desea eliminar la moneda ${record.MonedaID}?`))) return;
    try {
      const res = await fetch(`/api/monedas/${record.MonedaID}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!formData.MonedaID || !formData.Descripcion) {
      showToast("El ID de Moneda y la Descripción son obligatorios.");
      return;
    }
    try {
      const url = currentRecord ? `/api/monedas/${currentRecord.MonedaID}` : '/api/monedas';
      const method = currentRecord ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      showToast(json.message);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const columns = [
    { header: 'ID MONEDA', accessor: 'MonedaID' },
    { header: 'DESCRIPCIÓN', accessor: 'Descripcion' },
    { header: 'SÍMBOLO', accessor: 'Simbolo' },
    { header: 'MULTIPLICADOR', accessor: 'Multiplicador' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Catálogo de Monedas"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Moneda' : 'Nueva Moneda'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>ID Moneda (Máx 3 chars)</label>
              <input 
                type="text" 
                name="MonedaID" 
                value={formData.MonedaID} 
                onChange={handleChange} 
                style={inputStyle} 
                disabled={!!currentRecord}
                maxLength={3}
              />
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <input 
                type="text" 
                name="Descripcion" 
                value={formData.Descripcion} 
                onChange={handleChange} 
                style={inputStyle} 
                maxLength={30}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Símbolo</label>
              <input 
                type="text" 
                name="Simbolo" 
                value={formData.Simbolo} 
                onChange={handleChange} 
                style={inputStyle} 
                maxLength={5}
              />
            </div>
            <div>
              <label style={labelStyle}>Multiplicador (Tasa)</label>
              <input 
                type="number" 
                name="Multiplicador" 
                value={formData.Multiplicador} 
                onChange={handleChange} 
                style={inputStyle}
                step="0.000000000001"
              />
            </div>
          </div>

          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>Asociación Contable</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Cuenta de Pérdida por Diferencia Cambiaria</label>
                  <select name="MgCuentaPerdida" value={formData.MgCuentaPerdida} onChange={handleChange} style={inputStyle}>
                    <option value="">-- No Asignada --</option>
                    {cuentas.map(c => <option key={c.CuentaID} value={c.CuentaID}>{c.CuentaID} - {c.Descripcion}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Cuenta de Ganancia por Diferencia Cambiaria</label>
                  <select name="MgCuentaGanancia" value={formData.MgCuentaGanancia} onChange={handleChange} style={inputStyle}>
                    <option value="">-- No Asignada --</option>
                    {cuentas.map(c => <option key={c.CuentaID} value={c.CuentaID}>{c.CuentaID} - {c.Descripcion}</option>)}
                  </select>
                </div>
              </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, color: '#475569', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' };

export default Monedas;
