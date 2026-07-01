const express = require('express');
const router = express.Router();
const vacacionController = require('../../controllers/recursos_humanos/vacacionController');

router.get('/', vacacionController.getVacaciones);
router.post('/', vacacionController.createVacacion);
router.put('/:id', vacacionController.updateVacacion);
router.delete('/:id', vacacionController.deleteVacacion);

router.put('/:id/status', vacacionController.changeStatus);
router.put('/:id/toma-posesion', vacacionController.tomaPosesion);

module.exports = router;
