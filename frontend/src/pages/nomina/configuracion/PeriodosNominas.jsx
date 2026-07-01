import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import DataTable from '../../../components/common/DataTable';
import Modal from '../../../components/common/Modal';

const PeriodosNominas = () => {
  const empresaId = '1';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isGenerarOpen, setIsGenerarOpen] = useState(false);
  const [isEliminarOpen, setIsEliminarOpen] = useState(false);
  
  const [genData, setGenData] = useState({ FechaInicioStr: '', TipoPago: 3 });
  const [deleteData, setDeleteData] = useState({ CodigoPeriodo: '', TipoPago: 3 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/periodos-nominas?Empresaid=${empresaId}`);
      setData(res.data.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudieron cargar los periodos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTipoPagoText = (tipo) => {
    switch (tipo) {
      case 0: return 'Semanal';
      case 1: return 'Bisemanal';
      case 2: return 'Quincenal';
      case 3: return 'Mensual';
      default: return 'Desconocido';
    }
  };

  const handleGenerarSubmit = async (e) => {
    e.preventDefault();
    if (!genData.FechaInicioStr) {
      return Swal.fire('Atención', 'Seleccione una fecha de inicio', 'warning');
    }
    
    try {
      setLoading(true);
      const res = await axios.post('/api/periodos-nominas/generar', {
        Empresaid: empresaId,
        FechaInicioStr: genData.FechaInicioStr,
        TipoPago: parseInt(genData.TipoPago, 10)
      });
      Swal.fire('Éxito', res.data.message + ` (${res.data.totalGenerados} periodos)`, 'success');
      setIsGenerarOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.error || 'No se pudieron generar los periodos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!deleteData.CodigoPeriodo) {
      return Swal.fire('Atención', 'Debe especificar el año', 'warning');
    }

    const confirm = await Swal.fire({
      title: '¿Eliminar lote de periodos?',
      text: `Se eliminarán los periodos para el año ${deleteData.CodigoPeriodo} y Tipo ${getTipoPagoText(parseInt(deleteData.TipoPago, 10))}.`,
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
        const res = await axios.delete(`/api/periodos-nominas/${deleteData.CodigoPeriodo}/${deleteData.TipoPago}?Empresaid=${empresaId}`);
        Swal.fire('Eliminado', res.data.message, 'success');
        setIsEliminarOpen(false);
        fetchData();
      } catch (err) {
        Swal.fire('Error', err.response?.data?.error || 'Error al eliminar', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { header: 'Año (Código)', accessor: 'CodigoPeriodo' },
    { header: 'Tipo de Nómina', accessor: (row) => getTipoPagoText(row.TipoPago) },
    { header: 'Secuencia', accessor: 'Secuencia' },
    { header: 'Intervalo', accessor: 'Intervalo' },
    { 
      header: 'Posteado', 
      accessor: (row) => (
        <span style={{ 
          padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
          background: row.Posteado ? '#dcfce7' : '#f1f5f9',
          color: row.Posteado ? '#166534' : '#64748b'
        }}>
          {row.Posteado ? 'Sí' : 'No'}
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>Periodos de Nóminas</h2>
        <div>
          <button 
            onClick={() => setIsEliminarOpen(true)}
            style={{ padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}
          >
            - Eliminar Lote
          </button>
          <button 
            onClick={() => setIsGenerarOpen(true)}
            style={{ padding: '10px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Crear Periodos
          </button>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
      />

      {/* Modal Generar */}
      <Modal isOpen={isGenerarOpen} onClose={() => setIsGenerarOpen(false)} title="Generar Lote de Periodos" hideFooter={true}>
        <form onSubmit={handleGenerarSubmit} style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Fecha de Inicio</label>
            <input 
              type="date" 
              required
              value={genData.FechaInicioStr} 
              onChange={e => setGenData({...genData, FechaInicioStr: e.target.value})} 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Tipo de Nómina</label>
            <select 
              value={genData.TipoPago} 
              onChange={e => setGenData({...genData, TipoPago: e.target.value})} 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="0">Semanal</option>
              <option value="1">Bisemanal</option>
              <option value="2">Quincenal</option>
              <option value="3">Mensual</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
             <button
              type="button"
              onClick={() => setIsGenerarOpen(false)}
              style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Generando...' : 'Generar Periodos'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={isEliminarOpen} onClose={() => setIsEliminarOpen(false)} title="Eliminar Lote" hideFooter={true}>
        <form onSubmit={handleDeleteSubmit} style={{ padding: '20px' }}>
          <div style={{ padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            Eliminará todos los periodos del año y tipo especificado, siempre y cuando no estén posteados.
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Año (Código Periodo)</label>
            <input 
              type="number" 
              required
              value={deleteData.CodigoPeriodo} 
              onChange={e => setDeleteData({...deleteData, CodigoPeriodo: e.target.value})} 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              placeholder="Ej: 2024"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#475569' }}>Tipo de Nómina</label>
            <select 
              value={deleteData.TipoPago} 
              onChange={e => setDeleteData({...deleteData, TipoPago: e.target.value})} 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="0">Semanal</option>
              <option value="1">Bisemanal</option>
              <option value="2">Quincenal</option>
              <option value="3">Mensual</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
             <button
              type="button"
              onClick={() => setIsEliminarOpen(false)}
              style={{ padding: '8px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Eliminando...' : 'Eliminar Lote'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PeriodosNominas;
