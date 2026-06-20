import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const DependenciaCargosModal = ({ isOpen, onClose, dependenciaId, dependenciaDesc }) => {
  const [allCargos, setAllCargos] = useState([]);
  const [assignedCargoIds, setAssignedCargoIds] = useState([]);
  
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  
  const [selectedLeft, setSelectedLeft] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && dependenciaId) {
      loadData();
      // Reset states
      setLeftSearch('');
      setRightSearch('');
      setSelectedLeft([]);
      setSelectedRight([]);
    }
  }, [isOpen, dependenciaId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const empresaId = 1; // Ajustar a localStorage.getItem('empresaId') en produccion
      
      // 1. Obtener todos los cargos maestros
      const resCargos = await fetch(`/api/cargos?empresaId=${empresaId}`);
      const dataCargos = await resCargos.json();
      
      // 2. Obtener los cargos actualmente asignados a esta dependencia
      const resAsignados = await fetch(`/api/configuracion/dependencias/${dependenciaId}/cargos`);
      const dataAsignados = await resAsignados.json();
      
      if (Array.isArray(dataCargos)) {
        setAllCargos(dataCargos);
      }
      if (Array.isArray(dataAsignados)) {
        setAssignedCargoIds(dataAsignados.map(a => a.CargoID));
      }
    } catch (err) {
      Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de listas
  const unassignedCargos = allCargos.filter(c => !assignedCargoIds.includes(c.CargoID));
  const assignedCargos = allCargos.filter(c => assignedCargoIds.includes(c.CargoID));

  const filteredLeft = unassignedCargos.filter(c => c.Descripcion.toLowerCase().includes(leftSearch.toLowerCase()));
  const filteredRight = assignedCargos.filter(c => c.Descripcion.toLowerCase().includes(rightSearch.toLowerCase()));

  // Manejo de selecciones
  const toggleLeft = (id) => {
    setSelectedLeft(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  const toggleRight = (id) => {
    setSelectedRight(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Movimientos
  const moveRight = () => {
    setAssignedCargoIds(prev => [...prev, ...selectedLeft]);
    setSelectedLeft([]);
  };

  const moveLeft = () => {
    setAssignedCargoIds(prev => prev.filter(id => !selectedRight.includes(id)));
    setSelectedRight([]);
  };

  const moveAllRight = () => {
    setAssignedCargoIds(prev => [...prev, ...filteredLeft.map(c => c.CargoID)]);
    setSelectedLeft([]);
  };

  const moveAllLeft = () => {
    const idsToRemove = filteredRight.map(c => c.CargoID);
    setAssignedCargoIds(prev => prev.filter(id => !idsToRemove.includes(id)));
    setSelectedRight([]);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/configuracion/dependencias/${dependenciaId}/cargos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cargoIds: assignedCargoIds,
          CreadoPor: 1
        })
      });

      if (!res.ok) throw new Error('Error al sincronizar');
      
      Swal.fire('Éxito', 'Estructura Organizativa Actualizada', 'success');
      onClose();
    } catch (err) {
      Swal.fire('Error', 'Hubo un error al guardar', 'error');
    }
  };

  const listContainerStyle = {
    flex: 1,
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    height: '350px'
  };

  const itemStyle = (isSelected) => ({
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    background: isSelected ? '#eff6ff' : '#fff',
    color: isSelected ? '#1d4ed8' : '#334155',
    fontSize: '13px'
  });

  return (
    <Modal 
      title={`Cargos de: ${dependenciaDesc || dependenciaId}`} 
      isOpen={isOpen} 
      onClose={onClose}
      hideFooter={true}
      size="xl"
    >
      <div style={{ marginBottom: '15px' }}>
        <p style={{ color: '#475569', fontSize: '14px' }}>
          Seleccione los cargos de la izquierda que formarán parte de la estructura organizativa de esta dependencia y páselos a la derecha.
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '20px' }}>Cargando...</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          
          {/* Lista Izquierda: Disponibles */}
          <div style={listContainerStyle}>
            <div style={{ padding: '10px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1', borderRadius: '6px 6px 0 0' }}>
              <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '8px' }}>Cargos Maestros Disponibles</strong>
              <input 
                type="text" 
                placeholder="Buscar cargo..." 
                value={leftSearch}
                onChange={(e) => setLeftSearch(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '12px' }}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredLeft.map(c => (
                <div 
                  key={c.CargoID} 
                  style={itemStyle(selectedLeft.includes(c.CargoID))}
                  onClick={() => toggleLeft(c.CargoID)}
                >
                  {c.Descripcion}
                </div>
              ))}
              {filteredLeft.length === 0 && <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>Sin resultados</div>}
            </div>
          </div>

          {/* Controles del Centro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={moveAllRight} title="Pasar todos" style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>{'>>'}</button>
            <button onClick={moveRight} disabled={selectedLeft.length === 0} title="Pasar seleccionados" style={{ padding: '6px 12px', background: selectedLeft.length > 0 ? '#3b82f6' : '#f1f5f9', color: selectedLeft.length > 0 ? '#fff' : '#94a3b8', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>{'>'}</button>
            <button onClick={moveLeft} disabled={selectedRight.length === 0} title="Quitar seleccionados" style={{ padding: '6px 12px', background: selectedRight.length > 0 ? '#ef4444' : '#f1f5f9', color: selectedRight.length > 0 ? '#fff' : '#94a3b8', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>{'<'}</button>
            <button onClick={moveAllLeft} title="Quitar todos" style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>{'<<'}</button>
          </div>

          {/* Lista Derecha: Asignados */}
          <div style={listContainerStyle}>
            <div style={{ padding: '10px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', borderRadius: '6px 6px 0 0' }}>
              <strong style={{ fontSize: '13px', color: '#166534', display: 'block', marginBottom: '8px' }}>Cargos Asignados a Dependencia ({assignedCargoIds.length})</strong>
              <input 
                type="text" 
                placeholder="Filtrar asignados..." 
                value={rightSearch}
                onChange={(e) => setRightSearch(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #bbf7d0', outline: 'none', fontSize: '12px' }}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredRight.map(c => (
                <div 
                  key={c.CargoID} 
                  style={itemStyle(selectedRight.includes(c.CargoID))}
                  onClick={() => toggleRight(c.CargoID)}
                >
                  {c.Descripcion}
                </div>
              ))}
              {filteredRight.length === 0 && <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>Aún no hay cargos asignados</div>}
            </div>
          </div>

        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: '500' }}>
          Cancelar
        </button>
        <button onClick={handleSave} style={{ padding: '8px 16px', border: 'none', background: '#2563eb', borderRadius: '6px', cursor: 'pointer', color: '#fff', fontWeight: '500' }}>
          Guardar Cambios
        </button>
      </div>

    </Modal>
  );
};

export default DependenciaCargosModal;
