const express = require('express');
const router = express.Router();
const designacionController = require('../../controllers/recursos_humanos/designacionController');

router.get('/', designacionController.getDesignaciones);
router.post('/', designacionController.createDesignacion);
router.put('/:id', designacionController.updateDesignacion);
router.delete('/:id', designacionController.deleteDesignacion);
router.put('/:id/aprobar', designacionController.aprobarDesignacion);
router.put('/:id/desaprobar', designacionController.desaprobarDesignacion);
router.get('/:id/print', designacionController.getDesignacionForPrint);
router.post('/:id/toma-posesion', designacionController.tomaPosesion);

module.exports = router;
