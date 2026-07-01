const express = require('express');
const router = express.Router();

router.use('/actualizaBanco', require('./actualizaBancoRoutes'));
router.use('/actualizaSalario', require('./actualizaSalarioRoutes'));
router.use('/cargo', require('./cargoRoutes'));
router.use('/cede', require('./cedeRoutes'));
router.use('/centroCosto', require('./centroCostoRoutes'));
router.use('/departamento', require('./departamentoRoutes'));
router.use('/dependenciaCargo', require('./dependenciaCargoRoutes'));
router.use('/dependencia', require('./dependenciaRoutes'));
router.use('/dependiente', require('./dependienteRoutes'));
router.use('/designacion', require('./designacionRoutes'));
router.use('/educacion', require('./educacionRoutes'));
router.use('/empleadoDependiente', require('./empleadoDependienteRoutes'));
router.use('/empleado', require('./empleadoRoutes'));
router.use('/empleadoTiempo', require('./empleadoTiempoRoutes'));
router.use('/experiencia', require('./experienciaRoutes'));
router.use('/grupoOcupacional', require('./grupoOcupacionalRoutes'));
router.use('/idioma', require('./idiomaRoutes'));
router.use('/infoComplementaria', require('./infoComplementariaRoutes'));
router.use('/otros', require('./otrosRoutes'));
router.use('/referencia', require('./referenciaRoutes'));
router.use('/solicitud', require('./solicitudRoutes'));
router.use('/transaccionesEmpleado', require('./transaccionesEmpleadoRoutes'));
router.use('/turno', require('./turnoRoutes'));
router.use('/cambios', require('./cambiosRoutes'));

module.exports = router;
