const express = require('express');
const router = express.Router();
const cargoController = require('../controllers/cargoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', cargoController.getCargos);

router.use(authMiddleware);
router.post('/', cargoController.createCargo);
router.put('/:id', cargoController.updateCargo);
router.delete('/:id', cargoController.deleteCargo);

module.exports = router;
