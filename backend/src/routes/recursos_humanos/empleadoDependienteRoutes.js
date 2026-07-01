const express = require('express');
const router = express.Router();
const empleadoDependienteController = require('../../controllers/recursos_humanos/empleadoDependienteController');

// Routes mapped to /api/empleados-dependientes
router.get('/:empleadoId/solicitante-dependientes', empleadoDependienteController.getSolicitanteDependientes);
router.get('/:empleadoId', empleadoDependienteController.getByEmpleado);
router.post('/', empleadoDependienteController.create);
router.put('/:dependienteId', empleadoDependienteController.update);
router.delete('/:dependienteId', empleadoDependienteController.remove);

module.exports = router;
