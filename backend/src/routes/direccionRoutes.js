const express = require('express');
const router = express.Router();
const direccionController = require('../controllers/direccionController');

router.get('/', direccionController.getDirecciones);
router.post('/', direccionController.createDireccion);
router.put('/:id', direccionController.updateDireccion);
router.delete('/:id', direccionController.deleteDireccion);

module.exports = router;
