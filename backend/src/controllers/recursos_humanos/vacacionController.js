const { sql, connectDB } = require('../../config/db');

exports.getVacaciones = async (req, res) => {
    try {
        const { empresaId } = req.query;
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        const result = await pool.request()
            .input('empresaId', sql.VarChar, empresaId)
            .query(`
                SELECT 
                    a.*,
                    e.Nombres + ' ' + e.Apellido1 + ' ' + ISNULL(e.Apellido2, '') as EmpleadoNombre,
                    e.Cedula as EmpleadoCedula,
                    ta.Descripcion as TipoAccionDesc,
                    c.Descripcion as CargoDesc,
                    d.Descripcion as DependenciaDesc
                FROM RHVACACION a
                LEFT JOIN NMEMPLEADOS e ON a.EmpleadoID = e.EmpleadoID AND a.EmpresaID = e.EmpresaId
                LEFT JOIN RHTIPOACCIONES ta ON a.TipoAccionID = ta.TipoAccionID AND a.EmpresaID = ta.EmpresaID
                LEFT JOIN NMCARGOS c ON e.CargoId = c.CargoID AND e.EmpresaId = c.EmpresaId
                LEFT JOIN NMDEPENDENCIAS d ON e.DependenciaID = d.DependenciaID AND e.EmpresaId = d.EmpresaId
                WHERE a.EmpresaID = @empresaId
                ORDER BY a.VacacionID DESC
            `);
            
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createVacacion = async (req, res) => {
    try {
        const { empresaId } = req.query;
        const { EmpleadoID, TipoAccionID, FechaInicio, FechaFin, Observacion, CreadoPor } = req.body;
        
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        
        // Generar ID
        const maxIdResult = await pool.request()
            .input('empresaId', sql.VarChar, empresaId)
            .query(`SELECT ISNULL(MAX(VacacionID), 0) + 1 AS NextID FROM RHVACACION WHERE EmpresaID = @empresaId`);
        const nextId = maxIdResult.recordset[0].NextID;

        await pool.request()
            .input('id', sql.Int, nextId)
            .input('empresaId', sql.VarChar, empresaId)
            .input('empleadoId', sql.VarChar, EmpleadoID)
            .input('tipoAccionId', sql.Int, TipoAccionID || null)
            .input('fechaInicio', sql.DateTime, FechaInicio ? new Date(FechaInicio) : null)
            .input('fechaFin', sql.DateTime, FechaFin ? new Date(FechaFin) : null)
            .input('observacion', sql.VarChar, Observacion || '')
            .input('creadoPor', sql.VarChar, CreadoPor || '1')
            .query(`
                INSERT INTO RHVACACION (
                    VacacionID, EmpresaID, EmpleadoID, TipoAccionID, FechaInicio, FechaFin, Observacion,
                    Procesado, FechaRegistro, Aprobado, FechaCreado, CreadoPor, ModificadoPor, FechaModificado, Anulado
                ) VALUES (
                    @id, @empresaId, @empleadoId, @tipoAccionId, @fechaInicio, @fechaFin, @observacion,
                    0, GETDATE(), 0, GETDATE(), @creadoPor, @creadoPor, GETDATE(), 0
                )
            `);

        res.status(201).json({ message: 'Vacación creada exitosamente', id: nextId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateVacacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;
        const { EmpleadoID, TipoAccionID, FechaInicio, FechaFin, Observacion, ModificadoPor } = req.body;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .input('empleadoId', sql.VarChar, EmpleadoID)
            .input('tipoAccionId', sql.Int, TipoAccionID || null)
            .input('fechaInicio', sql.DateTime, FechaInicio ? new Date(FechaInicio) : null)
            .input('fechaFin', sql.DateTime, FechaFin ? new Date(FechaFin) : null)
            .input('observacion', sql.VarChar, Observacion || '')
            .input('modificadoPor', sql.VarChar, ModificadoPor || '1')
            .query(`
                UPDATE RHVACACION
                SET EmpleadoID = @empleadoId,
                    TipoAccionID = @tipoAccionId,
                    FechaInicio = @fechaInicio,
                    FechaFin = @fechaFin,
                    Observacion = @observacion,
                    ModificadoPor = @modificadoPor,
                    FechaModificado = GETDATE()
                WHERE VacacionID = @id AND EmpresaID = @empresaId
            `);

        res.json({ message: 'Vacación actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteVacacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query(`DELETE FROM RHVACACION WHERE VacacionID = @id AND EmpresaID = @empresaId AND ISNULL(Procesado, 0) = 0`);

        res.json({ message: 'Vacación eliminada exitosamente' });
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
            query = 'UPDATE RHVACACION SET Aprobado = 1, FechaAprobado = GETDATE() WHERE VacacionID = @id AND EmpresaID = @empresaId';
        } else if (action === 'desaprobar') {
            query = 'UPDATE RHVACACION SET Aprobado = 0, FechaAprobado = NULL WHERE VacacionID = @id AND EmpresaID = @empresaId';
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

        const pool = await connectDB();
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .input('fechaSalida', sql.DateTime, fechaSalida)
            .input('numeroNombramiento', sql.VarChar, numeroNombramiento || '')
            .query(`
                UPDATE RHVACACION 
                SET Procesado = 1, FechaNombramiento = @fechaSalida, NumeroNombramiento = @numeroNombramiento
                WHERE VacacionID = @id AND EmpresaID = @empresaId
            `);

        res.json({ message: 'Vacación procesada correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
