const express = require('express');
const router = express.Router();
const { getTransacciones, addTransaccion, updateTransaccion, deleteTransaccion } = require('../../controllers/recursos_humanos/transaccionesEmpleadoController');

router.get('/:empleadoId', getTransacciones);
router.post('/:empleadoId', addTransaccion);
router.put('/:empleadoId/:tipoNovedadViejo/:lineaNumero', updateTransaccion);
router.delete('/:empleadoId/:tipoNovedad/:lineaNumero', deleteTransaccion);

module.exports = router;
