const express = require('express');
const router = express.Router();
const { getAfpars, saveAfpars } = require('../../controllers/administracion/afparsController');

router.get('/', getAfpars);
router.post('/', saveAfpars);

module.exports = router;
