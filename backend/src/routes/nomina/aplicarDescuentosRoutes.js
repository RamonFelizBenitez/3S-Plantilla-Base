const express = require('express');
const router = express.Router();
const aplicarDescuentosController = require('../../controllers/nomina/aplicarDescuentosController');

router.post('/procesar', aplicarDescuentosController.procesarDescuentosExcel);

module.exports = router;
