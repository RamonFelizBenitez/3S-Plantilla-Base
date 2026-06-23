-- Crear base de datos (Ejecutar manualmente si no existe)
-- CREATE DATABASE RHDBW;
-- GO
-- USE RHDBW;
-- GO

-- =========================================================
-- TEARDOWN (IDEMPOTENCIA)
-- Borra las tablas si existen para poder correr este script
-- de forma continua sin tener que borrar la Base de Datos.
-- El orden de borrado DEBE ser estricto (de hijos a padres)
-- =========================================================
IF OBJECT_ID('dbo.RHSolicitudDocumentos', 'U') IS NOT NULL DROP TABLE dbo.RHSolicitudDocumentos;
IF OBJECT_ID('dbo.RHSolicitudes', 'U') IS NOT NULL DROP TABLE dbo.RHSolicitudes;
IF OBJECT_ID('dbo.RHActividades', 'U') IS NOT NULL DROP TABLE dbo.RHActividades;
IF OBJECT_ID('dbo.RHNivelesTraduccion', 'U') IS NOT NULL DROP TABLE dbo.RHNivelesTraduccion;
IF OBJECT_ID('dbo.RHIdiomas', 'U') IS NOT NULL DROP TABLE dbo.RHIdiomas;
IF OBJECT_ID('dbo.RHTitulosAcademicos', 'U') IS NOT NULL DROP TABLE dbo.RHTitulosAcademicos;
IF OBJECT_ID('dbo.RHNivelesAcademicos', 'U') IS NOT NULL DROP TABLE dbo.RHNivelesAcademicos;
IF OBJECT_ID('dbo.RHParentescos', 'U') IS NOT NULL DROP TABLE dbo.RHParentescos;
IF OBJECT_ID('dbo.MGTRANS', 'U') IS NOT NULL DROP TABLE dbo.MGTRANS;
IF OBJECT_ID('dbo.UNIDADESCONVERSION', 'U') IS NOT NULL DROP TABLE dbo.UNIDADESCONVERSION;
IF OBJECT_ID('dbo.UNIDADESMEDIDA', 'U') IS NOT NULL DROP TABLE dbo.UNIDADESMEDIDA;
IF OBJECT_ID('dbo.MG_CATALOGO', 'U') IS NOT NULL DROP TABLE dbo.MG_CATALOGO;
IF OBJECT_ID('dbo.MGPropositos', 'U') IS NOT NULL DROP TABLE dbo.MGPropositos;
IF OBJECT_ID('dbo.MGCentroCostos', 'U') IS NOT NULL DROP TABLE dbo.MGCentroCostos;
IF OBJECT_ID('dbo.MGDepartamentos', 'U') IS NOT NULL DROP TABLE dbo.MGDepartamentos;
IF OBJECT_ID('dbo.Monedas', 'U') IS NOT NULL DROP TABLE dbo.Monedas;
IF OBJECT_ID('dbo.MGPeriodos', 'U') IS NOT NULL DROP TABLE dbo.MGPeriodos;
IF OBJECT_ID('dbo.SecuenciasNum', 'U') IS NOT NULL DROP TABLE dbo.SecuenciasNum;
IF OBJECT_ID('dbo.Permisos_Usuarios', 'U') IS NOT NULL DROP TABLE dbo.Permisos_Usuarios;
IF OBJECT_ID('dbo.Permisos_Perfiles', 'U') IS NOT NULL DROP TABLE dbo.Permisos_Perfiles;
IF OBJECT_ID('dbo.Opciones', 'U') IS NOT NULL DROP TABLE dbo.Opciones;
IF OBJECT_ID('dbo.Licencias_Empresas_Modulos', 'U') IS NOT NULL DROP TABLE dbo.Licencias_Empresas_Modulos;
IF OBJECT_ID('dbo.Modulos', 'U') IS NOT NULL DROP TABLE dbo.Modulos;
IF OBJECT_ID('dbo.Usuarios_Perfiles', 'U') IS NOT NULL DROP TABLE dbo.Usuarios_Perfiles;
IF OBJECT_ID('dbo.Usuarios_Empresas', 'U') IS NOT NULL DROP TABLE dbo.Usuarios_Empresas;
IF OBJECT_ID('dbo.Perfiles', 'U') IS NOT NULL DROP TABLE dbo.Perfiles;
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL DROP TABLE dbo.Usuarios;
IF OBJECT_ID('dbo.EmpresaInfo', 'U') IS NOT NULL DROP TABLE dbo.EmpresaInfo;
IF OBJECT_ID('dbo.Empresas', 'U') IS NOT NULL DROP TABLE dbo.Empresas;
IF OBJECT_ID('dbo.Municipios', 'U') IS NOT NULL DROP TABLE dbo.Municipios;
IF OBJECT_ID('dbo.Ciudades', 'U') IS NOT NULL DROP TABLE dbo.Ciudades;
IF OBJECT_ID('dbo.Paises', 'U') IS NOT NULL DROP TABLE dbo.Paises;
IF OBJECT_ID('dbo.Continentes', 'U') IS NOT NULL DROP TABLE dbo.Continentes;

-- =========================================================
-- CREACIÓN DE TABLAS
-- =========================================================

