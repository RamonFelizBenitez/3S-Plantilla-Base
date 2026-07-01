const express = require('express');
const router = express.Router();
const secuenciaController = require('../../controllers/administracion/secuenciaController');

router.get('/', secuenciaController.getSecuencias);
router.post('/', secuenciaController.createSecuencia);
router.put('/:id', secuenciaController.updateSecuencia);

module.exports = router;
