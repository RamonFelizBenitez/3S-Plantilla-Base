-- Script para crear la tabla NMTIPOSNOMINAS
-- Ejecutar en la base de datos de Recursos Humanos/Nomina

IF OBJECT_ID('dbo.NMTIPOSNOMINAS', 'U') IS NOT NULL DROP TABLE dbo.NMTIPOSNOMINAS;
GO

CREATE TABLE [dbo].[NMTIPOSNOMINAS](
	[TipoNominaID] [varchar](5) NOT NULL,
	[EmpresaId] [varchar](3) NOT NULL,
	[Descripcion] [varchar](200) NOT NULL,
	[CuentaIDContrapartida] [varchar](20) NOT NULL,
	[SecComprobante] [varchar](20) NOT NULL,
	[TipoPago] [int] NOT NULL,
	[MonedaID] [varchar](3) NOT NULL,
	[MinimoHoras] [int] NOT NULL,
	[MinimoHorasObligatorio] [bit] NOT NULL,
	[PagarSalario] [bit] NOT NULL,
	[PagarHoras] [bit] NOT NULL,
	[CalcularAFP] [bit] NOT NULL,
	[CalcularARS] [bit] NOT NULL,
	[CalcularISR] [bit] NOT NULL,
	[CalcularDependientes] [bit] NOT NULL,
	[PeriodoAFP] [int] NOT NULL,
	[PeriodoARS] [int] NOT NULL,
	[PeriodoISR] [int] NOT NULL,
	[PeriodoDependiente] [int] NOT NULL,
	[HoraEntrada] [datetime] NULL,
	[HoraEntradaaLM] [datetime] NULL,
	[HoraEntradaObligatoria] [bit] NOT NULL,
	[HoraEntradaalmObligatoria] [bit] NOT NULL,
	[PromedioDiasMes] [float] NOT NULL,
	[PromedioHorasMes] [int] NOT NULL,
	[CalcBaseHoraProm] [int] NOT NULL,
	[HorasenDia] [int] NOT NULL,
	[CreadoPor] [varchar](15) NOT NULL,
	[ModificadoPor] [varchar](15) NOT NULL,
	[FechaCreado] [datetime] NOT NULL DEFAULT(GETDATE()),
	[FechaModificado] [datetime] NOT NULL DEFAULT(GETDATE()),
	[RecordId] [int] IDENTITY(1,1) NOT NULL,
	[CtaPresupuesto] [varchar](20) NOT NULL,
	[SecuenciaSG] [varchar](2) NOT NULL,
	[Capitulo] [varchar](4) NOT NULL,
	[SubCapitulo] [varchar](2) NOT NULL,
	[DAD] [varchar](2) NOT NULL,
	[UE] [varchar](4) NOT NULL,
	[Programa] [varchar](2) NOT NULL,
	[SubPrograma] [varchar](2) NOT NULL,
	[Proyecto] [varchar](2) NOT NULL,
	[Region] [varchar](2) NOT NULL,
	[Provincia] [varchar](2) NOT NULL,
	[Municipio] [varchar](4) NOT NULL,
	[Funcion] [varchar](6) NOT NULL,
	[Concepto] [varchar](100) NOT NULL,
 CONSTRAINT [PK_NMTIPOSNOMINAS] PRIMARY KEY NONCLUSTERED 
(
	[TipoNominaID] ASC,
	[EmpresaId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
