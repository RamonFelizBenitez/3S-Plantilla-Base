const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');

router.get('/estructura', permisoController.getEstructuraMenu);
router.get('/:tipo/:id', permisoController.getPermisos); // tipo = 'perfil' o 'usuario'
router.post('/guardar/:tipo/:id', permisoController.savePermisos);

module.exports = router;
