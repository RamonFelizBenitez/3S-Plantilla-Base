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
