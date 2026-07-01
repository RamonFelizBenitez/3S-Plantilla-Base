const { sql, connectDB } = require('./config/db');

async function resetOpciones() {
    let pool;
    try {
        pool = await connectDB();
        
        // 1. Limpiar Permisos y Opciones
        await pool.request().query(`DELETE FROM Permisos_Perfiles`);
        await pool.request().query(`DELETE FROM Permisos_Usuarios`);
        await pool.request().query(`DELETE FROM Opciones`);
        await pool.request().query(`DBCC CHECKIDENT ('Opciones', RESEED, 0)`);
        
        let res;
        
        // ==========================================
        // MÓDULO 1: RECURSOS HUMANOS
        // ==========================================
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Solicitudes', '/solicitudes', 'FileText', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Personal', '/personal', 'Users', 0, 2)`);
        
        // Acciones
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (1, NULL, 'Acciones', '', 'RefreshCw', 1, 3)`);
        let fAcc = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Designación', '/designacion', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Cambios', '/cambios', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Separación', '/separacion', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Amonestaciones', '/amonestaciones', '', 0, 4)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Vacaciones', '/vacaciones', '', 0, 5)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Ausencias', '/ausencias', '', 0, 6)`);

        // Informes
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (1, NULL, 'Informes', '', 'Folder', 1, 4)`);
        let fInf = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fInf}, 'Lista de Solicitudes', '/informes/solicitudes', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fInf}, 'Lista de Empleados', '/informes/empleados', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fInf}, 'Lista de Acciones', '/informes/acciones', '', 0, 3)`);

        // Informacion Complementaria
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (1, NULL, 'Información Complementaria', '', 'Database', 1, 5)`);
        let fComp = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Parentesco', '/info/parentesco', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Nivel Académico', '/info/nivel-academico', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Idiomas', '/info/idiomas', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Nivel de Traducción', '/info/nivel-traduccion', '', 0, 4)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Actividades', '/info/actividades', '', 0, 5)`);

        // Configuracion
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (1, NULL, 'Configuración', '', 'Settings', 1, 6)`);
        let fConf = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fConf}, 'Direcciones', '/configuracion/direcciones', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fConf}, 'Cargos', '/configuracion/cargos', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fConf}, 'Tipos de Acciones', '/configuracion/tipos-acciones', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fConf}, 'Cedes', '/configuracion/cedes', '', 0, 4)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fConf}, 'Grupo Ocupacional', '/configuracion/grupo-ocupacional', '', 0, 5)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fConf}, 'Motivos de Separación', '/configuracion/motivos-separacion', '', 0, 6)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fConf}, 'Parámetros', '/configuracion/parametros', '', 0, 7)`);

        // ==========================================
        // MÓDULO 2: NÓMINA
        // ==========================================
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Mantenimientos', '', 'Folder', 1, 1)`);
        let folderMant = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Conceptos de Nómina', '/nomina/conceptos', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Tipos de Nómina', '/nomina/tipos', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Gestión de Bancos y Cuentas', '/nomina/bancos', '', 0, 3)`);

        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Procesos', '', 'Folder', 1, 2)`);
        let folderProc = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Cálculo de Nómina', '/nomina/calculo', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Registro de Horas Extras', '/nomina/horas-extras', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Préstamos y Adelantos', '/nomina/prestamos', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Cierre de Nómina', '/nomina/cierre', '', 0, 4)`);

        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Reportes', '', 'Folder', 1, 3)`);
        let folderRep = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Volantes de Pago', '/nomina/reportes/volantes', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Resumen General de Nómina', '/nomina/reportes/resumen', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Archivo para Banco', '/nomina/reportes/banco', '', 0, 3)`);

        // ==========================================
        // MÓDULO 3: ADMINISTRACIÓN DEL SISTEMA
        // ==========================================
        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'Seguridad', '', 'Folder', 1, 1)`);
        let folderSeg = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Usuarios', '/administracion/usuarios', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Roles y Perfiles', '/administracion/perfiles', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Permisos de Acceso', '/administracion/permisos', '', 0, 3)`);

        res = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'Configuraciones Generales', '', 'Folder', 1, 2)`);
        let folderConf = res.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Empresas', '/administracion/empresas', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Parámetros del Sistema', '/administracion/parametros', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Secuencias Numéricas', '/administracion/secuencias', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Catálogos Globales', '/administracion/catalogos', '', 0, 4)`);

        // Dar permisos totales al perfil Administrador (PerfilID = 1) para TODAS las opciones
        res = await pool.request().query(\`SELECT OpcionID FROM Opciones WHERE EsCarpeta = 0\`);
        for(let option of res.recordset) {
            await pool.request().query(\`INSERT INTO Permisos_Perfiles (PerfilID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar) VALUES (1, \${option.OpcionID}, 1, 1, 1, 1)\`);
        }

        console.log("¡Opciones reestructuradas exitosamente!");
        process.exit(0);
    } catch(err) {
        console.error("Error insertando opciones:", err);
        process.exit(1);
    }
}

resetOpciones();
