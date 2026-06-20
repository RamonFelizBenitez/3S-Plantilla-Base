const express = require('express');
const router = express.Router();
const referenciaController = require('../controllers/referenciaController');

router.get('/:solicitudId', referenciaController.getBySolicitud);
router.post('/', referenciaController.create);
router.put('/:id', referenciaController.update);
router.delete('/:id', referenciaController.remove);

module.exports = router;
