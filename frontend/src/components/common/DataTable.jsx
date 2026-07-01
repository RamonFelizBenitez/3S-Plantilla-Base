import React, { useContext, useState, useMemo } from 'react';
import { Plus, Search, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageContext } from '../../i18n/LanguageContext';

const DataTable = ({ title, columns, data, onAdd, onEdit, loading, addButtonLabel = "Agregar", renderActions, hideMainHeader = false, editLabel, extraControls }) => {
  const { t } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrado de datos global
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => {
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, searchTerm]);

  // Si cambia el filtro o filas por página, reiniciar a la página 1
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  // Lógica de Paginación
  const totalPages = rowsPerPage === 'all' ? 1 : Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    if (rowsPerPage === 'all') return filteredData;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + parseInt(rowsPerPage));
  }, [filteredData, currentPage, rowsPerPage]);

  // Exportar a Excel (CSV nativo)
  const exportToExcel = () => {
    if (filteredData.length === 0) return;
    
    // Obtener los nombres de las columnas reales
    const headers = columns.map(col => col.header).join(',');
    
    // Mapear los datos de las filas
    const csvRows = filteredData.map(row => {
      return columns.map(col => {
        // Si hay una función de render, intentar usarla si devuelve un string simple. Si es JSX, usar el valor original.
        let val = row[col.accessor];
        if (col.render) {
          const renderedVal = col.render(row);
          if (typeof renderedVal === 'string' || typeof renderedVal === 'number') {
            val = renderedVal;
          }
        }
        
        // Escapar comillas dobles y comas envolviendo en comillas dobles
        const strVal = String(val !== null && val !== undefined ? val : '');
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...csvRows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-section active" style={{ animation: 'none' }}>
      
      {/* 1. Cabecera Estilo Institucional */}
      {!hideMainHeader && (
        <div style={{ background: '#004b93', padding: '16px 20px', borderRadius: '4px 4px 0 0', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#ffffff' }}>{title}</h2>
        </div>
      )}

      <div className="table-card" style={!hideMainHeader ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 } : {}}>
        
        {/* 2. Botón Nueva Entidad (separado arriba) */}
        {onAdd && (
          <div style={{ padding: '16px 20px', paddingBottom: '0' }}>
            <button 
              onClick={onAdd}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
            >
              <Plus size={16} /> {addButtonLabel !== "Agregar" ? addButtonLabel : `Nueva ${title.split(' ').pop()}`}
            </button>
          </div>
        )}

        {/* 3. Barra de Controles: Excel, Selector de Filas y Búsqueda */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexWrap: 'wrap', gap: '15px' }}>
          
          {/* Lado Izquierdo: Botones y Selectores */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={exportToExcel}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', color: '#334155', fontWeight: '500' }}
            >
               Exportar Excel
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>Mostrar</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => setRowsPerPage(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value="all">Todas</option>
              </select>
              <span style={{ fontSize: '13px', color: '#475569' }}>filas</span>
            </div>
          </div>

          {/* Lado Derecho: Controles Extra y Búsqueda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, justifyContent: 'flex-end' }}>
            {extraControls}
            
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 style={{ padding: '6px 12px', paddingLeft: '30px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', outline: 'none', width: '100%' }}
               />
             </div>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Cargando datos...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx}>{col.header}</th>
                  ))}
                  <th style={{ width: '100px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col, cIdx) => (
                      <td key={cIdx}>
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                    <td style={{ display: 'flex', gap: '8px' }}>
                      {onEdit && (
                        <button className="btn-action-pill" onClick={() => onEdit(row)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                          {editLabel ? (typeof editLabel === 'function' ? editLabel(row) : editLabel) : "Editar"}
                        </button>
                      )}
                      {renderActions && renderActions(row, idx, filteredData.length)}
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
          </div>
        )}

        {/* 5. Controles de Paginación */}
        {!loading && rowsPerPage !== 'all' && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Mostrando {(currentPage - 1) * rowsPerPage + 1} a {Math.min(currentPage * rowsPerPage, filteredData.length)} de {filteredData.length} registros
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                style={{ padding: '6px 10px', background: currentPage === 1 ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', color: '#334155' }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                {currentPage} / {totalPages}
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                style={{ padding: '6px 10px', background: currentPage === totalPages ? '#e2e8f0' : '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', color: '#334155' }}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DataTable;
