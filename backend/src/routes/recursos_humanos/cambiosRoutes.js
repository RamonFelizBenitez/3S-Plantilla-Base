const express = require('express');
const router = express.Router();
const cambiosController = require('../../controllers/recursos_humanos/cambiosController');

router.get('/', cambiosController.getCambios);
router.post('/', cambiosController.createCambio);
router.put('/:id', cambiosController.updateCambio);
router.delete('/:id', cambiosController.deleteCambio);

router.put('/:id/aprobar', cambiosController.aprobarCambio);
router.put('/:id/desaprobar', cambiosController.desaprobarCambio);
router.put('/:id/procesar', cambiosController.procesarCambio);
router.get('/:id/print', cambiosController.getCambioForPrint);

module.exports = router;
