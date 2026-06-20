const express = require('express');
const router = express.Router();
const tipoAccionController = require('../controllers/tipoAccionController');

router.get('/', tipoAccionController.getTipoAcciones);
router.post('/', tipoAccionController.createTipoAccion);
router.put('/:id', tipoAccionController.updateTipoAccion);
router.delete('/:id', tipoAccionController.deleteTipoAccion);

module.exports = router;
