const express = require('express');
const router = express.Router();
const empleadoNominaController = require('../../controllers/nomina/empleadoNominaController');

router.get('/:empleadoId', empleadoNominaController.getByEmpleado);
router.post('/', empleadoNominaController.create);
router.put('/:empleadoId/:tipoNominaId', empleadoNominaController.update);
router.delete('/:empleadoId/:tipoNominaId', empleadoNominaController.remove);

module.exports = router;
