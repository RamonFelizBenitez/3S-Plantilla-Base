import React, { useState, useEffect } from 'react';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Swal from 'sweetalert2';

const InputGroup = ({ label, name, type="text", options=[], width="100%", isRequired=false, disabled=false, value, onChange }) => (
  <div style={{ marginBottom: '12px', width }}>
    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#475569' }}>{label} {isRequired && '*'}</label>
    {type === 'select' ? (
      <select name={name} value={value} onChange={onChange} disabled={disabled} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: disabled ? '#f1f5f9' : '#fff' }}>
        <option value="">Seleccione...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : type === 'checkbox' ? (
      <input type="checkbox" name={name} checked={!!value} onChange={onChange} disabled={disabled} style={{ transform: 'scale(1.2)' }} />
    ) : (
      <input type={type} name={name} value={value || ''} onChange={onChange} disabled={disabled} maxLength={type==='text'?200:undefined} required={isRequired} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: disabled ? '#f1f5f9' : '#fff' }} />
    )}
  </div>
);

const TiposNominas = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [catalogo, setCatalogo] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [secuencias, setSecuencias] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const getInitialForm = () => ({
    TipoNominaID: '', Descripcion: '', CuentaIDContrapartida: '', SecComprobante: '', TipoPago: 1, MonedaID: '',
    MinimoHoras: 0, MinimoHorasObligatorio: false, PagarSalario: true, PagarHoras: false,
    CalcularAFP: false, PeriodoAFP: 1, CalcularARS: false, PeriodoARS: 1, CalcularISR: false, PeriodoISR: 1, CalcularDependientes: false, PeriodoDependiente: 1,
    HoraEntrada: '', HoraEntradaaLM: '', HoraEntradaObligatoria: false, HoraEntradaalmObligatoria: false,
    PromedioDiasMes: 0, PromedioHorasMes: 0, CalcBaseHoraProm: 1, HorasenDia: 8, MontoDependiente: 0,
    CtaPresupuesto: '', SecuenciaSG: '', Capitulo: '', SubCapitulo: '', DAD: '', UE: '', Programa: '', SubPrograma: '', Proyecto: '', Region: '', Provincia: '', Municipio: '', Funcion: '', Concepto: ''
  });

  const [formData, setFormData] = useState(getInitialForm());

  useEffect(() => {
    fetchData();
    fetchCombos();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/configuracion/tipos-nominas?empresaId=1');
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      Swal.fire('Error', 'Error al cargar tipos de nóminas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCombos = async () => {
    try {
      const resCat = await fetch('/api/catalogo');
      const jsonCat = await resCat.json();
      setCatalogo(jsonCat.data || []);
      
      const resMon = await fetch('/api/monedas'); // Asumiendo que existe o usamos hardcoded si no
      if(resMon.ok) {
        const jsonMon = await resMon.json();
        setMonedas(jsonMon.data || []);
      } else {
        setMonedas([{MonedaID: 'DOP', Descripcion: 'Peso Dominicano'}, {MonedaID: 'USD', Descripcion: 'Dólar'}]);
      }

      const resSec = await fetch('/api/secuencias');
      if(resSec.ok) {
        const jsonSec = await resSec.json();
        setSecuencias(jsonSec.data || []);
      }
    } catch (err) {
      console.log('Error combos:', err);
    }
  };

  const columns = [
    { accessor: 'TipoNominaID', header: 'Código' },
    { accessor: 'Descripcion', header: 'Descripción' },
    { accessor: 'MonedaID', header: 'Moneda' }
  ];

  const handleOpenForm = (row = null) => {
    setActiveTab(0);
    if (row) {
      setEditId(row.TipoNominaID);
      // Format datetimes to input[type="datetime-local"]
      const formatDT = (dt) => dt ? new Date(dt).toISOString().slice(0, 16) : '';
      setFormData({ 
        ...row, 
        HoraEntrada: formatDT(row.HoraEntrada),
        HoraEntradaaLM: formatDT(row.HoraEntradaaLM)
      });
    } else {
      setEditId(null);
      setFormData(getInitialForm());
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.TipoNominaID || !formData.Descripcion) {
      Swal.fire('Atención', 'Código y Descripción son obligatorios', 'warning');
      return;
    }

    try {
      const url = editId ? `/api/configuracion/tipos-nominas/${editId}` : '/api/configuracion/tipos-nominas';
      const method = editId ? 'PUT' : 'POST';

      const payload = { ...formData, EmpresaId: '1', CreadoPor: '1', ModificadoPor: '1' };
      // Limpiar fechas vacias
      if(!payload.HoraEntrada) delete payload.HoraEntrada;
      if(!payload.HoraEntradaaLM) delete payload.HoraEntradaaLM;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Error al guardar');

      Swal.fire('Éxito', 'Guardado exitosamente', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí'
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/configuracion/tipos-nominas/${id}?empresaId=1`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      fetchData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const tabStyle = (index) => ({
    padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === index ? '2px solid #2563eb' : '2px solid transparent',
    color: activeTab === index ? '#2563eb' : '#64748b', fontWeight: activeTab === index ? '600' : '400'
  });



  const periodoOptions = [
    { value: 1, label: 'Todos Siempre' },
    { value: 2, label: '1ra. Primera Quincena' },
    { value: 3, label: '2da. Segunda Quincena' }
  ];

  return (
    <>
      <DataTable title="Tipos de Nóminas" columns={columns} data={data} loading={loading} onAdd={() => handleOpenForm()} onEdit={handleOpenForm}
        renderActions={(row) => (
          <button className="btn-action-pill" onClick={() => handleDelete(row.TipoNominaID)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px' }}>Eliminar</button>
        )}
      />

      <Modal title={editId ? "Editar Tipo Nómina" : "Nuevo Tipo Nómina"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} hideFooter={true} size="xl">
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '15px' }}>
          <div style={tabStyle(0)} onClick={() => setActiveTab(0)}>Datos Generales</div>
          <div style={tabStyle(1)} onClick={() => setActiveTab(1)}>Reglas y Cálculos</div>
          <div style={tabStyle(2)} onClick={() => setActiveTab(2)}>Presupuesto</div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* TAB 1: DATOS GENERALES */}
          <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <InputGroup label="Código" name="TipoNominaID" isRequired disabled={!!editId} width="30%" value={formData.TipoNominaID} onChange={handleChange} />
              <InputGroup label="Descripción" name="Descripcion" isRequired width="70%" value={formData.Descripcion} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <InputGroup label="Tipo de Pago" name="TipoPago" type="select" width="30%" options={[{value:0, label:'Semanal'}, {value:1, label:'Bisemanal'}, {value:2, label:'Quincenal'}, {value:3, label:'Mensual'}]} value={formData.TipoPago} onChange={handleChange} />
              <InputGroup label="Moneda" name="MonedaID" type="select" width="30%" options={monedas.map(m => ({value: m.MonedaID, label: m.Descripcion}))} value={formData.MonedaID} onChange={handleChange} />
              <InputGroup label="Cuenta Contrapartida" name="CuentaIDContrapartida" type="select" width="40%" options={catalogo.map(c => ({value: c.CuentaID, label: `${c.CuentaID} - ${c.Descripcion}`}))} value={formData.CuentaIDContrapartida} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <InputGroup label="Secuencia Comprobante" name="SecComprobante" type="select" width="30%" options={secuencias.map(s => ({value: s.SecID, label: `${s.SecID} - ${s.Descripcion}`}))} value={formData.SecComprobante} onChange={handleChange} />
              <InputGroup label="Monto Dependiente" name="MontoDependiente" type="number" width="30%" value={formData.MontoDependiente} onChange={handleChange} />
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}><input type="checkbox" name="PagarSalario" checked={formData.PagarSalario} onChange={handleChange} /> Pagar Salario</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}><input type="checkbox" name="PagarHoras" checked={formData.PagarHoras} onChange={handleChange} /> Pagar Horas</label>
              </div>
            </div>
          </div>

          {/* TAB 2: REGLAS Y CÁLCULOS */}
          <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              
              <div>
                <h5 style={{ margin: '0 0 10px 0', color: '#334155' }}>Deducciones de Ley</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <InputGroup label="Calcular AFP" name="CalcularAFP" type="checkbox" width="100px" value={formData.CalcularAFP} onChange={handleChange} />
                  <InputGroup label="Período AFP" name="PeriodoAFP" type="select" options={periodoOptions} disabled={!formData.CalcularAFP} value={formData.PeriodoAFP} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <InputGroup label="Calcular ARS" name="CalcularARS" type="checkbox" width="100px" value={formData.CalcularARS} onChange={handleChange} />
                  <InputGroup label="Período ARS" name="PeriodoARS" type="select" options={periodoOptions} disabled={!formData.CalcularARS} value={formData.PeriodoARS} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <InputGroup label="Calcular ISR" name="CalcularISR" type="checkbox" width="100px" value={formData.CalcularISR} onChange={handleChange} />
                  <InputGroup label="Período ISR" name="PeriodoISR" type="select" options={periodoOptions} disabled={!formData.CalcularISR} value={formData.PeriodoISR} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <InputGroup label="Dependientes" name="CalcularDependientes" type="checkbox" width="100px" value={formData.CalcularDependientes} onChange={handleChange} />
                  <InputGroup label="Período Dep." name="PeriodoDependiente" type="select" options={periodoOptions} disabled={!formData.CalcularDependientes} value={formData.PeriodoDependiente} onChange={handleChange} />
                </div>
              </div>

              <div>
                <h5 style={{ margin: '0 0 10px 0', color: '#334155' }}>Horas y Promedios</h5>
                <InputGroup label="Base Hora Promedio" name="CalcBaseHoraProm" type="select" options={[{value:1, label:'Promedio Días'}, {value:2, label:'Promedio Horas'}]} value={formData.CalcBaseHoraProm} onChange={handleChange} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <InputGroup label="Días/Mes" name="PromedioDiasMes" type="number" value={formData.PromedioDiasMes} onChange={handleChange} />
                  <InputGroup label="Horas/Mes" name="PromedioHorasMes" type="number" value={formData.PromedioHorasMes} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <InputGroup label="Horas/Día" name="HorasenDia" type="number" value={formData.HorasenDia} onChange={handleChange} />
                  <InputGroup label="Mínimo Horas" name="MinimoHoras" type="number" value={formData.MinimoHoras} onChange={handleChange} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', marginTop: '10px' }}><input type="checkbox" name="MinimoHorasObligatorio" checked={formData.MinimoHorasObligatorio} onChange={handleChange} /> Mínimo Horas Obligatorio</label>
              </div>

            </div>
          </div>

          {/* TAB 3: PRESUPUESTO */}
          <div style={{ display: activeTab === 2 ? 'block' : 'none' }}>
            <InputGroup label="Cuenta Presupuesto" name="CtaPresupuesto" type="select" options={catalogo.map(c => ({value: c.CuentaID, label: `${c.CuentaID} - ${c.Descripcion}`}))} value={formData.CtaPresupuesto} onChange={handleChange} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <InputGroup label="Secuencia SG" name="SecuenciaSG" value={formData.SecuenciaSG} onChange={handleChange} />
              <InputGroup label="Capítulo" name="Capitulo" value={formData.Capitulo} onChange={handleChange} />
              <InputGroup label="Sub Capítulo" name="SubCapitulo" value={formData.SubCapitulo} onChange={handleChange} />
              <InputGroup label="DAD" name="DAD" value={formData.DAD} onChange={handleChange} />
              <InputGroup label="UE" name="UE" value={formData.UE} onChange={handleChange} />
              <InputGroup label="Programa" name="Programa" value={formData.Programa} onChange={handleChange} />
              <InputGroup label="Sub Programa" name="SubPrograma" value={formData.SubPrograma} onChange={handleChange} />
              <InputGroup label="Proyecto" name="Proyecto" value={formData.Proyecto} onChange={handleChange} />
              <InputGroup label="Región" name="Region" value={formData.Region} onChange={handleChange} />
              <InputGroup label="Provincia" name="Provincia" value={formData.Provincia} onChange={handleChange} />
              <InputGroup label="Municipio" name="Municipio" value={formData.Municipio} onChange={handleChange} />
              <InputGroup label="Función" name="Funcion" value={formData.Funcion} onChange={handleChange} />
            </div>
            <InputGroup label="Concepto" name="Concepto" value={formData.Concepto} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TiposNominas;
