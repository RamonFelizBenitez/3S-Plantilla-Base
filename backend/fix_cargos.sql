
IF OBJECT_ID('dbo.Cargos', 'U') IS NOT NULL
  DROP TABLE dbo.Cargos;
GO

IF OBJECT_ID('dbo.NMCargos', 'U') IS NULL
BEGIN
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
END
GO
