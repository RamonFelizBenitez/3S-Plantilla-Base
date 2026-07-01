const express = require('express');
const router = express.Router();
const experienciaController = require('../../controllers/recursos_humanos/experienciaController');

router.get('/:solicitudId', experienciaController.getBySolicitud);
router.post('/', experienciaController.create);
router.put('/:id', experienciaController.update);
router.delete('/:id', experienciaController.remove);

module.exports = router;
