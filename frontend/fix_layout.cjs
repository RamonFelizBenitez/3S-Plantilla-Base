const fs = require('fs');

const path = 'c:/Users/Administrator/Desktop/Sistema de Gestion/frontend/src/pages/recursos_humanos/Amonestaciones.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
            {/* Columna Izquierda - Formulario Principal */}
            <div>
              <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '14px' }}>Selección de Empleado</h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Empleado *</label>
                  <select name="EmpleadoID" value={formData.EmpleadoID} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="">Seleccione un empleado...</option>
                    {empleados.filter(e => e.Estatus === 0).map(e => <option key={e.EmpleadoID} value={e.EmpleadoID}>{e.Cedula} - {e.Nombres} {e.Apellido1} {e.Apellido2 || ''}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Cédula</label>
                    <input type="text" value={formData.Cedula} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Dependencia</label>
                    <input type="text" value={formData.DependenciaDesc} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Cargo</label>
                    <input type="text" value={formData.CargoDesc} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Sueldo</label>
                    <input type="text" value={formData.Salario ? \`$\${parseFloat(formData.Salario).toLocaleString('en-US', { minimumFractionDigits: 2 })}\` : '0.00'} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: '#e2e8f0' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '14px' }}>Datos de Amonestación</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Tipo de Acción *</label>
                    <select name="TipoAccionID" value={formData.TipoAccionID} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Seleccione tipo...</option>
                      {tiposAcciones.filter(t => t.TipoAccionID >= 40 && t.TipoAccionID <= 49).map(t => <option key={t.TipoAccionID} value={t.TipoAccionID}>{t.TipoAccionID} - {t.Descripcion}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Fecha *</label>
                    <input type="date" name="Fecha" value={formData.Fecha} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Grado *</label>
                    <select name="Grado" value={formData.Grado} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Seleccionar...</option>
                      <option value="Primer Grado">Primer Grado</option>
                      <option value="Segundo Grado">Segundo Grado</option>
                      <option value="Tercer Grado">Tercer Grado</option>
                      <option value="Cuarto Grado">Cuarto Grado</option>
                      <option value="Quinto Grado">Quinto Grado</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Clasificación *</label>
                    <select name="ClasificacionID" value={formData.ClasificacionID} onChange={handleChange} required disabled={formData.Aprobado} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Seleccione...</option>
                      {clasificacionesFiltradas.map(c => <option key={c.ClasificacionID} value={c.ClasificacionID}>{c.Descripcion}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Documento *</label>
                  <input type="text" name="Documento" value={formData.Documento} onChange={handleChange} required disabled={formData.Aprobado} placeholder="Documento soporte..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ marginTop: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Observaciones</label>
                  <textarea name="Observacion" value={formData.Observacion} onChange={handleChange} disabled={formData.Aprobado} placeholder="Indique el motivo o notas adicionales..." style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', height: '45px', resize: 'vertical' }}></textarea>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Estado y Control */}
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '15px', borderBottom: '2px solid #cbd5e1', paddingBottom: '6px' }}>Estado y Control (Sólo Lectura)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>ID Empleado</label>
                  <input type="text" value={formData.EmpleadoID} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}># Nombramiento</label>
                  <input type="text" value={formData.NumeroNombramiento} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Aprobado</label>
                  <input type="text" value={formData.Aprobado ? 'SÍ' : 'NO'} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Fecha Aprobado *</label>
                  <input type="text" value={formatDateTime(formData.FechaAprobado)} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Procesado</label>
                  <input type="text" value={formData.Procesado ? 'SÍ' : 'NO'} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Fecha Nombramiento *</label>
                  <input type="text" value={formatDateTime(formData.FechaNombramiento)} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#475569' }}>Anulado</label>
                <input type="text" value={formData.Anulado ? 'SÍ' : 'NO'} disabled style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            {!formData.Aprobado && (
              <button type="submit" className="btn-primary">Guardar Registro</button>
            )}
          </div>
        </form>`;

const startIdx = content.indexOf('<form onSubmit={handleSubmit} style={{ display: \'flex\', flexDirection: \'column\', gap: \'15px\' }}>');
const endIdxStr = '<form onSubmit={handleTomaPosesionSubmit}>';
const endFormIdx = content.indexOf('</form>', startIdx);
const endSectionIdx = content.indexOf('</Modal>', endFormIdx);

content = content.substring(0, startIdx) + replacement + '\n      </Modal>\n' + content.substring(endSectionIdx + 8);

fs.writeFileSync(path, content);
