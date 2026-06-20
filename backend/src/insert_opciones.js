const { sql, connectDB } = require('./config/db');

async function insertOpciones() {
    let pool;
    try {
        pool = await connectDB();
        
        // ==========================================
        // MÓDULO 2: NÓMINA
        // ==========================================
        
        // 1. Mantenimientos (Carpeta)
        let res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Mantenimientos', '', 'Folder', 1, 1)`);
        let folderMant = res.recordset[0].OpcionID;
        
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Conceptos de Nómina', '/nomina/conceptos', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Tipos de Nómina', '/nomina/tipos', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Gestión de Bancos y Cuentas', '/nomina/bancos', '', 0, 3)`);

        // 2. Procesos (Carpeta)
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Procesos', '', 'Folder', 1, 2)`);
        let folderProc = res.recordset[0].OpcionID;
        
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Cálculo de Nómina', '/nomina/calculo', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Registro de Horas Extras', '/nomina/horas-extras', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Préstamos y Adelantos', '/nomina/prestamos', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Cierre de Nómina', '/nomina/cierre', '', 0, 4)`);

        // 3. Reportes (Carpeta)
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Reportes', '', 'Folder', 1, 3)`);
        let folderRep = res.recordset[0].OpcionID;
        
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Volantes de Pago', '/nomina/reportes/volantes', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Resumen General de Nómina', '/nomina/reportes/resumen', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Archivo para Banco', '/nomina/reportes/banco', '', 0, 3)`);


        // ==========================================
        // MÓDULO 3: ADMINISTRACIÓN DEL SISTEMA
        // ==========================================
        
        // 1. Seguridad (Carpeta)
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'Seguridad', '', 'Folder', 1, 1)`);
        let folderSeg = res.recordset[0].OpcionID;
        
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Usuarios', '/administracion/usuarios', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Roles y Perfiles', '/administracion/perfiles', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Permisos de Acceso', '/administracion/permisos', '', 0, 3)`);

        // 2. Configuraciones Generales (Carpeta)
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'Configuraciones Generales', '', 'Folder', 1, 2)`);
        let folderConf = res.recordset[0].OpcionID;
        
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Empresas', '/administracion/empresas', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Parámetros del Sistema', '/administracion/parametros', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Secuencias Numéricas', '/administracion/secuencias', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Catálogos Globales', '/administracion/catalogos', '', 0, 4)`);

        console.log("¡Opciones insertadas exitosamente!");
        process.exit(0);
    } catch(err) {
        console.error("Error insertando opciones:", err);
        process.exit(1);
    }
}

insertOpciones();
