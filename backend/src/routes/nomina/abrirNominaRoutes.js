const express = require('express');
const router = express.Router();
const { getTiposNominas, getPeriodosDisponibles, abrirNominaAction } = require('../../controllers/nomina/abrirNominaController');

router.get('/tipos', getTiposNominas);
router.get('/periodos/:tipoPago/:tipoNominaId', getPeriodosDisponibles);
router.post('/abrir', abrirNominaAction);

module.exports = router;
