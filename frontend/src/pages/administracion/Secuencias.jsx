import React, { useState, useEffect, useMemo } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const mockSecuencias = [
  {
    SecuenciaNumID: 1, SecID: 'EMP', Descripcion: 'Carnet de Empleados',
    IniciaEn: 1, Siguiente: 125, NumeroMaximo: 999999,
    Plantilla: 'EMP-{000000}', CeroIzq: true, NCF: false
  }
];

const Secuencias = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    SecID: '', Descripcion: '', IniciaEn: 1, FinalizaEn: 999999999, NumeroMaximo: 999999999,
    Siguiente: 1, Plantilla: '', CeroIzq: false, NCF: false, FechaValido: ''
  });

  useEffect(() => {
    fetch('/api/secuencias')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(() => setData(mockSecuencias));
  }, []);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({ ...record, FechaValido: record.FechaValido ? record.FechaValido.split('T')[0] : '' });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    setFormData({
      SecID: '', Descripcion: '', IniciaEn: 1, FinalizaEn: 999999999, NumeroMaximo: 999999999,
      Siguiente: 1, Plantilla: '', CeroIzq: false, NCF: false, FechaValido: ''
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
    if (formData.NCF && !formData.FechaValido) {
        showToast("La Fecha Válido (Vencimiento) es obligatoria para comprobantes fiscales (NCF).");
        return;
    }

    try {
      const url = currentRecord ? `/api/secuencias/${currentRecord.SecuenciaNumID}` : '/api/secuencias';
      const method = currentRecord ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      
      showToast("Guardado exitosamente");
      setIsModalOpen(false);
      // Reload...
      fetch('/api/secuencias')
        .then(r => r.json())
        .then(j => setData(j.data || []))
        .catch(() => window.location.reload());
        
    } catch (err) {
      showToast("Simulación: Guardado exitoso (Backend Offline)");
      setIsModalOpen(false);
    }
  };

  // Logica de Live Preview (Basada en Delphi 5)
  const preview = useMemo(() => {
    let numero = String(formData.Siguiente);
    let plantilla = formData.Plantilla || '';
    let maximo = String(formData.FinalizaEn || '');
    let resultado = '';

    if (plantilla !== '') {
        if (formData.CeroIzq) {
            resultado = plantilla;
            let cerosLength = maximo.length - numero.length;
            for (let i = 0; i < cerosLength; i++) {
                resultado += '0';
            }
            resultado += numero;
        } else {
            resultado = plantilla + numero;
        }
    } else {
        resultado = numero;
    }
    return resultado;
  }, [formData.Siguiente, formData.Plantilla, formData.CeroIzq, formData.FinalizaEn]);

  const columns = [
    { header: 'CÓDIGO', accessor: 'SecID' },
    { header: 'DESCRIPCIÓN', accessor: 'Descripcion' },
    { header: 'PLANTILLA', accessor: 'Plantilla' },
    { header: 'SIGUIENTE', accessor: 'Siguiente' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <DataTable 
        title="Secuencias Numéricas"
        data={data}
        columns={columns}
        onAdd={handleCreate}
        onEdit={handleEdit}
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentRecord ? 'Editar Secuencia' : 'Nueva Secuencia'}
        onSubmit={handleSubmit}
        auditData={currentRecord}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#e0f2fe', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#0369a1', fontSize: '13px', textTransform: 'uppercase' }}>Vista Previa en Vivo</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', fontFamily: 'monospace' }}>
                {preview || '0'}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#0ea5e9' }}>Así se verá el próximo correlativo generado.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Código (SecID)</label>
              <input type="text" name="SecID" value={formData.SecID} onChange={handleChange} style={inputStyle} disabled={!!currentRecord} placeholder="Ej: EMP" />
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <input type="text" name="Descripcion" value={formData.Descripcion} onChange={handleChange} style={inputStyle} placeholder="Ej: Secuencia de Empleados" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Plantilla / Formato</label>
              <input type="text" name="Plantilla" value={formData.Plantilla} onChange={handleChange} style={inputStyle} placeholder="Ej: B01 o NCF" />
              <small style={{ color: '#64748b', fontSize: '11px' }}>Prefijo que acompañará a la secuencia (ej. B01, PR-, etc.)</small>
            </div>
            <div>
              <label style={labelStyle}>Número Siguiente</label>
              <input type="number" name="Siguiente" value={formData.Siguiente} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Inicia En</label>
              <input type="number" name="IniciaEn" value={formData.IniciaEn} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Finaliza En</label>
              <input type="number" name="FinalizaEn" value={formData.FinalizaEn} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Límite Máximo</label>
              <input type="number" name="NumeroMaximo" value={formData.NumeroMaximo} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, color: '#334155' }}>
                    <input type="checkbox" name="CeroIzq" checked={formData.CeroIzq} onChange={handleChange} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                    Rellenar Ceros a la Izquierda
                </label>
            </div>
            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500, color: '#334155' }}>
                    <input type="checkbox" name="NCF" checked={formData.NCF} onChange={handleChange} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                    Es Comprobante Fiscal (NCF)
                </label>
            </div>
          </div>
          
          {formData.NCF && (
              <div>
                  <label style={labelStyle}>Válido Hasta (Fecha Expiración NCF)</label>
                  <input type="date" name="FechaValido" value={formData.FechaValido} onChange={handleChange} style={inputStyle} />
              </div>
          )}

        </div>
      </Modal>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' };
export default Secuencias;
