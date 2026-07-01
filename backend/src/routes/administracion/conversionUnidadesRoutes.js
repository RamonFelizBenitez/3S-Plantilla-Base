const express = require('express');
const router = express.Router();
const controller = require('../../controllers/administracion/conversionUnidadesController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:idDesde/:idHasta', controller.update);
router.delete('/:idDesde/:idHasta', controller.deleteRecord);

module.exports = router;
