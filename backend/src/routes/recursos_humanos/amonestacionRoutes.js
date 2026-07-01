const express = require('express');
const router = express.Router();
const amonestacionController = require('../../controllers/recursos_humanos/amonestacionController');

router.get('/', amonestacionController.getAmonestaciones);
router.post('/', amonestacionController.createAmonestacion);
router.put('/:id', amonestacionController.updateAmonestacion);
router.delete('/:id', amonestacionController.deleteAmonestacion);
router.put('/:id/status', amonestacionController.changeStatus);
router.put('/:id/toma-posesion', amonestacionController.tomaPosesion);

module.exports = router;
