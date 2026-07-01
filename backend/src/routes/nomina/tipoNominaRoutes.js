const express = require('express');
const router = express.Router();
const tipoNominaController = require('../../controllers/nomina/tipoNominaController');

router.get('/', tipoNominaController.getTiposNominas);
router.post('/', tipoNominaController.createTipoNomina);
router.put('/:id', tipoNominaController.updateTipoNomina);
router.delete('/:id', tipoNominaController.deleteTipoNomina);

module.exports = router;
