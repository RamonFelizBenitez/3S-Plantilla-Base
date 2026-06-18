const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');

router.get('/', perfilController.getPerfiles);
router.get('/:id', perfilController.getPerfilById);
router.post('/', perfilController.createPerfil);
router.put('/:id', perfilController.updatePerfil);
router.delete('/:id', perfilController.deletePerfil);

module.exports = router;
