const express = require('express');
const routerMerge = express.Router({ mergeParams: true });
const dependenciaCargoController = require('../controllers/dependenciaCargoController');

// Rutas base: /api/configuracion/dependencias/:dependenciaId/cargos
routerMerge.get('/', dependenciaCargoController.getCargosAsignados);
routerMerge.post('/', dependenciaCargoController.syncCargos);

module.exports = routerMerge;
