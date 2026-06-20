const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.use(authMiddleware);

router.get('/', solicitudController.getSolicitudes);
router.post('/', solicitudController.createSolicitud);
router.put('/:id', solicitudController.updateSolicitud);
router.delete('/:id', solicitudController.deleteSolicitud);

// Endpoint para adjuntar documentos a una solicitud existente
router.post('/:solicitudId/documentos', upload.array('documentos', 10), solicitudController.uploadDocumento);
router.get('/:solicitudId/documentos', solicitudController.getDocumentos);

// Endpoint para subir o actualizar la foto del empleado
router.post('/:id/foto', upload.single('foto'), solicitudController.uploadFoto);

module.exports = router;
