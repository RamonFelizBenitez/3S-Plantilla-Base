-- Crear base de datos (Ejecutar manualmente si no existe)
-- CREATE DATABASE RHDBW;
-- GO
-- USE RHDBW;
-- GO

-- Catálogo de Empresas
CREATE TABLE Empresas (
    EmpresaID INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(150) NOT NULL,
    RNC NVARCHAR(20) NULL,
    Direccion NVARCHAR(255) NULL,
    Activa BIT NOT NULL DEFAULT 1
);

-- Usuarios (Multi-tenant)
CREATE TABLE Usuarios (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NULL, -- NULL indica que es un usuario global
    NombreUsuario NVARCHAR(50) NOT NULL UNIQUE,
    NombreCompleto NVARCHAR(150) NOT NULL,
    Correo NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    EsGlobal BIT NOT NULL DEFAULT 0, -- 1 si es administrador global
    Activo BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (EmpresaID) REFERENCES Empresas(EmpresaID)
);

CREATE TABLE Perfiles (
    PerfilID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NULL, -- NULL si es un perfil global
    Descripcion NVARCHAR(100) NOT NULL,
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
    Activo BIT NOT NULL DEFAULT 1
);

-- Catálogo de Opciones / Carpetas dentro de un Módulo
CREATE TABLE Opciones (
    OpcionID INT IDENTITY(1,1) PRIMARY KEY,
    ModuloID INT NOT NULL,
    CarpetaPadreID INT NULL, -- Si es nulo, es una opción en la raíz del módulo
    Nombre NVARCHAR(100) NOT NULL,
    Ruta NVARCHAR(255) NULL, -- Ej: /nomina/empleados
    Icono NVARCHAR(50) NULL,
    EsCarpeta BIT NOT NULL DEFAULT 0,
    Orden INT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1,
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
    PermisoUsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    OpcionID INT NOT NULL,
    PuedeConsultar BIT NOT NULL DEFAULT 0,
    PuedeInsertar BIT NOT NULL DEFAULT 0,
    PuedeModificar BIT NOT NULL DEFAULT 0,
    PuedeEliminar BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID),
    FOREIGN KEY (OpcionID) REFERENCES Opciones(OpcionID)
);

-- Insertar datos semilla básicos
INSERT INTO Empresas (Nombre, RNC, Activa) VALUES ('Empresa Principal', '130000001', 1);

-- Usuario Global (No asociado a una empresa específica)
INSERT INTO Usuarios (EmpresaID, NombreUsuario, NombreCompleto, Correo, PasswordHash, EsGlobal, Activo)
VALUES (NULL, 'admin', 'Administrador Global', 'admin@rhdbw.com', '$2b$10$t/sK8.4V.5ZzB6J5B3C8M.eH/2/G.K.3.rC5H8J8Z.C8J.M.1.e', 1, 1);

-- Usuario de Empresa Específica
INSERT INTO Usuarios (EmpresaID, NombreUsuario, NombreCompleto, Correo, PasswordHash, EsGlobal, Activo)
VALUES (1, 'rrhh1', 'Usuario RRHH Empresa Principal', 'rrhh1@empresa.com', '$2b$10$t/sK8.4V.5ZzB6J5B3C8M.eH/2/G.K.3.rC5H8J8Z.C8J.M.1.e', 0, 1);

INSERT INTO Perfiles (EmpresaID, Descripcion) VALUES (NULL, 'Administrador Global');
INSERT INTO Usuarios_Perfiles (UsuarioID, PerfilID) VALUES (1, 1);

-- Ejemplos de Modulos
INSERT INTO Modulos (Nombre, Icono, Orden) VALUES ('Recursos Humanos', 'Users', 1);
INSERT INTO Modulos (Nombre, Icono, Orden) VALUES ('Nómina', 'DollarSign', 2);
INSERT INTO Modulos (Nombre, Icono, Orden) VALUES ('Seguridad', 'Shield', 3);

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
