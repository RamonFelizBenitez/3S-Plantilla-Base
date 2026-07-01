const { sql, connectDB } = require('../../config/db');

exports.getAmonestaciones = async (req, res) => {
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
                    d.Descripcion as DependenciaDesc,
                    clasif.Descripcion as ClasificacionDesc
                FROM RHAMONESTACION a
                LEFT JOIN NMEMPLEADOS e ON a.EmpleadoID = e.EmpleadoID AND a.EmpresaID = e.EmpresaId
                LEFT JOIN RHTIPOACCIONES ta ON a.TipoAccionID = ta.TipoAccionID AND a.EmpresaID = ta.EmpresaID
                LEFT JOIN NMCARGOS c ON e.CargoId = c.CargoID AND e.EmpresaId = c.EmpresaId
                LEFT JOIN NMDEPENDENCIAS d ON e.DependenciaID = d.DependenciaID AND e.EmpresaId = d.EmpresaId
                LEFT JOIN RHCLASIFICACION clasif ON a.ClasificacionID = clasif.ClasificacionID AND a.EmpresaID = clasif.EmpresaID
                WHERE a.EmpresaID = @empresaId
                ORDER BY a.AmonestacionID DESC
            `);
            
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAmonestacion = async (req, res) => {
    try {
        const { empresaId } = req.query;
        const { EmpleadoID, TipoAccionID, Fecha, Documento, Observacion, Grado, ClasificacionID, CreadoPor } = req.body;
        
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        
        // Generar ID
        const maxIdResult = await pool.request()
            .input('empresaId', sql.VarChar, empresaId)
            .query(`SELECT ISNULL(MAX(AmonestacionID), 0) + 1 AS NextID FROM RHAMONESTACION WHERE EmpresaID = @empresaId`);
        const nextId = maxIdResult.recordset[0].NextID;

        await pool.request()
            .input('id', sql.Int, nextId)
            .input('empresaId', sql.VarChar, empresaId)
            .input('empleadoId', sql.VarChar, EmpleadoID)
            .input('tipoAccionId', sql.Int, TipoAccionID)
            .input('fecha', sql.DateTime, Fecha ? new Date(Fecha) : null)
            .input('documento', sql.VarChar, Documento || '')
            .input('observacion', sql.VarChar, Observacion || '')
            .input('grado', sql.VarChar, Grado || '')
            .input('clasificacionId', sql.Int, ClasificacionID)
            .input('creadoPor', sql.VarChar, CreadoPor || '1')
            .query(`
                INSERT INTO RHAMONESTACION (
                    AmonestacionID, EmpresaID, EmpleadoID, TipoAccionID, Fecha, Documento, Observacion, Grado, ClasificacionID,
                    Procesado, FechaRegistro, Aprobado, FechaCreado, CreadoPor, ModificadoPor, FechaModificado, Anulado
                ) VALUES (
                    @id, @empresaId, @empleadoId, @tipoAccionId, @fecha, @documento, @observacion, @grado, @clasificacionId,
                    0, GETDATE(), 0, GETDATE(), @creadoPor, @creadoPor, GETDATE(), 0
                )
            `);

        res.status(201).json({ message: 'Amonestación creada exitosamente', id: nextId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateAmonestacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;
        const { EmpleadoID, TipoAccionID, Fecha, Documento, Observacion, Grado, ClasificacionID, ModificadoPor } = req.body;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .input('empleadoId', sql.VarChar, EmpleadoID)
            .input('tipoAccionId', sql.Int, TipoAccionID)
            .input('fecha', sql.DateTime, Fecha ? new Date(Fecha) : null)
            .input('documento', sql.VarChar, Documento || '')
            .input('observacion', sql.VarChar, Observacion || '')
            .input('grado', sql.VarChar, Grado || '')
            .input('clasificacionId', sql.Int, ClasificacionID)
            .input('modificadoPor', sql.VarChar, ModificadoPor || '1')
            .query(`
                UPDATE RHAMONESTACION
                SET EmpleadoID = @empleadoId,
                    TipoAccionID = @tipoAccionId,
                    Fecha = @fecha,
                    Documento = @documento,
                    Observacion = @observacion,
                    Grado = @grado,
                    ClasificacionID = @clasificacionId,
                    ModificadoPor = @modificadoPor,
                    FechaModificado = GETDATE()
                WHERE AmonestacionID = @id AND EmpresaID = @empresaId
            `);

        res.json({ message: 'Amonestación actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAmonestacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query(`DELETE FROM RHAMONESTACION WHERE AmonestacionID = @id AND EmpresaID = @empresaId AND Procesado = 0`);

        res.json({ message: 'Amonestación eliminada exitosamente' });
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
            query = 'UPDATE RHAMONESTACION SET Aprobado = 1 WHERE AmonestacionID = @id AND EmpresaID = @empresaId';
        } else if (action === 'desaprobar') {
            query = 'UPDATE RHAMONESTACION SET Aprobado = 0 WHERE AmonestacionID = @id AND EmpresaID = @empresaId';
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
                UPDATE RHAMONESTACION 
                SET Procesado = 1, FechaNombramiento = @fechaSalida, NumeroNombramiento = @numeroNombramiento
                WHERE AmonestacionID = @id AND EmpresaID = @empresaId
            `);

        res.json({ message: 'Amonestación procesada correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
