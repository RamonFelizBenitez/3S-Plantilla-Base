const express = require('express');
const router = express.Router();
const otrosController = require('../../controllers/recursos_humanos/otrosController');

router.get('/:solicitudId', otrosController.getBySolicitud);
router.post('/', otrosController.create);
router.put('/:id', otrosController.update);
router.delete('/:id', otrosController.remove);

module.exports = router;
