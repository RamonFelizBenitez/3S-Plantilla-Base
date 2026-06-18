import React, { useContext, useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { LanguageContext } from '../../i18n/LanguageContext';

const DataTable = ({ title, columns, data, onAdd, onEdit, loading, addButtonLabel = "Agregar" }) => {
  const { t } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => {
      // Búsqueda global en todos los valores de la fila
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, searchTerm]);

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>{title}</h2>
        {onAdd && (
          <button 
            className="btn-primary" 
            onClick={onAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            <Plus size={18} /> {addButtonLabel}
          </button>
        )}
      </div>

      <div className="table-card">
        {/* Barra de herramientas / Búsqueda */}
        {!loading && data.length > 0 && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span style={{ fontSize: '13px', color: 'var(--clr-text-2)', fontWeight: '500' }}>Buscar:</span>
               <div style={{ position: 'relative' }}>
                 <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   style={{ padding: '6px 12px', paddingRight: '30px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', outline: 'none', width: '250px' }}
                   placeholder="Escriba para filtrar..."
                 />
                 <Search size={14} style={{ position: 'absolute', right: '10px', top: '9px', color: '#94a3b8' }} />
               </div>
            </div>
          </div>
        )}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando datos...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.header}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  <td>
                    <button className="btn-action-pill" onClick={() => onEdit(row)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    {searchTerm ? "No se encontraron resultados para la búsqueda." : "No hay registros disponibles."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataTable;
