const express = require('express');
const router = express.Router();
const empleadoTiempoController = require('../../controllers/recursos_humanos/empleadoTiempoController');

// Las rutas asumen que en el servidor principal se montarán como: /api/empleado-tiempo

// GET /api/empleado-tiempo/:empleadoId?empresaId=...
router.get('/:empleadoId', empleadoTiempoController.getAll);

// POST /api/empleado-tiempo/:empleadoId?empresaId=...
router.post('/:empleadoId', empleadoTiempoController.create);

// PUT /api/empleado-tiempo/:empleadoId/:recordId?empresaId=...
router.put('/:empleadoId/:recordId', empleadoTiempoController.update);

// DELETE /api/empleado-tiempo/:empleadoId/:recordId?empresaId=...
router.delete('/:empleadoId/:recordId', empleadoTiempoController.delete);

module.exports = router;
