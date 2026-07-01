const express = require('express');
const router = express.Router();
const { getNominas, procesarNomina } = require('../../controllers/nomina/generarNominaController');

router.get('/', getNominas);
router.post('/procesar', procesarNomina);

module.exports = router;
