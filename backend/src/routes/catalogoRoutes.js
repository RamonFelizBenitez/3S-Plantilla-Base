const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');

// Rutas Auxiliares (Dependencias)
router.get('/monedas', catalogoController.getMonedas);
router.get('/departamentos', catalogoController.getDepartamentos);
router.get('/centro-costos', catalogoController.getCentroCostos);
router.get('/propositos', catalogoController.getPropositos);

// Rutas Principales del Catálogo
router.get('/', catalogoController.getCatalogo);
router.post('/', catalogoController.createCatalogo);
router.put('/:id', catalogoController.updateCatalogo);
router.delete('/:id', catalogoController.deleteCatalogo);

module.exports = router;
