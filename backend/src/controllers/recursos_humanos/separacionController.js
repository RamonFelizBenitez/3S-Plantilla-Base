const { sql, connectDB } = require('../../config/db');

exports.getSeparaciones = async (req, res) => {
    try {
        const { empresaId } = req.query;
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        const result = await pool.request()
            .input('empresaId', sql.VarChar, empresaId)
            .query(`
                SELECT 
                    s.*,
                    e.Nombres + ' ' + e.Apellido1 + ' ' + ISNULL(e.Apellido2, '') as EmpleadoNombre,
                    e.Cedula as EmpleadoCedula,
                    ta.Descripcion as TipoAccionDesc,
                    c.Descripcion as CargoDesc,
                    d.Descripcion as DependenciaDesc
                FROM RHSEPARACIONSERVICIO s
                LEFT JOIN NMEMPLEADOS e ON s.EmpleadoID = e.EmpleadoID AND s.EmpresaID = e.EmpresaId
                LEFT JOIN RHTIPOACCIONES ta ON s.TipoAccionID = ta.TipoAccionID AND s.EmpresaID = ta.EmpresaID
                LEFT JOIN NMCARGOS c ON e.CargoId = c.CargoID AND e.EmpresaId = c.EmpresaId
                LEFT JOIN NMDEPENDENCIAS d ON e.DependenciaID = d.DependenciaID AND e.EmpresaId = d.EmpresaId
                WHERE s.EmpresaID = @empresaId
                ORDER BY s.SeparacionID DESC
            `);
            
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createSeparacion = async (req, res) => {
    try {
        const { empresaId } = req.query;
        const { EmpleadoID, TipoAccionID, Observacion, FechaSalida, CreadoPor } = req.body;
        
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        
        // Generar ID
        const maxIdResult = await pool.request()
            .input('empresaId', sql.VarChar, empresaId)
            .query(`SELECT ISNULL(MAX(SeparacionID), 0) + 1 AS NextID FROM RHSEPARACIONSERVICIO WHERE EmpresaID = @empresaId`);
        const nextId = maxIdResult.recordset[0].NextID;

        await pool.request()
            .input('id', sql.Int, nextId)
            .input('empresaId', sql.VarChar, empresaId)
            .input('empleadoId', sql.VarChar, EmpleadoID)
            .input('tipoAccionId', sql.Int, TipoAccionID)
            .input('observacion', sql.VarChar, Observacion || '')
            .input('fechaSalida', sql.DateTime, FechaSalida ? new Date(FechaSalida) : null)
            .input('creadoPor', sql.VarChar, CreadoPor || '1')
            .query(`
                INSERT INTO RHSEPARACIONSERVICIO (
                    SeparacionID, EmpresaID, EmpleadoID, TipoAccionID, Observacion, 
                    Procesado, FechaRegistro, Aprobado, FechaSalida, FechaCreado, 
                    CreadoPor, ModificadoPor, FechaModificado
                ) VALUES (
                    @id, @empresaId, @empleadoId, @tipoAccionId, @observacion,
                    0, GETDATE(), 0, @fechaSalida, GETDATE(),
                    @creadoPor, @creadoPor, GETDATE()
                )
            `);

        res.status(201).json({ message: 'SeparaciÃ³n creada exitosamente', id: nextId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateSeparacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;
        const { EmpleadoID, TipoAccionID, Observacion, FechaSalida, ModificadoPor } = req.body;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .input('empleadoId', sql.VarChar, EmpleadoID)
            .input('tipoAccionId', sql.Int, TipoAccionID)
            .input('observacion', sql.VarChar, Observacion || '')
            .input('fechaSalida', sql.DateTime, FechaSalida ? new Date(FechaSalida) : null)
            .input('modificadoPor', sql.VarChar, ModificadoPor || '1')
            .query(`
                UPDATE RHSEPARACIONSERVICIO
                SET EmpleadoID = @empleadoId,
                    TipoAccionID = @tipoAccionId,
                    Observacion = @observacion,
                    FechaSalida = @fechaSalida,
                    ModificadoPor = @modificadoPor,
                    FechaModificado = GETDATE()
                WHERE SeparacionID = @id AND EmpresaID = @empresaId
            `);

        res.json({ message: 'SeparaciÃ³n actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSeparacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query(`DELETE FROM RHSEPARACIONSERVICIO WHERE SeparacionID = @id AND EmpresaID = @empresaId AND Procesado = 0`);

        res.json({ message: 'SeparaciÃ³n eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;
        const { action } = req.body;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();

        let query = '';
        if (action === 'aprobar') {
            query = 'UPDATE RHSEPARACIONSERVICIO SET Aprobado = 1, FechaAprobado = GETDATE() WHERE SeparacionID = @id AND EmpresaID = @empresaId';
        } else if (action === 'desaprobar') {
            query = 'UPDATE RHSEPARACIONSERVICIO SET Aprobado = 0, FechaAprobado = NULL WHERE SeparacionID = @id AND EmpresaID = @empresaId';
        } else {
            return res.status(400).json({ message: 'Acción no válida' });
        }

        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query(query);

        res.json({ message: 'Estado actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.tomaPosesion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;
        const { fechaSalida, numeroNombramiento } = req.body;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });
        if (!fechaSalida || !numeroNombramiento) return res.status(400).json({ message: 'Faltan datos de confirmación' });

        const pool = await connectDB();
        
        // 1. Get EmpleadoID from separation
        const sepResult = await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query('SELECT EmpleadoID FROM RHSEPARACIONSERVICIO WHERE SeparacionID = @id AND EmpresaID = @empresaId');
            
        if (sepResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Separación no encontrada' });
        }
        const empleadoId = sepResult.recordset[0].EmpleadoID;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Operación 2: Actualizar RHSEPARACIONSERVICIO
            await transaction.request()
                .input('id', sql.Int, id)
                .input('empresaId', sql.VarChar, empresaId)
                .input('fechaSalida', sql.DateTime, fechaSalida)
                .input('numeroNombramiento', sql.VarChar, numeroNombramiento)
                .query(`
                    UPDATE RHSEPARACIONSERVICIO 
                    SET Procesado = 1, FechaNombramiento = @fechaSalida, NumeroNombramiento = @numeroNombramiento
                    WHERE SeparacionID = @id AND EmpresaID = @empresaId
                `);

            // Operación 3: Actualizar RHpercep
            await transaction.request()
                .input('empleadoId', sql.VarChar, empleadoId)
                .input('empresaId', sql.Int, parseInt(empresaId))
                .input('fechaSalida', sql.DateTime, fechaSalida)
                .query(`
                    UPDATE RHpercep 
                    SET SueldoActivo = 0, FechaFin = @fechaSalida 
                    WHERE EmpleadoID = @empleadoId AND EmpresaID = @empresaId AND SueldoActivo = 1
                `);

            // Operación 4: Actualizar NMEMPLEADOS
            await transaction.request()
                .input('empleadoId', sql.VarChar, empleadoId)
                .input('empresaId', sql.Int, parseInt(empresaId))
                .input('fechaSalida', sql.DateTime, fechaSalida)
                .query(`
                    UPDATE NMEMPLEADOS 
                    SET FechaSalida = @fechaSalida, Nomina = 0, Estatus = 4 
                    WHERE EmpleadoID = @empleadoId AND EmpresaId = @empresaId
                `);

            await transaction.commit();
            res.json({ message: 'Separación procesada correctamente' });
        } catch (txErr) {
            await transaction.rollback();
            throw txErr;
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
