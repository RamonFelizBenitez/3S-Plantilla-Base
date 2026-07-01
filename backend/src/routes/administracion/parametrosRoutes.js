const express = require('express');
const router = express.Router();
const parametrosController = require('../../controllers/administracion/parametrosController');

router.get('/', parametrosController.getParametrosRRHH);
router.put('/', parametrosController.saveParametrosRRHH);

module.exports = router;
