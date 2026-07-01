const express = require('express');
const router = express.Router();
const separacionController = require('../../controllers/recursos_humanos/separacionController');

router.get('/', separacionController.getSeparaciones);
router.post('/', separacionController.createSeparacion);
router.put('/:id', separacionController.updateSeparacion);
router.delete('/:id', separacionController.deleteSeparacion);

router.put('/:id/status', separacionController.changeStatus);

router.put('/:id/toma-posesion', separacionController.tomaPosesion);

module.exports = router;
