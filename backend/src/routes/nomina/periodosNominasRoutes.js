const express = require('express');
const router = express.Router();
const { getPeriodos, generarPeriodos, eliminarLotePeriodos } = require('../../controllers/nomina/periodosNominasController');

router.get('/', getPeriodos);
router.post('/generar', generarPeriodos);
router.delete('/:codigoPeriodo/:tipoPago', eliminarLotePeriodos);

module.exports = router;
