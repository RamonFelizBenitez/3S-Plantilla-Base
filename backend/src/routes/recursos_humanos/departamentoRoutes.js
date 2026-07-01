const express = require('express');
const router = express.Router();
const controller = require('../../controllers/recursos_humanos/departamentoController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.deleteRecord);

module.exports = router;
