import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const CatalogoCuentas = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // Dependencias (Dropdowns)
  const [monedas, setMonedas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [centroCostos, setCentroCostos] = useState([]);
  const [propositos, setPropositos] = useState([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    CuentaID: '', Descripcion: '', Origen: 0, TipoCuenta: 0,
    MGConsolidacion: '', MGCompensacion: '', MGApertura: '',
    MonedaID: '', DepartamentoId: '', DepartamentoValidar: false,
    CentroCostoId: '', CentroCostoValidar: false,
    PropositoId: '', PropositoValidar: false,
    TipoRelacFinanc: 0, Retencion: false, Bloqueada: false,
    GrupoID: '', SubGrupoID: ''
  });

  const fetchDependencies = async () => {
    try {
        const [monRes, depRes, ccRes, propRes, catRes] = await Promise.all([
            fetch('/api/catalogo/monedas').then(r => r.json()),
            fetch('/api/catalogo/departamentos').then(r => r.json()),
            fetch('/api/catalogo/centro-costos').then(r => r.json()),
            fetch('/api/catalogo/propositos').then(r => r.json()),
            fetch('/api/catalogo').then(r => r.json()) // Para re-cargar la tabla principal
        ]);
        
        setMonedas(monRes.data || []);
        setDepartamentos(depRes.data || []);
        setCentroCostos(ccRes.data || []);
        setPropositos(propRes.data || []);
        setData(catRes.data || []);
    } catch (err) {
        console.error("Error cargando dependencias:", err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({
        ...record,
        DepartamentoValidar: !!record.DepartamentoValidar,
        CentroCostoValidar: !!record.CentroCostoValidar,
        PropositoValidar: !!record.PropositoValidar,
        Retencion: !!record.Retencion,
        Bloqueada: !!record.Bloqueada
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({
      CuentaID: '', Descripcion: '', Origen: 0, TipoCuenta: 0,
      MGConsolidacion: '', MGCompensacion: '', MGApertura: '',
      MonedaID: '', DepartamentoId: '', DepartamentoValidar: false,
      CentroCostoId: '', CentroCostoValidar: false,
      PropositoId: '', PropositoValidar: false,
      TipoRelacFinanc: 0, Retencion: false, Bloqueada: false,
      GrupoID: '', SubGrupoID: ''
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.CuentaID || !formData.Descripcion) {
        showToast("La Cuenta y la Descripción son obligatorias");
        return;
    }

    try {
      const url = currentRecord ? `/api/catalogo/${currentRecord.CuentaID}` : '/api/catalogo';
      const method = currentRecord ? 'PUT' : 'POST';
      
      const payload = {
          ...formData,
          Origen: parseInt(formData.Origen),
          TipoCuenta: parseInt(formData.TipoCuenta),
          TipoRelacFinanc: parseInt(formData.TipoRelacFinanc)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      showToast("Guardado exitosamente");
      setIsModalOpen(false);
      fetchDependencies(); // Reload table
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  // Leyendas Estáticas
  const orignOptions = ['Débito', 'Crédito'];
  const tipoCuentaOptions = ['Totales', 'Gastos', 'Ingresos', 'Costos', 'Capital', 'Activo', 'Pasivo'];
  const relFinancOptions = [
      { id: 0, label: ' ' },
      { id: 1, label: 'Caja' },
      { id: 2, label: 'Otros Activos Actuales' },
      { id: 3, label: 'Otra Equidad' },
      { id: 4, label: 'Costos bienes vendidos' },
      { id: 5, label: 'Otros Activos no Actuales' },
      { id: 6, label: 'Depreciacion' },
      { id: 7, label: 'Propiedad, Planta y Equipos' },
      { id: 8, label: 'Otros Pasivos Actuales' },
      { id: 9, label: 'Ganancias retenidas' },
      { id: 10, label: 'Por Cobrar' },
      { id: 11, label: 'Ventas' },
      { id: 12, label: 'Mercancia Comun Preferida' },
      { id: 13, label: '1' }, { id: 14, label: '2' }, { id: 15, label: '3' }, 
      { id: 16, label: '4' }, { id: 17, label: '5' }, { id: 18, label: '6' }, { id: 19, label: '7' }
  ];

  const columns = [
    { header: 'CUENTA', accessor: 'CuentaID' },
    { header: 'DESCRIPCIÓN', accessor: 'Descripcion' },
    { 
        header: 'ORIGEN', 
        accessor: (row) => orignOptions[row.Origen] || row.Origen 
    },
    { 
        header: 'TIPO', 
        accessor: (row) => tipoCuentaOptions[row.TipoCuenta] || row.TipoCuenta 
    }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Catálogo de Cuentas"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Cuenta' : 'Nueva Cuenta'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
        size="lg"
        maxHeight="85vh"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* COLUMNA IZQUIERDA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* SECCIÓN 1: IDENTIFICACIÓN DE CUENTA */}
          <div style={sectionStyle}>
              <h4 style={sectionTitleStyle}>1. Identificación y Clasificación</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Cuenta ID</label>
                  <input type="text" name="CuentaID" value={formData.CuentaID} onChange={handleChange} style={inputStyle} disabled={!!currentRecord} />
                </div>
                <div>
                  <label style={labelStyle}>Descripción de la Cuenta</label>
                  <input type="text" name="Descripcion" value={formData.Descripcion} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Origen</label>
                  <select name="Origen" value={formData.Origen} onChange={handleChange} style={inputStyle}>
                    {orignOptions.map((opt, i) => <option key={i} value={i}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tipo de Cuenta</label>
                  <select name="TipoCuenta" value={formData.TipoCuenta} onChange={handleChange} style={inputStyle}>
                    {tipoCuentaOptions.map((opt, i) => <option key={i} value={i}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Moneda</label>
                  <select name="MonedaID" value={formData.MonedaID} onChange={handleChange} style={inputStyle}>
                    <option value="">-- No Asignada --</option>
                    {monedas.map(m => <option key={m.MonedaID} value={m.MonedaID}>{m.MonedaID} - {m.Descripcion}</option>)}
                  </select>
                </div>
              </div>
          </div>

          {/* SECCIÓN 2: DEPENDENCIAS CONTABLES */}
          <div style={sectionStyle}>
              <h4 style={sectionTitleStyle}>2. Segmentos y Dimensiones</h4>
              
              <div style={gridRowStyle}>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>Departamento</label>
                    <select name="DepartamentoId" value={formData.DepartamentoId} onChange={handleChange} style={inputStyle}>
                        <option value="">-- No Asignado --</option>
                        {departamentos.map(d => <option key={d.DepartamentoID} value={d.DepartamentoID}>{d.DepartamentoID} - {d.DepartDescripcion}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                      <label style={checkboxLabelStyle}>
                        <input type="checkbox" name="DepartamentoValidar" checked={formData.DepartamentoValidar} onChange={handleChange} /> Validar Depto
                      </label>
                  </div>
              </div>

              <div style={gridRowStyle}>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>Centro de Costo</label>
                    <select name="CentroCostoId" value={formData.CentroCostoId} onChange={handleChange} style={inputStyle}>
                        <option value="">-- No Asignado --</option>
                        {centroCostos.map(c => <option key={c.CentroCostoID} value={c.CentroCostoID}>{c.CentroCostoID} - {c.CCostosDescripcion}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                      <label style={checkboxLabelStyle}>
                        <input type="checkbox" name="CentroCostoValidar" checked={formData.CentroCostoValidar} onChange={handleChange} /> Validar CC
                      </label>
                  </div>
              </div>

              <div style={gridRowStyle}>
                  <div style={{ flex: 2 }}>
                    <label style={labelStyle}>Propósito</label>
                    <select name="PropositoId" value={formData.PropositoId} onChange={handleChange} style={inputStyle}>
                        <option value="">-- No Asignado --</option>
                        {propositos.map(p => <option key={p.PropositoID} value={p.PropositoID}>{p.PropositoID} - {p.PropositoDescripcion}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                      <label style={checkboxLabelStyle}>
                        <input type="checkbox" name="PropositoValidar" checked={formData.PropositoValidar} onChange={handleChange} /> Validar Propósito
                      </label>
                  </div>
              </div>
          </div>

          </div>

          {/* COLUMNA DERECHA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* SECCIÓN 3: PARAMETRIZACIÓN AVANZADA */}
            <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>3. Parametrización y Reportes</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Cuenta Consolidación</label>
                      <select name="MGConsolidacion" value={formData.MGConsolidacion} onChange={handleChange} style={inputStyle}>
                          <option value="">-- Ninguna --</option>
                          {data.map(c => <option key={c.CuentaID} value={c.CuentaID}>{c.CuentaID} - {c.Descripcion}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Cuenta Compensación</label>
                      <select name="MGCompensacion" value={formData.MGCompensacion} onChange={handleChange} style={inputStyle}>
                          <option value="">-- Ninguna --</option>
                          {data.map(c => <option key={c.CuentaID} value={c.CuentaID}>{c.CuentaID} - {c.Descripcion}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Cuenta Apertura</label>
                      <select name="MGApertura" value={formData.MGApertura} onChange={handleChange} style={inputStyle}>
                          <option value="">-- Ninguna --</option>
                          {data.map(c => <option key={c.CuentaID} value={c.CuentaID}>{c.CuentaID} - {c.Descripcion}</option>)}
                      </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={labelStyle}>Relación Financiera</label>
                      <select name="TipoRelacFinanc" value={formData.TipoRelacFinanc} onChange={handleChange} style={inputStyle}>
                          {relFinancOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', padding: '10px 0' }}>
                        <label style={checkboxLabelStyle}>
                          <input type="checkbox" name="Retencion" checked={formData.Retencion} onChange={handleChange} /> 
                          Aplica Retención
                        </label>
                        <label style={checkboxLabelStyle}>
                          <input type="checkbox" name="Bloqueada" checked={formData.Bloqueada} onChange={handleChange} /> 
                          Cuenta Bloqueada
                        </label>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Grupo ID</label>
                      <input type="text" name="GrupoID" value={formData.GrupoID} onChange={handleChange} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Sub-Grupo ID</label>
                      <input type="text" name="SubGrupoID" value={formData.SubGrupoID} onChange={handleChange} style={inputStyle} />
                    </div>
                </div>

            </div>
          </div>

        </div>
      </Modal>
    </div>
  );
};

const sectionStyle = { background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const sectionTitleStyle = { margin: '0 0 16px 0', color: '#0f172a', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' };
const gridRowStyle = { display: 'flex', gap: '16px', marginBottom: '16px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 500, color: '#475569', fontSize: '13px' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, color: '#334155', fontSize: '13px' };

export default CatalogoCuentas;
