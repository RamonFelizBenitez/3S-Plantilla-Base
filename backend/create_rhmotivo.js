const { connectDB } = require('./src/config/db');

async function createTable() {
  try {
    const pool = await connectDB();
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RHMOTIVO' and xtype='U')
      CREATE TABLE RHMOTIVO (
          MotivoID INT IDENTITY(1,1) PRIMARY KEY,
          EmpresaID VARCHAR(50) NOT NULL,
          Descripcion VARCHAR(150) NOT NULL,
          Estatus INT DEFAULT 1,
          CreadoPor VARCHAR(50),
          FechaCreado DATETIME DEFAULT GETDATE(),
          ModificadoPor VARCHAR(50),
          FechaModificado DATETIME
      );
    `);
    console.log("Tabla RHMOTIVO creada exitosamente.");
  } catch(e) {
    console.error("Error al crear tabla:", e.message);
  }
  process.exit();
}
createTable();
