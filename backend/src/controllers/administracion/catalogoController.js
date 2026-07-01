const { sql, connectDB } = require('../../config/db');

// Obtener todas las cuentas del catálogo
exports.getCatalogo = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1; 
        
        const result = await pool.request()
            .input('empresaId', sql.Int, empresaId)
            .query(`
                SELECT * FROM MG_CATALOGO
                WHERE EmpresaID = @empresaId 
                ORDER BY CuentaID ASC
            `);
            
        res.json({ data: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear nueva cuenta
exports.createCatalogo = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;
        
        const { 
            CuentaID, Descripcion, Origen, TipoCuenta, MGConsolidacion, 
            MGCompensacion, MGApertura, MonedaID, DepartamentoId, 
            DepartamentoValidar, CentroCostoId, CentroCostoValidar, 
            PropositoId, PropositoValidar, TipoRelacFinanc, 
            Retencion, Bloqueada, GrupoID, SubGrupoID 
        } = req.body;

        await pool.request()
            .input('cuentaId', sql.VarChar, CuentaID)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, Descripcion || '')
            .input('origen', sql.Int, Origen || 0)
            .input('tipoCuenta', sql.Int, TipoCuenta || 0)
            .input('consolida', sql.VarChar, MGConsolidacion || '')
            .input('compensa', sql.VarChar, MGCompensacion || '')
            .input('apertura', sql.VarChar, MGApertura || '')
            .input('monedaId', sql.VarChar, MonedaID || '')
            .input('deptoId', sql.VarChar, DepartamentoId || '')
            .input('deptoVal', sql.Int, DepartamentoValidar ? 1 : 0)
            .input('ccId', sql.VarChar, CentroCostoId || '')
            .input('ccVal', sql.Int, CentroCostoValidar ? 1 : 0)
            .input('propId', sql.VarChar, PropositoId || '')
            .input('propVal', sql.Int, PropositoValidar ? 1 : 0)
            .input('relFinanc', sql.Int, TipoRelacFinanc || 0)
            .input('retencion', sql.Bit, Retencion ? 1 : 0)
            .input('bloqueada', sql.Bit, Bloqueada ? 1 : 0)
            .input('grupoId', sql.VarChar, GrupoID || '')
            .input('subGrupoId', sql.VarChar, SubGrupoID || '')
            .input('userId', sql.Int, userId)
            .query(`
                INSERT INTO MG_CATALOGO (
                    CuentaID, EmpresaID, Descripcion, Origen, TipoCuenta, MGConsolidacion,
                    MGCompensacion, MGApertura, MonedaID, DepartamentoId, DepartamentoValidar,
                    CentroCostoId, CentroCostoValidar, PropositoId, PropositoValidar, TipoRelacFinanc,
                    Retencion, Bloqueada, GrupoID, SubGrupoID, CreadoPor
                ) VALUES (
                    @cuentaId, @empresaId, @desc, @origen, @tipoCuenta, @consolida,
                    @compensa, @apertura, @monedaId, @deptoId, @deptoVal,
                    @ccId, @ccVal, @propId, @propVal, @relFinanc,
                    @retencion, @bloqueada, @grupoId, @subGrupoId, @userId
                )
            `);
            
        res.json({ message: 'Cuenta creada exitosamente' });
    } catch (err) {
        if (err.number === 2627) { // Unique constraint
            return res.status(400).json({ error: 'La cuenta ya existe' });
        }
        res.status(500).json({ error: err.message });
    }
};

