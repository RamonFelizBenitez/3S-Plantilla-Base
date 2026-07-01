const express = require('express');
const router = express.Router();
const permisoController = require('../../controllers/administracion/permisoController');
const { sql, connectDB } = require('../../config/db');

router.get('/estructura', permisoController.getEstructuraMenu);
router.get('/:tipo/:id', permisoController.getPermisos); // tipo = 'perfil' o 'usuario'
router.post('/guardar/:tipo/:id', permisoController.savePermisos);

router.get('/reset', async (req, res) => {
    try {
        let pool = await connectDB();
        
        // 1. Limpiar Permisos y Opciones
        await pool.request().query(`DELETE FROM Permisos_Perfiles`);
        await pool.request().query(`DELETE FROM Permisos_Usuarios`);
        await pool.request().query(`DELETE FROM Opciones`);
        await pool.request().query(`DBCC CHECKIDENT ('Opciones', RESEED, 0)`);
        
        let result;
        
        // ==========================================
        // MÓDULO 1: RECURSOS HUMANOS
        // ==========================================
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Solicitudes', '/solicitudes', 'FileText', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Personal', '/personal', 'Users', 0, 2)`);
        
        // Acciones
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (1, NULL, 'Acciones', '', 'RefreshCw', 1, 3)`);
        let fAcc = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Designación', '/designacion', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Cambios', '/cambios', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Separación', '/separacion', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Amonestaciones', '/amonestaciones', '', 0, 4)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Vacaciones', '/vacaciones', '', 0, 5)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fAcc}, 'Ausencias', '/ausencias', '', 0, 6)`);

        // Informes
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (1, NULL, 'Informes', '', 'Folder', 1, 4)`);
        let fInf = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fInf}, 'Lista de Solicitudes', '/informes/solicitudes', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fInf}, 'Lista de Empleados', '/informes/empleados', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fInf}, 'Lista de Acciones', '/informes/acciones', '', 0, 3)`);

        // Informacion Complementaria
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (1, NULL, 'Información Complementaria', '', 'Database', 1, 5)`);
        let fComp = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Parentesco', '/info/parentesco', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Nivel Académico', '/info/nivel-academico', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Idiomas', '/info/idiomas', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Nivel de Traducción', '/info/nivel-traduccion', '', 0, 4)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, ${fComp}, 'Actividades', '/info/actividades', '', 0, 5)`);

        // Configuracion
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (1, NULL, 'Configuración', '', 'Settings', 1, 6)`);
        let fConf = result.recordset[0].OpcionID;
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
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Mantenimientos', '', 'Folder', 1, 1)`);
        let folderMant = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Conceptos de Nómina', '/nomina/conceptos', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Tipos de Nómina', '/nomina/tipos', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderMant}, 'Gestión de Bancos y Cuentas', '/nomina/bancos', '', 0, 3)`);

        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Procesos', '', 'Folder', 1, 2)`);
        let folderProc = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Cálculo de Nómina', '/nomina/calculo', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Registro de Horas Extras', '/nomina/horas-extras', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Préstamos y Adelantos', '/nomina/prestamos', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderProc}, 'Cierre de Nómina', '/nomina/cierre', '', 0, 4)`);

        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Reportes', '', 'Folder', 1, 3)`);
        let folderRep = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Volantes de Pago', '/nomina/reportes/volantes', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Resumen General de Nómina', '/nomina/reportes/resumen', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${folderRep}, 'Archivo para Banco', '/nomina/reportes/banco', '', 0, 3)`);

        // ==========================================
        // MÓDULO 3: ADMINISTRACIÓN DEL SISTEMA
        // ==========================================
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'Seguridad', '', 'Folder', 1, 1)`);
        let folderSeg = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Usuarios', '/administracion/usuarios', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Roles y Perfiles', '/administracion/perfiles', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderSeg}, 'Permisos de Acceso', '/administracion/permisos', '', 0, 3)`);

        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'Configuraciones Generales', '', 'Folder', 1, 2)`);
        let folderConf = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Empresas', '/administracion/empresas', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Parámetros del Sistema', '/administracion/parametros', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Secuencias Numéricas', '/administracion/secuencias', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${folderConf}, 'Catálogos Globales', '/administracion/catalogos', '', 0, 4)`);

        // Dar permisos totales al perfil Administrador (PerfilID = 1) para TODAS las opciones que NO son carpetas
        result = await pool.request().query(`SELECT OpcionID FROM Opciones WHERE EsCarpeta = 0`);
        for(let option of result.recordset) {
            await pool.request().query(`INSERT INTO Permisos_Perfiles (PerfilID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar) VALUES (1, ${option.OpcionID}, 1, 1, 1, 1)`);
        }

        res.json({ message: 'Reset successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/reset-nomina', async (req, res) => {
    const { connectDB } = require('../../config/db');
    try {
        let pool = await connectDB();
        
        // Eliminar las opciones actuales del modulo 2 para recrearlas
        await pool.request().query(`DELETE FROM Permisos_Perfiles WHERE OpcionID IN (SELECT OpcionID FROM Opciones WHERE ModuloID = 2)`);
        await pool.request().query(`DELETE FROM Permisos_Usuarios WHERE OpcionID IN (SELECT OpcionID FROM Opciones WHERE ModuloID = 2)`);
        await pool.request().query(`DELETE FROM Opciones WHERE ModuloID = 2`);
        
        let result;
        
        // Empleados (fuera de carpeta)
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, NULL, 'Empleados', '/nomina/empleados', 'Users', 0, 1)`);

        // Carpeta Transacciones
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Transacciones', '', 'Folder', 1, 2)`);
        let fTrans = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fTrans}, 'Abrir Nómina', '/nomina/transacciones/abrir', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fTrans}, 'Subir Nómina desde Excel', '/nomina/transacciones/subir-excel', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fTrans}, 'Aplicar Descuentos externos', '/nomina/transacciones/descuentos', '', 0, 3)`);

        // Carpeta Calculo
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Cálculo', '', 'Folder', 1, 3)`);
        let fCalc = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fCalc}, 'Cálculo de bonificaciones', '/nomina/calculo/bonificaciones', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fCalc}, 'Cálculo de Vacaciones', '/nomina/calculo/vacaciones', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fCalc}, 'Cálculo de Regalía Pascual', '/nomina/calculo/regalia', '', 0, 3)`);

        // Carpeta Proceso
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Proceso', '', 'Folder', 1, 4)`);
        let fProc = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fProc}, 'Generar Nómina', '/nomina/proceso/generar', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fProc}, 'Cerrar Nómina', '/nomina/proceso/cerrar', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fProc}, 'Generar Archivo de Banco', '/nomina/proceso/archivo-banco', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fProc}, 'Generar Entrada de Diario', '/nomina/proceso/entrada-diario', '', 0, 4)`);

        // Carpeta Informes
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Informes', '', 'Folder', 1, 5)`);
        let fInf = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fInf}, 'Nómina Detallada', '/nomina/informes/detallada', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fInf}, 'Resumen de Nómina', '/nomina/informes/resumen', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fInf}, 'Transacciones de Nómina', '/nomina/informes/transacciones', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fInf}, 'Volantes de Pago', '/nomina/informes/volantes', '', 0, 4)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fInf}, 'Generar Reporte de Tesorería', '/nomina/informes/tesoreria', '', 0, 5)`);

        // Carpeta Configuracion
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (2, NULL, 'Configuración', '', 'Folder', 1, 6)`);
        let fConf = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'Tipos de Transacciones', '/nomina/configuracion/tipos-transacciones', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'Tipos de Nómina', '/nomina/configuracion/tipos-nomina', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'Contabilización de Nóminas', '/nomina/configuracion/contabilizacion', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'Cargos', '/nomina/configuracion/cargos', '', 0, 4)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'ISR', '/nomina/configuracion/isr', '', 0, 5)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'Ley 87-01', '/nomina/configuracion/ley8701', '', 0, 6)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'Periodos de Nómina', '/nomina/configuracion/periodos', '', 0, 7)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'Parámetros de Bonificación', '/nomina/configuracion/parametros-bonificacion', '', 0, 8)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, ${fConf}, 'Parámetros', '/nomina/configuracion/parametros', '', 0, 9)`);

        // Dar permisos totales al perfil Administrador (PerfilID = 1) para TODAS las opciones que NO son carpetas (Modulo 2)
        result = await pool.request().query(`SELECT OpcionID FROM Opciones WHERE ModuloID = 2 AND EsCarpeta = 0`);
        for(let option of result.recordset) {
            await pool.request().query(`INSERT INTO Permisos_Perfiles (PerfilID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar) VALUES (1, ${option.OpcionID}, 1, 1, 1, 1)`);
        }

        res.json({ message: 'Nomina reset successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/reset-admin', async (req, res) => {
    const { connectDB } = require('../../config/db');
    try {
        let pool = await connectDB();
        
        // Eliminar las opciones actuales del modulo 3 para recrearlas
        await pool.request().query(`DELETE FROM Permisos_Perfiles WHERE OpcionID IN (SELECT OpcionID FROM Opciones WHERE ModuloID = 3)`);
        await pool.request().query(`DELETE FROM Permisos_Usuarios WHERE OpcionID IN (SELECT OpcionID FROM Opciones WHERE ModuloID = 3)`);
        await pool.request().query(`DELETE FROM Opciones WHERE ModuloID = 3`);
        
        let result;
        
        // Carpeta Empresa
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'Empresa', '', 'Folder', 1, 1)`);
        let fEmp = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fEmp}, 'Seleccionar Empresa', '/administracion/empresa/seleccionar', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fEmp}, 'Empresas', '/administracion/empresa/empresas', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fEmp}, 'Información de la Empresa', '/administracion/empresa/informacion', '', 0, 3)`);

        // Carpeta Gestion de Usuarios
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'Gestión de Usuarios', '', 'Folder', 1, 2)`);
        let fUsu = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fUsu}, 'Usuarios', '/administracion/usuarios', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fUsu}, 'Perfiles de Usuarios', '/administracion/perfiles', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fUsu}, 'Permisos de Usuarios', '/administracion/permisos', '', 0, 3)`);

        // Carpeta General
        result = await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) OUTPUT INSERTED.OpcionID VALUES (3, NULL, 'General', '', 'Folder', 1, 3)`);
        let fGen = result.recordset[0].OpcionID;
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Catálogo de Cuentas', '/administracion/general/catalogo', '', 0, 1)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Secuencia Numericas', '/administracion/general/secuencias', '', 0, 2)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Monedas', '/administracion/general/monedas', '', 0, 3)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Periodos Contable', '/administracion/general/periodos-contable', '', 0, 4)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Parametros Generales', '/administracion/general/parametros', '', 0, 5)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Impuestos', '/administracion/general/impuestos', '', 0, 6)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Continentes', '/administracion/general/continentes', '', 0, 7)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Paises', '/administracion/general/paises', '', 0, 8)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Ciudades', '/administracion/general/ciudades', '', 0, 9)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Municipios', '/administracion/general/municipios', '', 0, 10)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Departamentos Contables', '/administracion/general/dept-contables', '', 0, 11)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Centros de Costos Contables', '/administracion/general/costos-contables', '', 0, 12)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Proposito Contable', '/administracion/general/proposito-contable', '', 0, 13)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Unidades de Medidas', '/administracion/general/unidades-medidas', '', 0, 14)`);
        await pool.request().query(`INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, ${fGen}, 'Conversion de Unidades de Medidas', '/administracion/general/conversion-medidas', '', 0, 15)`);

        // Dar permisos totales al perfil Administrador (PerfilID = 1) para TODAS las opciones que NO son carpetas (Modulo 3)
        result = await pool.request().query(`SELECT OpcionID FROM Opciones WHERE ModuloID = 3 AND EsCarpeta = 0`);
        for(let option of result.recordset) {
            await pool.request().query(`INSERT INTO Permisos_Perfiles (PerfilID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar) VALUES (1, ${option.OpcionID}, 1, 1, 1, 1)`);
        }

        res.json({ message: 'Admin reset successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
