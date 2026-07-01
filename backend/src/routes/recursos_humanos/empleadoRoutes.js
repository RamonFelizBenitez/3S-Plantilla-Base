const express = require('express');
const router = express.Router();
const empleadoController = require('../../controllers/recursos_humanos/empleadoController');

router.get('/', empleadoController.getEmpleados);
router.get('/:id/salario', empleadoController.getSalarioMensual);
router.get('/:id/acciones', empleadoController.getAcciones);
router.get('/:id/pagos', empleadoController.getPagosEmpleado);
router.get('/:id/pagos/detalle', empleadoController.getPagosEmpleadoDetalle);
router.put('/:id/datos-nomina', empleadoController.updateDatosEmpleado);

module.exports = router;
