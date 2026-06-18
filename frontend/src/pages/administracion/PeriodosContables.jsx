import React, { useState, useEffect } from 'react';
import { showToast, showConfirm } from '../../utils/alerts';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const PeriodosContables = () => {
  const [data, setData] = useState([]);
  const [isGenerarOpen, setIsGenerarOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEliminarOpen, setIsEliminarOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [deleteCodigo, setDeleteCodigo] = useState('');
  
  const [genData, setGenData] = useState({ FecInicioPeriodo: '', TipoPeriodo: 'M' });
  const [editData, setEditData] = useState({ Estado: 'Abierto', Comentario: '' });

  const fetchData = () => {
    fetch('/api/periodos')
      .then(res => res.json())
      .then(json => setData(json.data || []))
      .catch(() => console.log('Backend offline'));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerarSubmit = async () => {
    try {
      const res = await fetch('/api/periodos/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message + ' (' + json.totalGenerados + ' creados)');
      setIsGenerarOpen(false);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/periodos/${currentRecord.PeriodoID}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message);
      setIsEditOpen(false);
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteCodigo) {
      showToast("Ingrese el código (Año) a eliminar.");
      return;
    }
    if (!(await showConfirm(`¿Está seguro de suprimir el lote de periodos para el código ${deleteCodigo}? Si existen transacciones, la operación será rechazada.`))) return;
    try {
      const res = await fetch(`/api/periodos/${deleteCodigo}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message);
      setIsEliminarOpen(false);
      setDeleteCodigo('');
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const columns = [
    { header: 'CÓDIGO', accessor: 'CodigoPeriodo' },
    { header: 'TIPO', accessor: 'TipoPeriodo' },
    { header: 'INICIO', accessor: (row) => row.FecInicioPeriodo?.split('T')[0] },
    { header: 'FIN', accessor: (row) => row.FecFinPeriodo?.split('T')[0] },
    { 
      header: 'ESTADO', 
      accessor: (row) => (
        <span style={{ 
          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
          background: row.Estado === 'Abierto' ? '#dcfce7' : row.Estado === 'Detenido' ? '#fef08a' : '#fee2e2',
          color: row.Estado === 'Abierto' ? '#166534' : row.Estado === 'Detenido' ? '#854d0e' : '#991b1b'
        }}>
          {row.Estado}
        </span>
      )
    },
    { header: 'COMENTARIO', accessor: 'Comentario' }
  ];

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Periodos Contables</h2>
        <div>
          <button 
            onClick={() => setIsEliminarOpen(true)}
            style={{ padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, marginRight: '10px' }}
          >
            - Eliminar Periodos
          </button>
          <button 
            onClick={() => setIsGenerarOpen(true)}
            style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            + Generar Períodos
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((c, i) => <th key={i} style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>{c.header}</th>)}
              <th style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.PeriodoID} style={{ borderBottom: '1px solid #e2e8f0' }}>
                {columns.map((c, i) => (
                  <td key={i} style={{ padding: '12px 16px', fontSize: '14px', color: '#334155' }}>
                    {typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor]}
                  </td>
                ))}
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => { setCurrentRecord(row); setEditData({ Estado: row.Estado, Comentario: row.Comentario || '' }); setIsEditOpen(true); }} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>Editar</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay periodos generados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal Generar */}
      <Modal isOpen={isGenerarOpen} onClose={() => setIsGenerarOpen(false)} title="Generador de Períodos Contables" onSubmit={handleGenerarSubmit}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Fecha de Inicio del Año Fiscal</label>
            <input type="date" value={genData.FecInicioPeriodo} onChange={e => setGenData({...genData, FecInicioPeriodo: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tipo de Periodo</label>
            <select value={genData.TipoPeriodo} onChange={e => setGenData({...genData, TipoPeriodo: e.target.value})} style={inputStyle}>
              <option value="A">A = Anual</option>
              <option value="T">T = Trimestral</option>
              <option value="M">M = Mensual</option>
              <option value="C">C = Cuatro Semanas</option>
              <option value="Q">Q = 4-4-5 Semanas (Retail)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Actualizar Estado del Período" onSubmit={handleEditSubmit} auditData={currentRecord}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {currentRecord?.Estado === 'Cerrado' ? (
            <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px' }}>
              Este periodo está <b>Cerrado</b> y no puede ser re-abierto manualmente por medidas de seguridad.
            </div>
          ) : (
            <>
              <div>
                <label style={labelStyle}>Estado del Periodo</label>
                <select value={editData.Estado} onChange={e => setEditData({...editData, Estado: e.target.value})} style={inputStyle}>
                  <option value="Abierto">Abierto</option>
                  <option value="Detenido">Detenido</option>
                  <option value="Cerrado" disabled>Cerrado (Solo vía proceso)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Comentario / Justificación</label>
                <textarea value={editData.Comentario} onChange={e => setEditData({...editData, Comentario: e.target.value})} style={{...inputStyle, height: '80px'}} />
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={isEliminarOpen} onClose={() => setIsEliminarOpen(false)} title="Eliminar Lote de Períodos Contables" onSubmit={handleDeleteSubmit} size="sm" maxHeight="40vh">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', fontSize: '13px' }}>
            Se eliminarán todos los periodos generados para el Código (Año) introducido, siempre y cuando no tengan transacciones asociadas en MGTRANS.
          </div>
          <div>
            <label style={labelStyle}>Código de Periodo (Año) a Eliminar</label>
            <input 
              type="number" 
              value={deleteCodigo} 
              onChange={e => setDeleteCodigo(e.target.value)} 
              style={inputStyle} 
              placeholder="Ej: 2026"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' };
export default PeriodosContables;
