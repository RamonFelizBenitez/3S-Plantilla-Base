const express = require('express');
const router = express.Router();
const { getISRs, createISR, updateISR, deleteISR } = require('../../controllers/administracion/isrController');

router.get('/', getISRs);
router.post('/', createISR);
router.put('/:id', updateISR);
router.delete('/:id', deleteISR);

module.exports = router;
