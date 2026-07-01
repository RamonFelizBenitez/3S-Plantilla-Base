const express = require('express');
const router = express.Router();
const subirNominaExcelController = require('../../controllers/nomina/subirNominaExcelController');

router.post('/procesar', subirNominaExcelController.procesarNominaExcel);

module.exports = router;
