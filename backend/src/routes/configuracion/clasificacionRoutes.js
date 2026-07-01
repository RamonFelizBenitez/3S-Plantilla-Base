const express = require('express');
const router = express.Router();
const clasificacionController = require('../../controllers/configuracion/clasificacionController');

router.get('/', clasificacionController.getClasificaciones);
router.get('/:id', clasificacionController.getClasificacionById);
router.post('/', clasificacionController.createClasificacion);
router.put('/:id', clasificacionController.updateClasificacion);
router.delete('/:id', clasificacionController.deleteClasificacion);

module.exports = router;
