const express = require('express');
const router = express.Router();
const grupoOcupacionalController = require('../controllers/grupoOcupacionalController');

router.get('/', grupoOcupacionalController.getGruposOcupacionales);
router.post('/', grupoOcupacionalController.createGrupoOcupacional);
router.put('/:id', grupoOcupacionalController.updateGrupoOcupacional);
router.delete('/:id', grupoOcupacionalController.deleteGrupoOcupacional);

module.exports = router;
