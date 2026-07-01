const express = require('express');
const router = express.Router();
const controller = require('../../controllers/administracion/periodoController');

router.get('/', controller.getPeriodos);
router.post('/generar', controller.generarPeriodos);
router.put('/:id/estado', controller.updateEstado);
router.delete('/:codigoPeriodo', controller.deletePeriodo);

module.exports = router;
