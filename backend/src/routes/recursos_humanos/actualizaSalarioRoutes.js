const express = require('express');
const router = express.Router();
const actualizaSalarioController = require('../../controllers/recursos_humanos/actualizaSalarioController');

router.get('/actual/:empleadoId', actualizaSalarioController.getSueldoActual);
router.get('/:empleadoId', actualizaSalarioController.getByEmpleado);
router.post('/', actualizaSalarioController.create);
router.put('/procesar/:id', actualizaSalarioController.procesar);

module.exports = router;
