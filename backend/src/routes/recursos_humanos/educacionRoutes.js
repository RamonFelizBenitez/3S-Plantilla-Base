const express = require('express');
const router = express.Router();
const educacionController = require('../../controllers/recursos_humanos/educacionController');

router.get('/:solicitudId', educacionController.getBySolicitud);
router.post('/', educacionController.create);
router.put('/:id', educacionController.update);
router.delete('/:id', educacionController.remove);

module.exports = router;
