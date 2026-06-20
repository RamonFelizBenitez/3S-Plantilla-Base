-- ==============================================================================
-- EJECUTAR ESTE SCRIPT PARA CREAR LOS NUEVOS CATÁLOGOS SIN BORRAR DATOS
-- ==============================================================================
USE RHDBW;
GO

-- 1. TABLAS DE INFORMACIÓN COMPLEMENTARIA
CREATE TABLE RHParentescos (
    ParentescoID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

CREATE TABLE RHNivelesAcademicos (
    NivelAcademicoID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

CREATE TABLE RHTitulosAcademicos (
    TituloAcademicoID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

CREATE TABLE RHIdiomas (
    IdiomaID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

CREATE TABLE RHNivelesTraduccion (
    NivelTraduccionID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

CREATE TABLE RHActividades (
    ActividadID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    Descripcion NVARCHAR(100) NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    CreadoPor INT NULL, FechaCreado DATETIME NOT NULL DEFAULT GETDATE(), ModificadoPor INT NULL, FechaModificado DATETIME NULL
);

-- 2. INSERTAR OPCIONES EN EL MENÚ
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, NULL, 'Información Complementaria', '', 'Database', 1, 1);
-- Obtener el ID de la carpeta recién insertada
DECLARE @CarpetaID INT = SCOPE_IDENTITY();

INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, @CarpetaID, 'Parentesco', '/recursos-humanos/info/parentescos', '', 0, 1);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, @CarpetaID, 'Nivel Académico', '/recursos-humanos/info/niveles-academicos', '', 0, 2);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, @CarpetaID, 'Título Académico', '/recursos-humanos/info/titulos-academicos', '', 0, 3);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, @CarpetaID, 'Idiomas', '/recursos-humanos/info/idiomas', '', 0, 4);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, @CarpetaID, 'Niveles de Traducción', '/recursos-humanos/info/traducciones', '', 0, 5);
INSERT INTO Opciones (ModuloID, CarpetaPadreID, Nombre, Ruta, Icono, EsCarpeta, Orden) VALUES (1, @CarpetaID, 'Actividades', '/recursos-humanos/info/actividades', '', 0, 6);

-- 3. ACTUALIZAR EL ORDEN DE LOS DEMÁS (Opcional, pero para mantener la consistencia)
UPDATE Opciones SET Orden = 2 WHERE Nombre = 'Solicitudes' AND ModuloID = 1;
UPDATE Opciones SET Orden = 3 WHERE Nombre = 'Personal' AND ModuloID = 1;
UPDATE Opciones SET Orden = 4 WHERE Nombre = 'Acciones' AND ModuloID = 1 AND EsCarpeta = 1;

GO
