const express = require('express');
const router = express.Router();
const geografiaController = require('../../controllers/administracion/geografiaController');

// Continentes
router.get('/continentes', geografiaController.getContinentes);
router.post('/continentes', geografiaController.createContinente);
router.put('/continentes/:id', geografiaController.updateContinente);

// Paises
router.get('/paises', geografiaController.getPaises);
router.post('/paises', geografiaController.createPais);
router.put('/paises/:id', geografiaController.updatePais);

// Ciudades
router.get('/ciudades', geografiaController.getCiudades);
router.post('/ciudades', geografiaController.createCiudad);
router.put('/ciudades/:id', geografiaController.updateCiudad);

// Municipios
router.get('/municipios', geografiaController.getMunicipios);
router.post('/municipios', geografiaController.createMunicipio);
router.put('/municipios/:id', geografiaController.updateMunicipio);

module.exports = router;