-- Catálogo Geográfico
CREATE TABLE Continentes (
    ContinenteID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

CREATE TABLE Paises (
    PaisID INT IDENTITY(1,1) PRIMARY KEY,
    ContinenteID INT NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    FOREIGN KEY (ContinenteID) REFERENCES Continentes(ContinenteID)
);

CREATE TABLE Ciudades (
    CiudadID INT IDENTITY(1,1) PRIMARY KEY,
    PaisID INT NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    FOREIGN KEY (PaisID) REFERENCES Paises(PaisID)
);

CREATE TABLE Municipios (
    MunicipioID INT IDENTITY(1,1) PRIMARY KEY,
    CiudadID INT NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    FOREIGN KEY (CiudadID) REFERENCES Ciudades(CiudadID)
);
-- Catálogo de Empresas (Solo identificador y auditoría)
CREATE TABLE Empresas (
    EmpresaID INT IDENTITY(1,1) PRIMARY KEY,
    NombreEmpresa NVARCHAR(150) NOT NULL,
    Activa BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL,
    FechaCreado DATETIME NOT NULL DEFAULT GETDATE(),
    ModificadoPor INT NULL,
    FechaModificado DATETIME NULL
);

-- Información Corporativa Detallada de la Empresa (Relación 1:1)
CREATE TABLE EmpresaInfo (
    EmpresaInfoID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL UNIQUE, 
    RNC NVARCHAR(20) NULL,
    Direccion NVARCHAR(255) NULL,
    PaisID INT NULL,
    CiudadID INT NULL,
    MunicipioID INT NULL,
    Telefono NVARCHAR(50) NULL,
    Correo NVARCHAR(100) NULL,
    PaginaWeb NVARCHAR(255) NULL,
    Logo NVARCHAR(MAX) NULL, 
    Representante NVARCHAR(150) NULL,
    CargoRepresentante NVARCHAR(100) NULL,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID),
    FOREIGN KEY (PaisID) REFERENCES Paises(PaisID),
    FOREIGN KEY (CiudadID) REFERENCES Ciudades(CiudadID),
    FOREIGN KEY (MunicipioID) REFERENCES Municipios(MunicipioID)
);

-- Usuarios (Multi-tenant)
CREATE TABLE Usuarios (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    NombreUsuario NVARCHAR(50) NOT NULL UNIQUE,
    NombreCompleto NVARCHAR(150) NOT NULL,
    Correo NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    EsGlobal BIT NOT NULL DEFAULT 0, 
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

-- Tabla Puente: Usuarios a Múltiples Empresas
CREATE TABLE Usuarios_Empresas (
    UsuarioID INT NOT NULL,
    EmpresaID INT NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    PRIMARY KEY (UsuarioID, EmpresaID),
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

CREATE TABLE Perfiles (
    PerfilID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NULL, 
    Descripcion NVARCHAR(100) NOT NULL,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

CREATE TABLE Usuarios_Perfiles (
    UsuarioID INT NOT NULL,
    PerfilID INT NOT NULL,
    PRIMARY KEY (UsuarioID, PerfilID),
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (PerfilID) REFERENCES Perfiles(PerfilID)
);

-- Catálogo de Módulos (Ej: Recursos Humanos, Nómina)
CREATE TABLE Modulos (
    ModuloID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Icono NVARCHAR(50) NULL,
    Orden INT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

-- Control de Licencias por Empresa (SaaS)
CREATE TABLE Licencias_Empresas_Modulos (
    LicenciaID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    ModuloID INT NOT NULL,
    FechaInicio DATE NOT NULL DEFAULT GETDATE(),
    FechaVencimiento DATE NULL, -- NULL significa licencia perpetua
    Activo BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID),
    FOREIGN KEY (ModuloID) REFERENCES Modulos(ModuloID),
    UNIQUE (EmpresaID, ModuloID) -- Evitar licencias duplicadas para el mismo módulo en la misma empresa
);

-- Catálogo de Opciones / Carpetas dentro de un Módulo
CREATE TABLE Opciones (
    OpcionID INT IDENTITY(1,1) PRIMARY KEY,
    ModuloID INT NOT NULL,
    CarpetaPadreID INT NULL, 
    Nombre NVARCHAR(100) NOT NULL,
    Ruta NVARCHAR(255) NULL, 
    Icono NVARCHAR(50) NULL,
    EsCarpeta BIT NOT NULL DEFAULT 0,
    Orden INT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    FOREIGN KEY (ModuloID) REFERENCES Modulos(ModuloID),
    FOREIGN KEY (CarpetaPadreID) REFERENCES Opciones(OpcionID)
);

-- Permisos asignados a nivel de Perfil (Rol)
CREATE TABLE Permisos_Perfiles (
    PermisoPerfilID INT IDENTITY(1,1) PRIMARY KEY,
    PerfilID INT NOT NULL,
    OpcionID INT NOT NULL,
    PuedeConsultar BIT NOT NULL DEFAULT 0,
    PuedeInsertar BIT NOT NULL DEFAULT 0,
    PuedeModificar BIT NOT NULL DEFAULT 0,
    PuedeEliminar BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (PerfilID) REFERENCES Perfiles(PerfilID),
    FOREIGN KEY (OpcionID) REFERENCES Opciones(OpcionID)
);

-- Permisos específicos asignados directamente a un Usuario (Excepciones/Granularidad)
CREATE TABLE Permisos_Usuarios (
    PermisoUsuarioID INT IDENTITY(1,1) UNIQUE,
    UsuarioID INT NOT NULL,
    EmpresaID INT NOT NULL,
    OpcionID INT NOT NULL,
    PuedeConsultar BIT NOT NULL DEFAULT 0,
    PuedeInsertar BIT NOT NULL DEFAULT 0,
    PuedeModificar BIT NOT NULL DEFAULT 0,
    PuedeEliminar BIT NOT NULL DEFAULT 0,
    PRIMARY KEY (UsuarioID, EmpresaID, OpcionID),
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID),
    FOREIGN KEY (OpcionID) REFERENCES Opciones(OpcionID)
);

-- Insertar datos semilla básicos
INSERT INTO Empresas (NombreEmpresa, Activa) VALUES ('Empresa Principal', 1);

-- Insertar EmpresaInfo inicial para la Empresa 1
INSERT INTO EmpresaInfo (EmpresaID, RNC) VALUES (1, '130000001');

-- Usuario Global (No asociado a una empresa específica en tabla puente porque tiene acceso a todo)
INSERT INTO Usuarios (NombreUsuario, NombreCompleto, Correo, PasswordHash, EsGlobal, Activo)
VALUES ('admin', 'Administrador Global', 'admin@rhdbw.com', '$2b$10$t/sK8.4V.5ZzB6J5B3C8M.eH/2/G.K.3.rC5H8J8Z.C8J.M.1.e', 1, 1);

-- Usuario de Empresa Específica
INSERT INTO Usuarios (NombreUsuario, NombreCompleto, Correo, PasswordHash, EsGlobal, Activo)
VALUES ('rrhh1', 'Usuario RRHH Empresa Principal', 'rrhh1@empresa.com', '$2b$10$t/sK8.4V.5ZzB6J5B3C8M.eH/2/G.K.3.rC5H8J8Z.C8J.M.1.e', 0, 1);

-- Conectar el usuario rrhh1 a la Empresa Principal
INSERT INTO Usuarios_Empresas (UsuarioID, EmpresaID) VALUES (2, 1);

INSERT INTO Perfiles (EmpresaID, Descripcion) VALUES (NULL, 'Administrador Global');
INSERT INTO Usuarios_Perfiles (UsuarioID, PerfilID) VALUES (1, 1);

-- Ejemplos de Modulos
INSERT INTO Modulos (Nombre, Icono, Orden) VALUES ('Recursos Humanos', 'Users', 1);
INSERT INTO Modulos (Nombre, Icono, Orden) VALUES ('Nómina', 'DollarSign', 2);
INSERT INTO Modulos (Nombre, Icono, Orden) VALUES ('Administración del Sistema', 'Shield', 3);

-- Activar Licencias para la Empresa Principal (EmpresaID = 1)
-- Le damos acceso a RRHH y Administración del Sistema, pero NO a Nómina (como ejemplo)
INSERT INTO Licencias_Empresas_Modulos (EmpresaID, ModuloID, FechaInicio, FechaVencimiento, Activo) VALUES (1, 1, GETDATE(), NULL, 1);
INSERT INTO Licencias_Empresas_Modulos (EmpresaID, ModuloID, FechaInicio, FechaVencimiento, Activo) VALUES (1, 3, GETDATE(), NULL, 1);

-- Ejemplos de Opciones (Solo algunas como prueba)
-- ==========================================
-- MÓDULO 1: RECURSOS HUMANOS
-- ==========================================
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Solicitudes', '/solicitudes', 'FileText', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Personal', '/personal', 'Users', 0, 2);

-- Acciones
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Acciones', '', 'RefreshCw', 1, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 3, 'Designación', '/designacion', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 3, 'Cambios', '/cambios', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 3, 'Separación', '/separacion', '', 0, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 3, 'Amonestaciones', '/amonestaciones', '', 0, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 3, 'Vacaciones', '/vacaciones', '', 0, 5);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 3, 'Ausencias', '/ausencias', '', 0, 6);

-- Informes
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Informes', '', 'Folder', 1, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 10, 'Lista de Solicitudes', '/informes/solicitudes', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 10, 'Lista de Empleados', '/informes/empleados', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 10, 'Lista de Acciones', '/informes/acciones', '', 0, 3);

-- Informacion Complementaria
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Información Complementaria', '', 'Database', 1, 5);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 14, 'Parentesco', '/info/parentesco', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 14, 'Nivel Académico', '/info/nivel-academico', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 14, 'Idiomas', '/info/idiomas', '', 0, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 14, 'Nivel de Traducción', '/info/nivel-traduccion', '', 0, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 14, 'Actividades', '/info/actividades', '', 0, 5);

-- Configuracion
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Configuración', '', 'Settings', 1, 6);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 20, 'Direcciones', '/configuracion/direcciones', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 20, 'Cargos', '/configuracion/cargos', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 20, 'Tipos de Acciones', '/configuracion/tipos-acciones', '', 0, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 20, 'Cedes', '/configuracion/cedes', '', 0, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 20, 'Grupo Ocupacional', '/configuracion/grupo-ocupacional', '', 0, 5);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 20, 'Parámetros', '/configuracion/parametros', '', 0, 6);

-- ==========================================
-- MÓDULO 2: NÓMINA
-- ==========================================
-- Empleados (fuera de carpeta)
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, NULL, 'Empleados', '/nomina/empleados', 'Users', 0, 1);

