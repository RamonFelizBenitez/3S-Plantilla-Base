const { sql, connectDB } = require('../../config/db');

// Get all dependents for a specific employee
const getByEmpleado = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { empresaId } = req.query;
    if (!empleadoId || !empresaId) {
      return res.status(400).json({ message: 'EmpleadoID y EmpresaID son requeridos' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('empleadoId', sql.VarChar, empleadoId)
      .input('empresaId', sql.VarChar, empresaId)
      .query(`
        SELECT d.*, t.Descripcion as TransaccionDescripcion
        FROM NMDependiente d
        LEFT JOIN NMTIPOSTRANSACCIONES t ON d.TransaccionID = t.TipoTransId AND d.EmpresaID = t.EmpresaId
        WHERE d.EmpleadoID = @empleadoId AND d.EmpresaID = @empresaId
        ORDER BY d.DependienteID ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en getByEmpleado:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create a new dependent
const create = async (req, res) => {
  try {
    const { 
      EmpresaID, EmpleadoID, NombreDependiente, Cobrar, TransaccionID, CreadoPor 
    } = req.body;

    if (!EmpresaID || !EmpleadoID || !TransaccionID) {
      return res.status(400).json({ message: 'EmpresaID, EmpleadoID y TransaccionID son requeridos' });
    }
    
    const pool = await connectDB();

    // 1. Calculate the next DependienteID for this Empresa/Empleado
    const idResult = await pool.request()
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('EmpleadoID', sql.VarChar, EmpleadoID)
      .query(`
        SELECT COALESCE(MAX(DependienteID), 0) + 1 as NextID 
        FROM NMDependiente 
        WHERE EmpresaID = @EmpresaID AND EmpleadoID = @EmpleadoID
      `);
    
    const nextId = idResult.recordset[0].NextID;

    // 2. Insert the record
    await pool.request()
      .input('DependienteID', sql.Int, nextId)
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('EmpleadoID', sql.VarChar, EmpleadoID)
      .input('NombreDependiente', sql.VarChar, NombreDependiente || '')
      .input('Cobrar', sql.Bit, Cobrar ? 1 : 0)
      .input('TransaccionID', sql.VarChar, TransaccionID)
      .input('CreadoPor', sql.VarChar, CreadoPor || 'SYSTEM')
      .query(`
        INSERT INTO NMDependiente (
          DependienteID, EmpresaID, EmpleadoID, NombreDependiente, Cobrar, TransaccionID, 
          CreadoPor, ModificadoPor, FechaCreado, FechaModificado
        ) VALUES (
          @DependienteID, @EmpresaID, @EmpleadoID, @NombreDependiente, @Cobrar, @TransaccionID, 
          @CreadoPor, @CreadoPor, GETDATE(), GETDATE()
        )
      `);
      
    res.status(201).json({ message: 'Dependiente del empleado agregado exitosamente' });
  } catch (err) {
    console.error('Error en create dependiente:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update an existing dependent
const update = async (req, res) => {
  try {
    const { dependienteId } = req.params;
    const { 
      EmpresaID, EmpleadoID, NombreDependiente, Cobrar, TransaccionID, ModificadoPor 
    } = req.body;

    if (!EmpresaID || !EmpleadoID || !TransaccionID) {
      return res.status(400).json({ message: 'EmpresaID, EmpleadoID y TransaccionID son requeridos' });
    }
    
    const pool = await connectDB();

    await pool.request()
      .input('DependienteID', sql.Int, parseInt(dependienteId))
      .input('EmpresaID', sql.VarChar, EmpresaID)
      .input('EmpleadoID', sql.VarChar, EmpleadoID)
      .input('NombreDependiente', sql.VarChar, NombreDependiente || '')
      .input('Cobrar', sql.Bit, Cobrar ? 1 : 0)
      .input('TransaccionID', sql.VarChar, TransaccionID)
      .input('ModificadoPor', sql.VarChar, ModificadoPor || 'SYSTEM')
      .query(`
        UPDATE NMDependiente SET 
          NombreDependiente = @NombreDependiente,
          Cobrar = @Cobrar,
          TransaccionID = @TransaccionID,
          ModificadoPor = @ModificadoPor,
          FechaModificado = GETDATE()
        WHERE DependienteID = @DependienteID AND EmpresaID = @EmpresaID AND EmpleadoID = @EmpleadoID
      `);
      
    res.json({ message: 'Dependiente del empleado actualizado exitosamente' });
  } catch (err) {
    console.error('Error en update dependiente:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a dependent
const remove = async (req, res) => {
  try {
    const { dependienteId } = req.params;
    const { empresaId, empleadoId } = req.query;

    if (!empresaId || !empleadoId) {
      return res.status(400).json({ message: 'EmpresaID y EmpleadoID son requeridos' });
    }

    const pool = await connectDB();

    await pool.request()
      .input('DependienteID', sql.Int, parseInt(dependienteId))
      .input('EmpresaID', sql.VarChar, empresaId)
      .input('EmpleadoID', sql.VarChar, empleadoId)
      .query(`
        DELETE FROM NMDependiente 
        WHERE DependienteID = @DependienteID AND EmpresaID = @EmpresaID AND EmpleadoID = @EmpleadoID
      `);
      
    res.json({ message: 'Dependiente del empleado eliminado exitosamente' });
  } catch (err) {
    console.error('Error en delete dependiente:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get list of dependents from RHSolicitud -> RHDependienteSolicitante for an employee
const getSolicitanteDependientes = async (req, res) => {
  try {
    const { empleadoId } = req.params;
    const { empresaId } = req.query;
    if (!empleadoId || !empresaId) {
      return res.status(400).json({ message: 'EmpleadoID y EmpresaID son requeridos' });
    }

    const pool = await connectDB();
    const result = await pool.request()
      .input('empleadoId', sql.VarChar, empleadoId)
      .input('empresaId', sql.VarChar, empresaId)
      .query(`
        SELECT d.DependienteSolicitanteID, d.NombreDependiente, d.Cedula
        FROM RHDependienteSolicitante d
        JOIN RHSolicitud s ON d.SolicitudID = s.SolicitudID AND d.EmpresaID = CAST(s.EmpresaID AS INT)
        WHERE s.Empleadoid = @empleadoId AND s.EmpresaID = @empresaId
        ORDER BY d.NombreDependiente ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en getSolicitanteDependientes:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getByEmpleado,
  create,
  update,
  remove,
  getSolicitanteDependientes
};
