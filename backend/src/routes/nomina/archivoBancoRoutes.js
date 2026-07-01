const express = require('express');
const router = express.Router();
const archivoBancoController = require('../../controllers/nomina/archivoBancoController');

router.get('/nominas-cerradas', archivoBancoController.getNominasCerradas);
router.post('/generar', archivoBancoController.generarArchivoBanco);

module.exports = router;