-- Carpeta Transacciones
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, NULL, 'Transacciones', '', 'Folder', 1, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 28, 'Abrir Nómina', '/nomina/transacciones/abrir', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 28, 'Subir Nómina desde Excel', '/nomina/transacciones/subir-excel', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 28, 'Aplicar Descuentos externos', '/nomina/transacciones/descuentos', '', 0, 3);

-- Carpeta Calculo
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, NULL, 'Cálculo', '', 'Folder', 1, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 32, 'Cálculo de bonificaciones', '/nomina/calculo/bonificaciones', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 32, 'Cálculo de Vacaciones', '/nomina/calculo/vacaciones', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 32, 'Cálculo de Regalía Pascual', '/nomina/calculo/regalia', '', 0, 3);

-- Carpeta Proceso
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, NULL, 'Proceso', '', 'Folder', 1, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 36, 'Generar Nómina', '/nomina/proceso/generar', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 36, 'Cerrar Nómina', '/nomina/proceso/cerrar', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 36, 'Generar Archivo de Banco', '/nomina/proceso/archivo-banco', '', 0, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 36, 'Generar Entrada de Diario', '/nomina/proceso/entrada-diario', '', 0, 4);

-- Carpeta Informes
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, NULL, 'Informes', '', 'Folder', 1, 5);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 41, 'Nómina Detallada', '/nomina/informes/detallada', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 41, 'Resumen de Nómina', '/nomina/informes/resumen', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 41, 'Transacciones de Nómina', '/nomina/informes/transacciones', '', 0, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 41, 'Volantes de Pago', '/nomina/informes/volantes', '', 0, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 41, 'Generar Reporte de Tesorería', '/nomina/informes/tesoreria', '', 0, 5);

