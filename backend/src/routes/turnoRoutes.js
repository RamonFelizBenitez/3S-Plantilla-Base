const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');

router.get('/', turnoController.getTurnos);
router.post('/', turnoController.createTurno);
router.put('/:id', turnoController.updateTurno);
router.delete('/:id', turnoController.deleteTurno);

module.exports = router;
