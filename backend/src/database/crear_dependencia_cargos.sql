-- Script para crear la tabla intermedia NMDEPENDENCIASCARGOS
-- Permite asignar los cargos permitidos a cada dependencia

CREATE TABLE [dbo].[NMDEPENDENCIASCARGOS](
	[DependenciaCargoID] [int] IDENTITY(1,1) NOT NULL,
	[DependenciaID] [varchar](20) NOT NULL,
	[CargoID] [varchar](20) NOT NULL,
	[EmpresaID] [varchar](3) NOT NULL,
	[CreadoPor] [int] NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT (GETDATE()),
 CONSTRAINT [PK_NMDEPENDENCIASCARGOS] PRIMARY KEY CLUSTERED ([DependenciaCargoID] ASC),
 CONSTRAINT [FK_DEP_CARGO_DEP] FOREIGN KEY ([DependenciaID]) REFERENCES [NMDEPENDENCIAS]([DependenciaID]),
 CONSTRAINT [FK_DEP_CARGO_CARGO] FOREIGN KEY ([CargoID], [EmpresaID]) REFERENCES [NMCARGOS]([CargoID], [EmpresaID])
) ON [PRIMARY]
GO

-- Añadir índice único para que no se asigne el mismo cargo a la misma dependencia dos veces
CREATE UNIQUE NONCLUSTERED INDEX [UIX_NMDEPENDENCIASCARGOS_Unique] ON [dbo].[NMDEPENDENCIASCARGOS]
(
	[DependenciaID] ASC,
	[CargoID] ASC,
	[EmpresaID] ASC
)
GO