-- Carpeta Configuracion
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, NULL, 'Configuración', '', 'Folder', 1, 6);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'Tipos de Transacciones', '/nomina/configuracion/tipos-transacciones', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'Tipos de Nómina', '/nomina/configuracion/tipos-nomina', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'Contabilización de Nóminas', '/nomina/configuracion/contabilizacion', '', 0, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'Cargos', '/nomina/configuracion/cargos', '', 0, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'ISR', '/nomina/configuracion/isr', '', 0, 5);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'Ley 87-01', '/nomina/configuracion/ley8701', '', 0, 6);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'Periodos de Nómina', '/nomina/configuracion/periodos', '', 0, 7);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'Parámetros de Bonificación', '/nomina/configuracion/parametros-bonificacion', '', 0, 8);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (2, 47, 'Parámetros', '/nomina/configuracion/parametros', '', 0, 9);

-- ==========================================
-- MÓDULO 3: ADMINISTRACIÓN DEL SISTEMA
-- ==========================================
-- Carpeta Empresa
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, NULL, 'Empresa', '', 'Folder', 1, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 57, 'Seleccionar Empresa', '/administracion/empresa/seleccionar', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 57, 'Empresas', '/administracion/empresa/empresas', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 57, 'Información de la Empresa', '/administracion/empresa/informacion', '', 0, 3);

-- Carpeta Gestion de Usuarios
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, NULL, 'Gestión de Usuarios', '', 'Folder', 1, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 61, 'Usuarios', '/administracion/usuarios', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 61, 'Perfiles de Usuarios', '/administracion/perfiles', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 61, 'Permisos de Usuarios', '/administracion/permisos', '', 0, 3);

-- Carpeta General
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, NULL, 'General', '', 'Folder', 1, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Catálogo de Cuentas', '/administracion/general/catalogo', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Secuencia Numericas', '/administracion/general/secuencias', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Monedas', '/administracion/general/monedas', '', 0, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Periodos Contable', '/administracion/general/periodos-contable', '', 0, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Parametros Generales', '/administracion/general/parametros', '', 0, 5);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Impuestos', '/administracion/general/impuestos', '', 0, 6);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Continentes', '/administracion/general/continentes', '', 0, 7);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Paises', '/administracion/general/paises', '', 0, 8);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Ciudades', '/administracion/general/ciudades', '', 0, 9);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Municipios', '/administracion/general/municipios', '', 0, 10);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Departamentos Contables', '/administracion/general/dept-contables', '', 0, 11);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Centros de Costos Contables', '/administracion/general/costos-contables', '', 0, 12);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Proposito Contable', '/administracion/general/proposito-contable', '', 0, 13);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Unidades de Medidas', '/administracion/general/unidades-medidas', '', 0, 14);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (3, 65, 'Conversion de Unidades de Medidas', '/administracion/general/conversion-medidas', '', 0, 15);


-- Dar permiso al perfil Admin a la opcion 1,2,3,4
INSERT INTO Permisos_Perfiles (PerfilID, OpcionID, PuedeConsultar, PuedeInsertar, PuedeModificar, PuedeEliminar) VALUES 
(1, 1, 1, 1, 1, 1),
(1, 2, 1, 1, 1, 1),
(1, 3, 1, 1, 1, 1),
(1, 4, 1, 1, 1, 1);

-- Secuencias Numéricas Centralizadas
CREATE TABLE SecuenciasNum (
    SecuenciaNumID INT IDENTITY(1,1) PRIMARY KEY,
    SecID NVARCHAR(20) NOT NULL,
    EmpresaID INT NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL,
    IniciaEn INT NOT NULL DEFAULT 1,
    FinalizaEn INT NOT NULL DEFAULT 999999999,
    NumeroMaximo INT NOT NULL DEFAULT 999999999,
    Siguiente INT NOT NULL DEFAULT 1,
    Plantilla NVARCHAR(50) NOT NULL DEFAULT '',
    NCF BIT NOT NULL DEFAULT 0,
    CeroIzq BIT NOT NULL DEFAULT 0,
    FechaValido DATETIME NULL,
    
    CreadoPor INT NULL,
    FechaCreado DATETIME NOT NULL DEFAULT GETDATE(),
    ModificadoPor INT NULL,
    FechaModificado DATETIME NULL,

    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID),
    UNIQUE (SecID, EmpresaID)
);

-- Periodos Contables
CREATE TABLE MGPeriodos (
    PeriodoID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    CodigoPeriodo INT NOT NULL,
    FecInicioPeriodo DATETIME NOT NULL,
    FecFinPeriodo DATETIME NOT NULL,
    TipoPeriodo NVARCHAR(5) NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT 'Abierto', 
    Comentario NVARCHAR(255) NULL,
    FecConsolidacion DATETIME NULL,
    
    CreadoPor INT NULL,
    FechaCreado DATETIME NOT NULL DEFAULT GETDATE(),
    ModificadoPor INT NULL,
    FechaModificado DATETIME NULL,

    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID),
    UNIQUE (EmpresaID, FecInicioPeriodo)
);

-- =========================================================
-- CONTABILIDAD Y FINANZAS
-- =========================================================

