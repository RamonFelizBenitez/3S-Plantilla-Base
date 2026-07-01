const express = require('express');
const router = express.Router();
const tipoTransaccionController = require('../../controllers/nomina/tipoTransaccionController');

router.get('/', tipoTransaccionController.getAll);
router.post('/', tipoTransaccionController.create);
router.put('/:id', tipoTransaccionController.update);
router.delete('/:id', tipoTransaccionController.remove);

module.exports = router;
