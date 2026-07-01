const { sql, connectDB } = require('../../config/db');

exports.getAusencias = async (req, res) => {
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
                FROM RHAUSENCIA a
                LEFT JOIN NMEMPLEADOS e ON a.EmpleadoID = e.EmpleadoID AND a.EmpresaID = e.EmpresaId
                LEFT JOIN RHTIPOACCIONES ta ON a.TipoAccionID = ta.TipoAccionID AND a.EmpresaID = ta.EmpresaID
                LEFT JOIN NMCARGOS c ON e.CargoId = c.CargoID AND e.EmpresaId = c.EmpresaId
                LEFT JOIN NMDEPENDENCIAS d ON e.DependenciaID = d.DependenciaID AND e.EmpresaId = d.EmpresaId
                WHERE a.EmpresaID = @empresaId
                ORDER BY a.AusenciaID DESC
            `);
            
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAusencia = async (req, res) => {
    try {
        const { empresaId } = req.query;
        const { EmpleadoID, TipoAccionID, FechaDesde, FechaHasta, CantidadHora, Observacion, CreadoPor } = req.body;
        
        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        
        const maxIdResult = await pool.request()
            .input('empresaId', sql.VarChar, empresaId)
            .query(`SELECT ISNULL(MAX(AusenciaID), 0) + 1 AS NextID FROM RHAUSENCIA WHERE EmpresaID = @empresaId`);
        const nextId = maxIdResult.recordset[0].NextID;

        await pool.request()
            .input('id', sql.Int, nextId)
            .input('empresaId', sql.VarChar, empresaId)
            .input('empleadoId', sql.VarChar, EmpleadoID)
            .input('tipoAccionId', sql.Int, TipoAccionID || null)
            .input('fechaDesde', sql.DateTime, FechaDesde ? new Date(FechaDesde) : null)
            .input('fechaHasta', sql.DateTime, FechaHasta ? new Date(FechaHasta) : null)
            .input('cantidadHora', sql.Int, CantidadHora || 0)
            .input('observacion', sql.VarChar, Observacion || '')
            .input('creadoPor', sql.VarChar, CreadoPor || '1')
            .query(`
                INSERT INTO RHAUSENCIA (
                    AusenciaID, EmpresaID, EmpleadoID, TipoAccionID, FechaDesde, FechaHasta, CantidadHora, Observacion,
                    Procesado, Aprobado, FechaCreado, CreadoPor, ModificadoPor, FechaModificado, Anulado
                ) VALUES (
                    @id, @empresaId, @empleadoId, @tipoAccionId, @fechaDesde, @fechaHasta, @cantidadHora, @observacion,
                    0, 0, GETDATE(), @creadoPor, @creadoPor, GETDATE(), 0
                )
            `);

        res.status(201).json({ message: 'Ausencia creada exitosamente', id: nextId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateAusencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;
        const { EmpleadoID, TipoAccionID, FechaDesde, FechaHasta, CantidadHora, Observacion, ModificadoPor } = req.body;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .input('empleadoId', sql.VarChar, EmpleadoID)
            .input('tipoAccionId', sql.Int, TipoAccionID || null)
            .input('fechaDesde', sql.DateTime, FechaDesde ? new Date(FechaDesde) : null)
            .input('fechaHasta', sql.DateTime, FechaHasta ? new Date(FechaHasta) : null)
            .input('cantidadHora', sql.Int, CantidadHora || 0)
            .input('observacion', sql.VarChar, Observacion || '')
            .input('modificadoPor', sql.VarChar, ModificadoPor || '1')
            .query(`
                UPDATE RHAUSENCIA
                SET EmpleadoID = @empleadoId,
                    TipoAccionID = @tipoAccionId,
                    FechaDesde = @fechaDesde,
                    FechaHasta = @fechaHasta,
                    CantidadHora = @cantidadHora,
                    Observacion = @observacion,
                    ModificadoPor = @modificadoPor,
                    FechaModificado = GETDATE()
                WHERE AusenciaID = @id AND EmpresaID = @empresaId AND Aprobado = 0
            `);

        res.json({ message: 'Ausencia actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteAusencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresaId } = req.query;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query(`DELETE FROM RHAUSENCIA WHERE AusenciaID = @id AND EmpresaID = @empresaId AND Aprobado = 0 AND Procesado = 0`);

        res.json({ message: 'Ausencia eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        const { empresaId } = req.query;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        let setClause = '';
        if (action === 'aprobar') {
            setClause = 'Aprobado = 1, FechaRegistro = GETDATE()';
        } else if (action === 'desaprobar') {
            setClause = 'Aprobado = 0, FechaRegistro = NULL';
        } else if (action === 'anular') {
            setClause = 'Anulado = 1';
        } else {
            return res.status(400).json({ message: 'Acción inválida' });
        }

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .query(`UPDATE RHAUSENCIA SET ${setClause} WHERE AusenciaID = @id AND EmpresaID = @empresaId`);

        res.json({ message: 'Estado actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.tomaPosesion = async (req, res) => {
    try {
        const { id } = req.params;
        const { numeroNombramiento } = req.body;
        const { empresaId } = req.query;

        if (!empresaId) return res.status(400).json({ message: 'empresaId es requerido' });

        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .input('empresaId', sql.VarChar, empresaId)
            .input('numeroNombramiento', sql.VarChar, numeroNombramiento || null)
            .query(`
                UPDATE RHAUSENCIA 
                SET Procesado = 1, NumeroNombramiento = @numeroNombramiento 
                WHERE AusenciaID = @id AND EmpresaID = @empresaId AND Aprobado = 1
            `);

        res.json({ message: 'Toma de posesión procesada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
