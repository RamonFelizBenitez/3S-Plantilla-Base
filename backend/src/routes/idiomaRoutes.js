const express = require('express');
const router = express.Router();
const idiomaController = require('../controllers/idiomaController');

router.get('/:solicitudId', idiomaController.getBySolicitud);
router.post('/', idiomaController.create);
router.put('/:id', idiomaController.update);
router.delete('/:id', idiomaController.remove);

module.exports = router;
