const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');

router.get('/', empleadoController.getEmpleados);
router.get('/:id/salario', empleadoController.getSalarioMensual);
router.get('/:id/acciones', empleadoController.getAcciones);

module.exports = router;
