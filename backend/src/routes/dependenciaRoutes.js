const express = require('express');
const router = express.Router();
const dependenciaController = require('../controllers/dependenciaController');

// Rutas para Dependencias, donde 'direccionId' debe venir en la URL base.
// Ejemplo: /api/configuracion/direcciones/:direccionId/dependencias

// Nota: en server.js lo montaremos como: app.use('/api/configuracion/direcciones/:direccionId/dependencias', dependenciaRoutes);
// Para que :direccionId esté disponible en este router, debemos habilitar mergeParams o pasarlo directo, pero como :direccionId está antes del router base, necesitamos mergeParams.

const routerMerge = express.Router({ mergeParams: true });

routerMerge.get('/', dependenciaController.getDependenciasByDireccion);
routerMerge.post('/', dependenciaController.createDependencia);

// El ID aquí es DependenciaID
routerMerge.put('/:id', dependenciaController.updateDependencia);
routerMerge.delete('/:id', dependenciaController.deleteDependencia);

module.exports = routerMerge;
