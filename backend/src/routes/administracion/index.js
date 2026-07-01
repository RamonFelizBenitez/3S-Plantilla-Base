const express = require('express');
const router = express.Router();

router.use('/afpars', require('./afparsRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/catalogo', require('./catalogoRoutes'));
router.use('/conversionUnidades', require('./conversionUnidadesRoutes'));
router.use('/direccion', require('./direccionRoutes'));
router.use('/empresa', require('./empresaRoutes'));
router.use('/geografia', require('./geografiaRoutes'));
router.use('/isr', require('./isrRoutes'));
router.use('/moneda', require('./monedaRoutes'));
router.use('/parametros', require('./parametrosRoutes'));
router.use('/perfil', require('./perfilRoutes'));
router.use('/periodo', require('./periodoRoutes'));
router.use('/permiso', require('./permisoRoutes'));
router.use('/proposito', require('./propositoRoutes'));
router.use('/secuencia', require('./secuenciaRoutes'));
router.use('/tipoAccion', require('./tipoAccionRoutes'));
router.use('/unidadMedida', require('./unidadMedidaRoutes'));
router.use('/usuario', require('./usuarioRoutes'));

module.exports = router;

