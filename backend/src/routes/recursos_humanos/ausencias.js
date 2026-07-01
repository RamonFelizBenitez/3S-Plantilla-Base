const express = require('express');
const router = express.Router();
const ausenciaController = require('../../controllers/recursos_humanos/ausenciaController');

router.get('/', ausenciaController.getAusencias);
router.post('/', ausenciaController.createAusencia);
router.put('/:id', ausenciaController.updateAusencia);
router.delete('/:id', ausenciaController.deleteAusencia);
router.put('/:id/status', ausenciaController.changeStatus);
router.put('/:id/toma-posesion', ausenciaController.tomaPosesion);

module.exports = router;
