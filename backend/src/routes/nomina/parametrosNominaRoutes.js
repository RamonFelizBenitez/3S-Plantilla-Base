const express = require('express');
const router = express.Router();
const parametrosNominaController = require('../../controllers/nomina/parametrosNominaController');

router.get('/', parametrosNominaController.getParametros);
router.post('/', parametrosNominaController.saveParametros);

module.exports = router;