// Actualizar cuenta
exports.updateCatalogo = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params; // CuentaID
        const empresaId = req.user?.empresaId || 1;
        const userId = req.user?.id || 1;
        
        const { 
            Descripcion, Origen, TipoCuenta, MGConsolidacion, 
            MGCompensacion, MGApertura, MonedaID, DepartamentoId, 
            DepartamentoValidar, CentroCostoId, CentroCostoValidar, 
            PropositoId, PropositoValidar, TipoRelacFinanc, 
            Retencion, Bloqueada, GrupoID, SubGrupoID 
        } = req.body;

        await pool.request()
            .input('cuentaId', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .input('desc', sql.VarChar, Descripcion || '')
            .input('origen', sql.Int, Origen || 0)
            .input('tipoCuenta', sql.Int, TipoCuenta || 0)
            .input('consolida', sql.VarChar, MGConsolidacion || '')
            .input('compensa', sql.VarChar, MGCompensacion || '')
            .input('apertura', sql.VarChar, MGApertura || '')
            .input('monedaId', sql.VarChar, MonedaID || '')
            .input('deptoId', sql.VarChar, DepartamentoId || '')
            .input('deptoVal', sql.Int, DepartamentoValidar ? 1 : 0)
            .input('ccId', sql.VarChar, CentroCostoId || '')
            .input('ccVal', sql.Int, CentroCostoValidar ? 1 : 0)
            .input('propId', sql.VarChar, PropositoId || '')
            .input('propVal', sql.Int, PropositoValidar ? 1 : 0)
            .input('relFinanc', sql.Int, TipoRelacFinanc || 0)
            .input('retencion', sql.Bit, Retencion ? 1 : 0)
            .input('bloqueada', sql.Bit, Bloqueada ? 1 : 0)
            .input('grupoId', sql.VarChar, GrupoID || '')
            .input('subGrupoId', sql.VarChar, SubGrupoID || '')
            .input('userId', sql.Int, userId)
            .query(`
                UPDATE MG_CATALOGO SET 
                    Descripcion = @desc,
                    Origen = @origen,
                    TipoCuenta = @tipoCuenta,
                    MGConsolidacion = @consolida,
                    MGCompensacion = @compensa,
                    MGApertura = @apertura,
                    MonedaID = @monedaId,
                    DepartamentoId = @deptoId,
                    DepartamentoValidar = @deptoVal,
                    CentroCostoId = @ccId,
                    CentroCostoValidar = @ccVal,
                    PropositoId = @propId,
                    PropositoValidar = @propVal,
                    TipoRelacFinanc = @relFinanc,
                    Retencion = @retencion,
                    Bloqueada = @bloqueada,
                    GrupoID = @grupoId,
                    SubGrupoID = @subGrupoId,
                    ModificadoPor = @userId,
                    FechaModificado = GETDATE()
                WHERE CuentaID = @cuentaId AND EmpresaID = @empresaId
            `);
            
        res.json({ message: 'Cuenta actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar cuenta
exports.deleteCatalogo = async (req, res) => {
    try {
        const pool = await connectDB();
        const { id } = req.params;
        const empresaId = req.user?.empresaId || 1;
        
        await pool.request()
            .input('cuentaId', sql.VarChar, id)
            .input('empresaId', sql.Int, empresaId)
            .query(`DELETE FROM MG_CATALOGO WHERE CuentaID = @cuentaId AND EmpresaID = @empresaId`);
            
        res.json({ message: 'Cuenta eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============================================
// ENDPOINTS AUXILIARES PARA DEPENDENCIAS
// (Listados simples para los Dropdowns)
// ============================================

exports.getMonedas = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1;
        const result = await pool.request().input('empresaId', sql.Int, empresaId)
            .query(`SELECT MonedaID, Descripcion FROM Monedas WHERE EmpresaID = @empresaId`);
        res.json({ data: result.recordset });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDepartamentos = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1;
        const result = await pool.request().input('empresaId', sql.Int, empresaId)
            .query(`SELECT DepartamentoID, DepartDescripcion FROM MGDepartamentos WHERE EmpresaID = @empresaId`);
        res.json({ data: result.recordset });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCentroCostos = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1;
        const result = await pool.request().input('empresaId', sql.Int, empresaId)
            .query(`SELECT CentroCostoID, CCostosDescripcion FROM MGCentroCostos WHERE EmpresaID = @empresaId`);
        res.json({ data: result.recordset });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPropositos = async (req, res) => {
    try {
        const pool = await connectDB();
        const empresaId = req.user?.empresaId || 1;
        const result = await pool.request().input('empresaId', sql.Int, empresaId)
            .query(`SELECT PropositoID, PropositoDescripcion FROM MGPropositos WHERE EmpresaID = @empresaId`);
        res.json({ data: result.recordset });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
