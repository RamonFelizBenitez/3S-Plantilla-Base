const express = require('express');
const router = express.Router();
const dependienteController = require('../../controllers/recursos_humanos/dependienteController');

// All routes here should be accessed with /api/dependientes
router.get('/:solicitudId', dependienteController.getBySolicitud);
router.post('/', dependienteController.create);
router.put('/:id', dependienteController.update);
router.delete('/:id', dependienteController.remove);

module.exports = router;
