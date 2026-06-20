const express = require('express');
const router = express.Router();
const cedeController = require('../controllers/cedeController');

router.get('/', cedeController.getCedes);
router.post('/', cedeController.createCede);
router.put('/:id', cedeController.updateCede);
router.delete('/:id', cedeController.deleteCede);

module.exports = router;