-- Catálogo de Monedas
CREATE TABLE Monedas (
    MonedaID VARCHAR(3) NOT NULL,
    EmpresaID INT NOT NULL,
    Descripcion VARCHAR(30) NOT NULL DEFAULT '',
    MgCuentaPerdida VARCHAR(20) NOT NULL DEFAULT '',
    MgCuentaGanancia VARCHAR(20) NOT NULL DEFAULT '',
    Simbolo VARCHAR(5) NOT NULL DEFAULT '',
    Multiplicador NUMERIC(28, 12) NOT NULL DEFAULT 0,
    
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    PRIMARY KEY (MonedaID, EmpresaID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- Departamentos (Contabilidad)
CREATE TABLE MGDepartamentos (
    DepartamentoID VARCHAR(20) NOT NULL,
    EmpresaID INT NOT NULL,
    DepartDescripcion VARCHAR(60) NOT NULL DEFAULT '',
    
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    PRIMARY KEY (DepartamentoID, EmpresaID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- Centros de Costo
CREATE TABLE MGCentroCostos (
    CentroCostoID VARCHAR(20) NOT NULL,
    EmpresaID INT NOT NULL,
    CCostosDescripcion VARCHAR(60) NOT NULL DEFAULT '',
    
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    PRIMARY KEY (CentroCostoID, EmpresaID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- Propósitos
CREATE TABLE MGPropositos (
    PropositoID VARCHAR(20) NOT NULL,
    EmpresaID INT NOT NULL,
    PropositoDescripcion VARCHAR(60) NOT NULL DEFAULT '',
    
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    PRIMARY KEY (PropositoID, EmpresaID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- Catálogo de Cuentas (MG_CATALOGO)
CREATE TABLE MG_CATALOGO (
    CuentaID VARCHAR(20) NOT NULL,
    EmpresaID INT NOT NULL,
    Descripcion VARCHAR(60) NULL DEFAULT '',
    Origen INT NULL DEFAULT 0,
    TipoCuenta INT NULL DEFAULT 0,
    MGConsolidacion VARCHAR(20) NOT NULL DEFAULT '',
    MGCompensacion VARCHAR(20) NOT NULL DEFAULT '',
    MGApertura VARCHAR(20) NOT NULL DEFAULT '',
    MonedaID VARCHAR(3) NOT NULL DEFAULT '',
    DepartamentoId VARCHAR(20) NOT NULL DEFAULT '',
    DepartamentoValidar INT NOT NULL DEFAULT 0,
    CentroCostoId VARCHAR(20) NOT NULL DEFAULT '',
    CentroCostoValidar INT NOT NULL DEFAULT 0,
    PropositoId VARCHAR(20) NOT NULL DEFAULT '',
    PropositoValidar INT NOT NULL DEFAULT 0,
    TipoRelacFinanc INT NOT NULL DEFAULT 0,
    Retencion BIT NOT NULL DEFAULT 0,
    Bloqueada BIT NOT NULL DEFAULT 0,
    GrupoID VARCHAR(20) NOT NULL DEFAULT '',
    SubGrupoID VARCHAR(20) NOT NULL DEFAULT '',

    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    PRIMARY KEY (CuentaID, EmpresaID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- Unidades de Medida
CREATE TABLE UNIDADESMEDIDA (
    UnidadId VARCHAR(10) NOT NULL,
    EmpresaID INT NOT NULL,
    Descripcion VARCHAR(30) NOT NULL DEFAULT '',
    Decimales INT NOT NULL DEFAULT 0,
    
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    PRIMARY KEY (UnidadId, EmpresaID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- Conversión de Unidades de Medida
CREATE TABLE UNIDADESCONVERSION (
    UnidadIdDesde VARCHAR(10) NOT NULL,
    UnidadIdHasta VARCHAR(10) NOT NULL,
    EmpresaID INT NOT NULL,
    Factor FLOAT NOT NULL DEFAULT 0,
    CantidadSumar FLOAT NOT NULL DEFAULT 0,
    
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    PRIMARY KEY (UnidadIdDesde, UnidadIdHasta, EmpresaID),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- Transacciones (MGTRANS)
CREATE TABLE MGTRANS (
    CuentaID VARCHAR(20) NOT NULL,
    EmpresaID INT NOT NULL,
    Voucher VARCHAR(20) NOT NULL DEFAULT '',
    Linea INT IDENTITY(1,1) NOT NULL,
    BancoID VARCHAR(20) NULL DEFAULT '',
    TransFecha DATETIME NOT NULL DEFAULT '1900-01-01',
    Txt VARCHAR(50) NOT NULL DEFAULT '',
    Monto MONEY NOT NULL DEFAULT 0,
    MonedaID VARCHAR(3) NOT NULL DEFAULT '',
    CodigoPeriodo INT NOT NULL DEFAULT 1,
    TipoTrans INT NOT NULL DEFAULT 0,
    modulo INT NOT NULL DEFAULT 0,
    TipoContabilizacion INT NOT NULL DEFAULT 0,
    CentroCostoId VARCHAR(20) NOT NULL DEFAULT '',
    DepartamentoId VARCHAR(20) NOT NULL DEFAULT '',
    PropositoId VARCHAR(20) NOT NULL DEFAULT '',
    Cantidad NUMERIC(28, 12) NOT NULL DEFAULT 0,
    NumeroDocumento VARCHAR(20) NOT NULL DEFAULT '',
    FechaDocumento DATETIME NOT NULL DEFAULT '1900-01-01',
    
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL,
    PRIMARY KEY (CuentaID, EmpresaID, Voucher, Linea),
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

-- ==============================================================================
-- MODULE: NOMINA / RECURSOS HUMANOS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: Cargos
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[NMCargos](
	[CargoID] [varchar](20) NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[CreadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[ModificadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[RecordId] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK_NMCargos] PRIMARY KEY CLUSTERED 
(
	[CargoID] ASC,
	[EmpresaID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHSolicitud
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHSolicitud](
	[SolicitudID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[FechaSolicitud] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[Empleadoid] [varchar](20) NOT NULL DEFAULT (''),
	[Cedula] [varchar](20) NOT NULL DEFAULT (''),
	[Tratamiento] [varchar](20) NOT NULL DEFAULT (''),
	[TituloAcademicoID] [tinyint] NOT NULL DEFAULT ((0)),
	[Nombre] [varchar](100) NOT NULL DEFAULT (''),
	[Nombre1] [varchar](50) NOT NULL DEFAULT (''),
	[Nombre2] [varchar](50) NOT NULL DEFAULT (''),
	[Apellido1] [varchar](50) NOT NULL DEFAULT (''),
	[Apellido2] [varchar](50) NOT NULL DEFAULT (''),
	[Alias] [varchar](20) NOT NULL DEFAULT (''),
	[TipoID] [varchar](20) NOT NULL DEFAULT (''),
	[Apodo] [varchar](25) NOT NULL DEFAULT (''),
	[Telefono] [varchar](20) NOT NULL DEFAULT (''),
	[Celular] [varchar](20) NOT NULL DEFAULT (''),
	[Beeper] [varchar](10) NOT NULL DEFAULT (''),
	[Email] [varchar](30) NOT NULL DEFAULT (''),
	[EstadoCivil] [int] NOT NULL DEFAULT ((0)),
	[TipoSangreID] [tinyint] NOT NULL DEFAULT ((0)),
	[LicenciaConducir] [varchar](11) NOT NULL DEFAULT (''),
	[Pasaporte] [varchar](15) NOT NULL DEFAULT (''),
	[CodigoPostal] [varchar](10) NOT NULL DEFAULT (''),
	[Telefono1] [varchar](20) NOT NULL DEFAULT (''),
	[Telefono2] [varchar](20) NOT NULL DEFAULT (''),
	[TelefonoExtensionEmp] [varchar](10) NOT NULL DEFAULT (''),
	[Beeper1] [varchar](20) NOT NULL DEFAULT (''),
	[Fax] [varchar](20) NOT NULL DEFAULT (''),
	[URL] [varchar](255) NOT NULL DEFAULT (''),
	[TipoSangre] [int] NOT NULL DEFAULT ((0)),
	[Sexo] [int] NOT NULL DEFAULT ((0)),
	[FechaDisponible] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[FechaNacimiento] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[MunicipioIDNacieminto] [varchar](20) NOT NULL DEFAULT (''),
	[ProvinciaIDNacimiento] [varchar](20) NOT NULL DEFAULT (''),
	[PaisIDNacimiento] [varchar](20) NOT NULL DEFAULT (''),
	[MunicipioID] [varchar](20) NOT NULL DEFAULT (''),
	[ProvinciaID] [varchar](20) NOT NULL DEFAULT (''),
	[PaisID] [varchar](20) NOT NULL DEFAULT (''),
	[CargoID] [varchar](20) NOT NULL DEFAULT (''),
	[Sueldo] [decimal](18, 0) NOT NULL DEFAULT ((0)),
	[Prioridad] [bit] NOT NULL DEFAULT ((0)),
	[Traslado] [bit] NOT NULL DEFAULT ((0)),
	[Nombrado] [bit] NOT NULL DEFAULT ((0)),
	[Viajar] [bit] NOT NULL DEFAULT ((0)),
	[Direccion] [varchar](80) NOT NULL DEFAULT (''),
	[Referencia] [varchar](50) NOT NULL DEFAULT (''),
	[Sector] [varchar](50) NOT NULL DEFAULT (''),
	[DepartamentoId] [varchar](20) NOT NULL DEFAULT (''),
	[DependenciaID] [varchar](20) NOT NULL DEFAULT (''),
	[SeccionID] [varchar](20) NOT NULL DEFAULT (''),
	[DivisionID] [varchar](20) NOT NULL DEFAULT (''),
	[CentroCostoId] [varchar](20) NOT NULL DEFAULT (''),
	[PropositoId] [varchar](20) NOT NULL DEFAULT (''),
	[PerfilInternacional] [bit] NOT NULL DEFAULT ((0)),

-- ==============================================================================
-- MODULE: NOMINA / RECURSOS HUMANOS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Table: Cargos
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[NMCargos](
	[CargoID] [varchar](20) NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[CreadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[ModificadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[RecordId] [int] IDENTITY(1,1) NOT NULL,
 CONSTRAINT [PK_NMCargos] PRIMARY KEY CLUSTERED 
(
	[CargoID] ASC,
	[EmpresaID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHSolicitud
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHSolicitud](
	[SolicitudID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[FechaSolicitud] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[Empleadoid] [varchar](20) NOT NULL DEFAULT (''),
	[Cedula] [varchar](20) NOT NULL DEFAULT (''),
	[Tratamiento] [varchar](20) NOT NULL DEFAULT (''),
	[TituloAcademicoID] [tinyint] NOT NULL DEFAULT ((0)),
	[Nombre] [varchar](100) NOT NULL DEFAULT (''),
	[Nombre1] [varchar](50) NOT NULL DEFAULT (''),
	[Nombre2] [varchar](50) NOT NULL DEFAULT (''),
	[Apellido1] [varchar](50) NOT NULL DEFAULT (''),
	[Apellido2] [varchar](50) NOT NULL DEFAULT (''),
	[Alias] [varchar](20) NOT NULL DEFAULT (''),
	[TipoID] [varchar](20) NOT NULL DEFAULT (''),
	[Apodo] [varchar](25) NOT NULL DEFAULT (''),
	[Telefono] [varchar](20) NOT NULL DEFAULT (''),
	[Celular] [varchar](20) NOT NULL DEFAULT (''),
	[Beeper] [varchar](10) NOT NULL DEFAULT (''),
	[Email] [varchar](30) NOT NULL DEFAULT (''),
	[EstadoCivil] [int] NOT NULL DEFAULT ((0)),
	[TipoSangreID] [tinyint] NOT NULL DEFAULT ((0)),
	[LicenciaConducir] [varchar](11) NOT NULL DEFAULT (''),
	[Pasaporte] [varchar](15) NOT NULL DEFAULT (''),
	[CodigoPostal] [varchar](10) NOT NULL DEFAULT (''),
	[Telefono1] [varchar](20) NOT NULL DEFAULT (''),
	[Telefono2] [varchar](20) NOT NULL DEFAULT (''),
	[TelefonoExtensionEmp] [varchar](10) NOT NULL DEFAULT (''),
	[Beeper1] [varchar](20) NOT NULL DEFAULT (''),
	[Fax] [varchar](20) NOT NULL DEFAULT (''),
	[URL] [varchar](255) NOT NULL DEFAULT (''),
	[TipoSangre] [int] NOT NULL DEFAULT ((0)),
	[Sexo] [int] NOT NULL DEFAULT ((0)),
	[FechaDisponible] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[FechaNacimiento] [datetime] NOT NULL DEFAULT ('1900-01-01 00:00:00.000'),
	[MunicipioIDNacieminto] [varchar](20) NOT NULL DEFAULT (''),
	[ProvinciaIDNacimiento] [varchar](20) NOT NULL DEFAULT (''),
	[PaisIDNacimiento] [varchar](20) NOT NULL DEFAULT (''),
	[MunicipioID] [varchar](20) NOT NULL DEFAULT (''),
	[ProvinciaID] [varchar](20) NOT NULL DEFAULT (''),
	[PaisID] [varchar](20) NOT NULL DEFAULT (''),
	[CargoID] [varchar](20) NOT NULL DEFAULT (''),
	[Sueldo] [decimal](18, 0) NOT NULL DEFAULT ((0)),
	[Prioridad] [bit] NOT NULL DEFAULT ((0)),
	[Traslado] [bit] NOT NULL DEFAULT ((0)),
	[Nombrado] [bit] NOT NULL DEFAULT ((0)),
	[Viajar] [bit] NOT NULL DEFAULT ((0)),
	[Direccion] [varchar](80) NOT NULL DEFAULT (''),
	[Referencia] [varchar](50) NOT NULL DEFAULT (''),
	[Sector] [varchar](50) NOT NULL DEFAULT (''),
	[DepartamentoId] [varchar](20) NOT NULL DEFAULT (''),
	[DependenciaID] [varchar](20) NOT NULL DEFAULT (''),
	[SeccionID] [varchar](20) NOT NULL DEFAULT (''),
	[DivisionID] [varchar](20) NOT NULL DEFAULT (''),
	[CentroCostoId] [varchar](20) NOT NULL DEFAULT (''),
	[PropositoId] [varchar](20) NOT NULL DEFAULT (''),
	[PerfilInternacional] [bit] NOT NULL DEFAULT ((0)),
	[CreadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[ModificadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[RecordID] [int] NOT NULL DEFAULT ((0)),
 CONSTRAINT [PK_RHSolicitud] PRIMARY KEY CLUSTERED 
(
	[SolicitudID] ASC,
	[EmpresaID] ASC
),
 CONSTRAINT [UQ_RHSolicitud_Cedula] UNIQUE 
(
    [Cedula] ASC,
    [EmpresaID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHDependienteSolicitante
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHDependienteSolicitante](
	[DependienteSolicitanteID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[NombreDependiente] [varchar](70) NOT NULL,
	[Cedula] [varchar](13) NOT NULL DEFAULT (''),
	[ParentescoID] [int] NOT NULL,
	[Sexo] [int] NOT NULL DEFAULT (0),
	[FechaNacimiento] [datetime] NOT NULL,
	[AplicaSeguroMedico] [bit] NOT NULL DEFAULT (0),
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_DependienteSolicitante] PRIMARY KEY CLUSTERED 
(
	[DependienteSolicitanteID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHEducacionSolicitante
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHEducacionSolicitante](
	[EducacionSolicitanteID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[NivelAcademicoID] [int] NOT NULL,
	[AnoTitulacion] [int] NOT NULL,
	[TituloAcademicoID] [int] NOT NULL,
	[InstitucionAcademica] [varchar](500) NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_EducacionSolicitante] PRIMARY KEY CLUSTERED 
(
	[EducacionSolicitanteID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHIdiomaSolicitante
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHIdiomaSolicitante](
	[IdiomaSolicitanteID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[IdiomaID] [int] NOT NULL,
	[HablaBien] [bit] NOT NULL DEFAULT (0),
	[HablaRegular] [bit] NOT NULL DEFAULT (0),
	[LeeBien] [bit] NOT NULL DEFAULT (0),
	[LeeRegular] [bit] NOT NULL DEFAULT (0),
	[EscribeBien] [bit] NOT NULL DEFAULT (0),
	[EscribeRegular] [bit] NOT NULL DEFAULT (0),
	[TraduceBien] [bit] NOT NULL DEFAULT (0),
	[TraduceRegular] [bit] NOT NULL DEFAULT (0),
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_IdiomaSolicitante] PRIMARY KEY CLUSTERED 
(
	[IdiomaSolicitanteID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHExperienciaLaboralSolicitante
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHExperienciaLaboralSolicitante](
	[ExperienciaLaboralSolicitudID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[InstitucionLabor] [varchar](70) NOT NULL,
	[Direccion] [varchar](70) NOT NULL DEFAULT (''),
	[Telefono] [varchar](20) NOT NULL DEFAULT (''),
	[UltimoSueldo] [decimal](18, 2) NOT NULL DEFAULT (0),
	[FechaInicial] [datetime] NOT NULL,
	[FechaFinal] [datetime] NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_ExperienciaLaboralSolicitante] PRIMARY KEY CLUSTERED 
(
	[ExperienciaLaboralSolicitudID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHReferenciaSolicitud
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHReferenciaSolicitud](
	[ReferenciaID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[Nombre] [varchar](70) NOT NULL,
	[Direccion] [varchar](70) NOT NULL DEFAULT (''),
	[Telefono] [varchar](20) NOT NULL DEFAULT (''),
	[Anios] [int] NOT NULL DEFAULT (0),
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_ReferenciaPersonalSolicitud] PRIMARY KEY CLUSTERED 
(
	[ReferenciaID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHOtros
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHOtros](
	[OtrosID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[ActividadID] [int] NOT NULL,
	[Descripcion] [varchar](100) NOT NULL DEFAULT (''),
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_RHOtros] PRIMARY KEY CLUSTERED 
(
	[OtrosID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHSolicitudDocumentos
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHSolicitudDocumentos](
	[DocumentoID] [int] IDENTITY(1,1) NOT NULL,
	[SolicitudID] [int] NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[NombreArchivo] [varchar](255) NOT NULL,
	[RutaArchivo] [varchar](MAX) NOT NULL,
	[FechaSubida] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_RHSolicitudDocumentos] PRIMARY KEY CLUSTERED 
(
	[DocumentoID] ASC
)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHGrupoOcupacional
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHGrupoOcupacional](
	[GrupoOcupacionalID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[Descripcion] [varchar](100) NOT NULL,
	[Grupo] [varchar](20) NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_GrupoOcupacional] PRIMARY KEY CLUSTERED ([GrupoOcupacionalID] ASC)
) ON [PRIMARY]
GO

-- ------------------------------------------------------------------------------
-- Table: RHPARAMETROS
-- ------------------------------------------------------------------------------
CREATE TABLE [dbo].[RHPARAMETROS](
	[EmpresaID] [varchar](3) NOT NULL,
	[Firma1] [varchar](100) NOT NULL DEFAULT (''),
	[CargoIDFirma1] [varchar](20) NOT NULL DEFAULT (''),
	[Firma2] [varchar](100) NOT NULL DEFAULT (''),
	[CargoIDFirma2] [varchar](20) NOT NULL DEFAULT (''),
	[Firma3] [varchar](100) NOT NULL DEFAULT (''),
	[CargoIDFirma3] [varchar](20) NOT NULL DEFAULT (''),
	[CreadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[ModificadoPor] [varchar](15) NOT NULL DEFAULT (''),
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_RHPARAMETROS] PRIMARY KEY CLUSTERED ([EmpresaID] ASC)
) ON [PRIMARY]
GO
CREATE TABLE [dbo].[NMEMPLEADOS](
	[EmpleadoID] [varchar](20) NOT NULL,
	[EmpresaId] [int] NOT NULL,
	[Nombres] [varchar](100) NULL,
	[Nombre1] [varchar](50) NULL,
	[Nombre2] [varchar](50) NULL,
	[Apellido1] [varchar](50) NULL,
	[Apellido2] [varchar](50) NULL,
	[HorasExtra] [bit] NOT NULL DEFAULT 0,
	[diasvacfisica] [float] NOT NULL DEFAULT 0,
	[Direccion] [varchar](250) NULL,
	[CodigoPostal] [varchar](20) NULL,
	[Telefono1] [varchar](20) NULL,
	[Telefono2] [varchar](20) NULL,
	[Celular] [varchar](20) NULL,
	[Email] [varchar](80) NULL,
	[URL] [varchar](255) NULL,
	[CiudadID] [varchar](10) NULL,
	[Cedula] [varchar](20) NULL,
	[EstadoCivil] [int] NOT NULL DEFAULT 1,
	[Sexo] [int] NOT NULL DEFAULT 1,
	[Estatus] [int] NOT NULL DEFAULT 1,
	[FormaPago] [int] NOT NULL DEFAULT 1,
	[CargoId] [varchar](20) NULL,
	[ISR] [bit] NOT NULL DEFAULT 0,
	[IDSS] [bit] NOT NULL DEFAULT 0,
	[AFP] [bit] NOT NULL DEFAULT 0,
	[ARS] [bit] NOT NULL DEFAULT 0,
	[CuentaBanco] [varchar](20) NULL,
	[FechaNacimiento] [datetime] NULL,
	[MonedaID] [varchar](3) NULL,
	[DireccionID] [varchar](20) NULL,
	[DependenciaID] [varchar](20) NULL,
	[TipoNominaID] [varchar](20) NULL,
	[PaisID] [varchar](20) NULL,
	[ProvinciaID] [varchar](20) NULL,
	[MunicipioID] [varchar](20) NULL,
	[TurnoId] [int] NULL,
	[MinisterioPublico] [bit] NOT NULL DEFAULT 0,
	[Poncha] [bit] NOT NULL DEFAULT 0,
	[Nomina] [bit] NOT NULL DEFAULT 0,
	[Incorporado] [bit] NOT NULL DEFAULT 0,
	[EmpleadoPlanta] [bit] NOT NULL DEFAULT 0,
	[TipoSangre] [int] NULL,
	[PaisIDNacimiento] [varchar](20) NULL,
	[ProvinciaIDNacimiento] [varchar](20) NULL,
	[MunicipioIDNacimiento] [varchar](20) NULL,
	[Sector] [varchar](30) NULL,
	[Referencia] [varchar](50) NULL,
	[FechaNombramiento] [datetime] NULL,
	[FechaIngreso] [datetime] NULL,
	[FechaSalida] [datetime] NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
	[FechaModificado] [datetime] NULL,
	[RecordID] [int] IDENTITY(1,1) NOT NULL,
	[ISRGlobal] [bit] NOT NULL DEFAULT 0,
	[FechaResolucion] [datetime] NULL,
	[Resolucion] [varchar](100) NULL,
	[EnCarrera] [bit] NOT NULL DEFAULT 0,
 CONSTRAINT [PK_NMEMPLEADOS] PRIMARY KEY NONCLUSTERED 
(
	[EmpleadoID] ASC,
	[EmpresaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[RHpercep](
	[DevengoID] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaID] [int] NOT NULL,
	[EmpleadoID] [varchar](20) NOT NULL,
	[FechaInicio] [datetime] NOT NULL,
	[FechaFin] [datetime] NULL,
	[SueldoActivo] [bit] NOT NULL DEFAULT 1,
	[Valor] [decimal](12, 2) NOT NULL,
	[NombreDevengo] [varchar](50) NOT NULL,
	[CreadoPor] [int] NULL,
	[ModificadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT GETDATE(),
	[FechaModificado] [datetime] NULL,
 CONSTRAINT [PK_RHpercep] PRIMARY KEY CLUSTERED 
(
	[DevengoID] ASC,
	[EmpresaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[NMACTUALIZABANCO](
	[Actualizabancoid] [int] IDENTITY(1,1) NOT NULL,
	[EmpresaId] [varchar](3) NOT NULL,
	[Empleadoid] [varchar](20) NULL,
	[Nombre] [varchar](80) NULL,
	[CuentaBancoAnterior] [varchar](20) NULL,
	[CuentaBanco] [varchar](20) NULL,
	[Fecha] [datetime] NULL,
	[Estatus] [bit] NULL DEFAULT 0,
	[CreadoPor] [varchar](15) NULL,
	[ModificadoPor] [varchar](15) NULL,
	[FechaCreado] [datetime] NULL,
	[FechaModificado] [datetime] NULL,
	[RecordID] [int] NULL,
 CONSTRAINT [PK_NMACTUALIZABANCO] PRIMARY KEY CLUSTERED 
(
	[Actualizabancoid] ASC,
	[EmpresaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

