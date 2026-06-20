const { sql, connectDB } = require('../config/db');

const createCatalogController = (tableName, idColumn) => {
  return {
    getAll: async (req, res) => {
      try {
        const { empresaId } = req.query;
        if (!empresaId) return res.status(400).json({ message: 'EmpresaID es requerido' });

        const pool = await connectDB();
        const result = await pool.request()
          .input('empresaId', sql.Int, parseInt(empresaId))
          .query(`SELECT * FROM ${tableName} WHERE EmpresaID = @empresaId`);
        res.json(result.recordset);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },

    create: async (req, res) => {
      try {
        const { EmpresaID, Descripcion, CreadoPor } = req.body;
        const pool = await connectDB();

        await pool.request()
          .input('EmpresaID', sql.Int, parseInt(EmpresaID))
          .input('Descripcion', sql.NVarChar, Descripcion)
          .input('CreadoPor', sql.Int, CreadoPor || null)
          .query(`
            INSERT INTO ${tableName} (EmpresaID, Descripcion, CreadoPor, Activo) 
            VALUES (@EmpresaID, @Descripcion, @CreadoPor, 1)
          `);
          
        res.status(201).json({ message: 'Registro creado exitosamente' });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },

    update: async (req, res) => {
      try {
        const id = req.params.id;
        const { EmpresaID, Descripcion, Activo, ModificadoPor } = req.body;
        const pool = await connectDB();

        await pool.request()
          .input('ID', sql.Int, parseInt(id))
          .input('EmpresaID', sql.Int, parseInt(EmpresaID))
          .input('Descripcion', sql.NVarChar, Descripcion)
          .input('Activo', sql.Bit, Activo !== undefined ? Activo : 1)
          .input('ModificadoPor', sql.Int, ModificadoPor || null)
          .query(`
            UPDATE ${tableName} 
            SET Descripcion = @Descripcion, Activo = @Activo, ModificadoPor = @ModificadoPor, FechaModificado = GETDATE()
            WHERE ${idColumn} = @ID AND EmpresaID = @EmpresaID
          `);
          
        res.json({ message: 'Registro actualizado exitosamente' });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    },

    delete: async (req, res) => {
      try {
        const id = req.params.id;
        const { empresaId } = req.query;
        const pool = await connectDB();

        await pool.request()
          .input('ID', sql.Int, parseInt(id))
          .input('EmpresaID', sql.Int, parseInt(empresaId))
          .query(`DELETE FROM ${tableName} WHERE ${idColumn} = @ID AND EmpresaID = @EmpresaID`);
          
        res.json({ message: 'Registro eliminado exitosamente' });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  };
};

module.exports = {
  parentescos: createCatalogController('RHParentescos', 'ParentescoID'),
  nivelesAcademicos: createCatalogController('RHNivelesAcademicos', 'NivelAcademicoID'),
  titulosAcademicos: createCatalogController('RHTitulosAcademicos', 'TituloAcademicoID'),
  idiomas: createCatalogController('RHIdiomas', 'IdiomaID'),
  traducciones: createCatalogController('RHNivelesTraduccion', 'NivelTraduccionID'),
  actividades: createCatalogController('RHActividades', 'ActividadID')
};
