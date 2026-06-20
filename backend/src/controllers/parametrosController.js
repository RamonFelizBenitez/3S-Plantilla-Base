const { connectDB } = require('../config/db');

exports.getParametrosRRHH = async (req, res) => {
    try {
        const { empresaId } = req.query;
        if (!empresaId) return res.status(400).json({ message: "empresaId is required" });

        const pool = await connectDB();
        const result = await pool.request()
            .input('empresaId', empresaId)
            .query(`SELECT * FROM RHPARAMETROS WHERE EmpresaID = @empresaId`);
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.json({}); // return empty if not found
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.saveParametrosRRHH = async (req, res) => {
    try {
        const { empresaId } = req.query;
        const {
            Firma1 = '', CargoIDFirma1 = '',
            Firma2 = '', CargoIDFirma2 = '',
            Firma3 = '', CargoIDFirma3 = ''
        } = req.body;

        if (!empresaId) return res.status(400).json({ message: "empresaId is required" });

        const pool = await connectDB();
        
        // UPSERT LOGIC
        const checkResult = await pool.request()
            .input('empresaId', empresaId)
            .query(`SELECT 1 FROM RHPARAMETROS WHERE EmpresaID = @empresaId`);
            
        if (checkResult.recordset.length > 0) {
            await pool.request()
                .input('empresaId', empresaId)
                .input('Firma1', Firma1)
                .input('CargoIDFirma1', CargoIDFirma1)
                .input('Firma2', Firma2)
                .input('CargoIDFirma2', CargoIDFirma2)
                .input('Firma3', Firma3)
                .input('CargoIDFirma3', CargoIDFirma3)
                .query(`UPDATE RHPARAMETROS SET 
                            Firma1 = @Firma1, 
                            CargoIDFirma1 = @CargoIDFirma1,
                            Firma2 = @Firma2, 
                            CargoIDFirma2 = @CargoIDFirma2,
                            Firma3 = @Firma3, 
                            CargoIDFirma3 = @CargoIDFirma3,
                            FechaModificado = GETDATE()
                        WHERE EmpresaID = @empresaId`);
            res.json({ message: 'Parámetros actualizados correctamente' });
        } else {
            await pool.request()
                .input('empresaId', empresaId)
                .input('Firma1', Firma1)
                .input('CargoIDFirma1', CargoIDFirma1)
                .input('Firma2', Firma2)
                .input('CargoIDFirma2', CargoIDFirma2)
                .input('Firma3', Firma3)
                .input('CargoIDFirma3', CargoIDFirma3)
                .query(`INSERT INTO RHPARAMETROS (EmpresaID, Firma1, CargoIDFirma1, Firma2, CargoIDFirma2, Firma3, CargoIDFirma3) 
                        VALUES (@empresaId, @Firma1, @CargoIDFirma1, @Firma2, @CargoIDFirma2, @Firma3, @CargoIDFirma3)`);
            res.status(201).json({ message: 'Parámetros creados correctamente' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
