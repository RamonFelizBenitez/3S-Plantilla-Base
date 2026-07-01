const { connectDB, sql } = require('../../config/db');

exports.getNominasCerradas = async (req, res) => {
  try {
    const { empresaId } = req.query;
    if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

    const pool = await connectDB();
    const result = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .query(`
        SELECT * FROM NMNOMINA 
        WHERE EmpresaID = @EmpresaID AND Posteado = 1
        ORDER BY CodigoPeriodo DESC, NominaNumero DESC
      `);
      
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.generarArchivoBanco = async (req, res) => {
  try {
    const { empresaId, tipoNominaId, codigoPeriodo, nominaNumero, secuencia, delimitador = ',' } = req.body;

    if (!empresaId || !tipoNominaId || !codigoPeriodo || !nominaNumero || !secuencia) {
      return res.status(400).json({ message: 'Faltan parámetros clave para identificar la nómina.' });
    }

    const pool = await connectDB();
    
    // 1. Validar parámetros de empresa (CuentaOrigen)
    const paramResult = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .query('SELECT CuentaBanco FROM NMPARAMETROS WHERE EmpresaId = @EmpresaID');
      
    if (paramResult.recordset.length === 0 || !paramResult.recordset[0].CuentaBanco) {
      return res.status(400).json({ message: 'La empresa no tiene configurada su Cuenta de Banco en Parámetros.' });
    }
    const cuentaEmpresa = paramResult.recordset[0].CuentaBanco;

    // 2. Obtener tipo de pago para el label
    const nominaResult = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .input('TipoNominaID', sql.VarChar, tipoNominaId)
      .input('CodigoPeriodo', sql.Int, parseInt(codigoPeriodo))
      .input('NominaNumero', sql.Int, parseInt(nominaNumero))
      .input('Secuencia', sql.Int, parseInt(secuencia))
      .query(`SELECT TipoPago FROM NMNOMINA WHERE EmpresaId = @EmpresaID AND TipoNominaId = @TipoNominaID AND CodigoPeriodo = @CodigoPeriodo AND NominaNumero = @NominaNumero AND Secuencia = @Secuencia`);
    
    if (nominaResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Nómina no encontrada.' });
    }
    const tipoPago = nominaResult.recordset[0].TipoPago;
    let label = 'NOMINA';
    if (tipoPago === 2) { // Quincenal
      label = secuencia === 1 ? 'NOMINA PRIMERA QUINCENA' : 'NOMINA SEGUNDA QUINCENA';
    } else if (tipoPago === 3) { // Mensual
      label = 'NOMINA MES';
    }

    // 3. Obtener sueldos netos y validar cuentas
    // Tipo = 1 es Ingreso, Tipo = 2 es Descuento
    const empleadosResult = await pool.request()
      .input('EmpresaID', sql.VarChar, empresaId)
      .input('TipoNominaID', sql.VarChar, tipoNominaId)
      .input('CodigoPeriodo', sql.Int, parseInt(codigoPeriodo))
      .input('NominaNumero', sql.Int, parseInt(nominaNumero))
      .input('Secuencia', sql.Int, parseInt(secuencia))
      .query(`
        SELECT 
          L.EmpleadoID, 
          E.Nombres, 
          E.Apellido1,
          E.FormaPago,
          E.CuentaBanco,
          SUM(CASE WHEN T.Tipo = 1 THEN L.Monto * -1 WHEN T.Tipo = 0 THEN L.Monto ELSE 0 END) AS SueldoNeto
        FROM NMNOMINALINEAS L
        INNER JOIN NMTIPOSTRANSACCIONES T ON L.TipoTransId = T.TipoTransId AND L.EmpresaId = T.EmpresaId
        INNER JOIN NMEMPLEADOS E ON L.EmpleadoID = E.EmpleadoID AND L.EmpresaId = E.EmpresaId
        WHERE L.EmpresaId = @EmpresaID
          AND L.TipoNominaId = @TipoNominaID
          AND L.CodigoPeriodo = @CodigoPeriodo
          AND L.NominaNumero = @NominaNumero
          AND L.Secuencia = @Secuencia
        GROUP BY L.EmpleadoID, E.Nombres, E.Apellido1, E.FormaPago, E.CuentaBanco
        HAVING SUM(CASE WHEN T.Tipo = 1 THEN L.Monto * -1 WHEN T.Tipo = 0 THEN L.Monto ELSE 0 END) > 0
      `);

    const empleados = empleadosResult.recordset;

    if (empleados.length === 0) {
      return res.status(400).json({ message: 'La nómina no tiene líneas de pago o los montos netos son cero.' });
    }

    // Validación de Cuenta Banco para FormaPago == 1 (Transferencia)
    const sinCuenta = empleados.filter(e => e.FormaPago === 1 && (!e.CuentaBanco || e.CuentaBanco.trim() === ''));
    if (sinCuenta.length > 0) {
      const nombresError = sinCuenta.map(e => `${e.EmpleadoID} - ${e.Nombres} ${e.Apellido1}`).join(', ');
      return res.status(400).json({ 
        message: 'No se puede generar el archivo porque los siguientes empleados tienen pago por transferencia pero NO tienen cuenta registrada: ' + nombresError 
      });
    }

    // 4. Construir contenido TXT
    // Estructura: CC,DOP,{CuentaEmpresa},CA,DOP,{CuentaEmpleado},{MontoNeto},{Label}
    let txtContent = '';
    
    empleados.forEach(e => {
      // Ignorar los que no sean pago por transferencia (opcional), pero si están aquí los procesamos
      if (e.FormaPago !== 1) return; // asumiendo que el archivo de banco es solo para los de transferencia
      
      const cuentaEmpleado = e.CuentaBanco ? e.CuentaBanco.trim() : '';
      const montoNeto = parseFloat(e.SueldoNeto).toFixed(2);
      
      const linea = `CC${delimitador}DOP${delimitador}${cuentaEmpresa}${delimitador}CA${delimitador}DOP${delimitador}${cuentaEmpleado}${delimitador}${montoNeto}${delimitador}${label}`;
      txtContent += linea + '\r\n';
    });

    if (txtContent === '') {
      return res.status(400).json({ message: 'No hay empleados con forma de pago por transferencia (1) en esta nómina para generar el archivo.' });
    }

    res.json({ content: txtContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
