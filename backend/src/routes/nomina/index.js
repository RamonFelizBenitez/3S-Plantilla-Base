const express = require('express');
const router = express.Router();

router.use('/abrirNomina', require('./abrirNominaRoutes'));
router.use('/aplicarDescuentos', require('./aplicarDescuentosRoutes'));
router.use('/archivoBanco', require('./archivoBancoRoutes'));
router.use('/cerrarNomina', require('./cerrarNominaRoutes'));
router.use('/empleadoNomina', require('./empleadoNominaRoutes'));
router.use('/generarNomina', require('./generarNominaRoutes'));
router.use('/parametrosNomina', require('./parametrosNominaRoutes'));
router.use('/periodosNominas', require('./periodosNominasRoutes'));
router.use('/subirNominaExcel', require('./subirNominaExcelRoutes'));
router.use('/tipoNomina', require('./tipoNominaRoutes'));
router.use('/tipoTransaccion', require('./tipoTransaccionRoutes'));

module.exports = router;

