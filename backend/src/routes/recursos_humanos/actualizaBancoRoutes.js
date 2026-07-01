const express = require('express');
const router = express.Router();
const actualizaBancoController = require('../../controllers/recursos_humanos/actualizaBancoController');

router.get('/:empleadoId', actualizaBancoController.getByEmpleado);
router.post('/', actualizaBancoController.create);
router.put('/procesar/:id', actualizaBancoController.procesar);

module.exports = router;
