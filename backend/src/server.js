const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const permisoRoutes = require('./routes/permisoRoutes');
const geografiaRoutes = require('./routes/geografiaRoutes');
const secuenciaRoutes = require('./routes/secuenciaRoutes');
const periodoRoutes = require('./routes/periodoRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const monedaRoutes = require('./routes/monedaRoutes');
const departamentoRoutes = require('./routes/departamentoRoutes');
const centroCostoRoutes = require('./routes/centroCostoRoutes');
const propositoRoutes = require('./routes/propositoRoutes');
const unidadMedidaRoutes = require('./routes/unidadMedidaRoutes');
const conversionUnidadesRoutes = require('./routes/conversionUnidadesRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const infoComplementariaRoutes = require('./routes/infoComplementariaRoutes');
const dependienteRoutes = require('./routes/dependienteRoutes');
const educacionRoutes = require('./routes/educacionRoutes');
const idiomaRoutes = require('./routes/idiomaRoutes');
const experienciaRoutes = require('./routes/experienciaRoutes');
const referenciaRoutes = require('./routes/referenciaRoutes');
const otrosRoutes = require('./routes/otrosRoutes');
const grupoOcupacionalRoutes = require('./routes/grupoOcupacionalRoutes');
const cedeRoutes = require('./routes/cedeRoutes');
const tipoAccionRoutes = require('./routes/tipoAccionRoutes');
const turnoRoutes = require('./routes/turnoRoutes');
const direccionRoutes = require('./routes/direccionRoutes');
const dependenciaRoutes = require('./routes/dependenciaRoutes');
const dependenciaCargoRoutes = require('./routes/dependenciaCargoRoutes');
const tipoNominaRoutes = require('./routes/tipoNominaRoutes');
const designacionRoutes = require('./routes/designacionRoutes');
const parametrosRoutes = require('./routes/parametrosRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const empleadoTiempoRoutes = require('./routes/empleadoTiempoRoutes');
const actualizaBancoRoutes = require('./routes/actualizaBancoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/perfiles', perfilRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/geografia', geografiaRoutes);
app.use('/api/secuencias', secuenciaRoutes);
app.use('/api/periodos', periodoRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/monedas', monedaRoutes);
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/centro-costos', centroCostoRoutes);
app.use('/api/propositos', propositoRoutes);
app.use('/api/unidades-medida', unidadMedidaRoutes);
app.use('/api/conversion-unidades', conversionUnidadesRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/info/parentescos', infoComplementariaRoutes.parentescosRouter);
app.use('/api/info/niveles-academicos', infoComplementariaRoutes.nivelesAcademicosRouter);
app.use('/api/info/titulos-academicos', infoComplementariaRoutes.titulosAcademicosRouter);
app.use('/api/info/idiomas', infoComplementariaRoutes.idiomasRouter);
app.use('/api/info/traducciones', infoComplementariaRoutes.traduccionesRouter);
app.use('/api/info/actividades', infoComplementariaRoutes.actividadesRouter);
app.use('/api/dependientes', dependienteRoutes);
app.use('/api/educacion', educacionRoutes);
app.use('/api/idiomas', idiomaRoutes);
app.use('/api/experiencia', experienciaRoutes);
app.use('/api/referencias', referenciaRoutes);
app.use('/api/otros', otrosRoutes);
app.use('/api/configuracion/grupos-ocupacionales', grupoOcupacionalRoutes);
app.use('/api/configuracion/cedes', cedeRoutes);
app.use('/api/configuracion/tipos-acciones', tipoAccionRoutes);
app.use('/api/configuracion/turnos', turnoRoutes);
app.use('/api/configuracion/direcciones', direccionRoutes);
app.use('/api/configuracion/direcciones/:direccionId/dependencias', dependenciaRoutes);
app.use('/api/configuracion/dependencias/:dependenciaId/cargos', dependenciaCargoRoutes);
app.use('/api/configuracion/tipos-nominas', tipoNominaRoutes);
app.use('/api/configuracion/parametros-rrhh', parametrosRoutes);
app.use('/api/designaciones', designacionRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/empleado-tiempo', empleadoTiempoRoutes);
app.use('/api/actualiza-banco', actualizaBancoRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

