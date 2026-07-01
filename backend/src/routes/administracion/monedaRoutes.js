const express = require('express');
const router = express.Router();
const monedaController = require('../../controllers/administracion/monedaController');

router.get('/', monedaController.getMonedas);
router.post('/', monedaController.createMoneda);
router.put('/:id', monedaController.updateMoneda);
router.delete('/:id', monedaController.deleteMoneda);

module.exports = router;
