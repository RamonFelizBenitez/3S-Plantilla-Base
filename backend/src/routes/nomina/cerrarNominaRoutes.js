const express = require('express');
const router = express.Router();
const cerrarNominaController = require('../../controllers/nomina/cerrarNominaController');

router.get('/', cerrarNominaController.getNominasAbiertas);
router.post('/procesar', cerrarNominaController.cerrarNomina);

module.exports = router;
