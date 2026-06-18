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
-- Modulo RRHH (ID=1)
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Solicitudes', '/solicitudes', 'FileText', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Personal', '/personal', 'Users', 0, 2);
-- Carpeta Acciones
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Acciones', '', 'RefreshCw', 1, 3);
-- Sub-opcion
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, 3, 'Designación', '/designacion', '', 0, 1);

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
