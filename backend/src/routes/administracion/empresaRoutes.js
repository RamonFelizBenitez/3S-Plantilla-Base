const express = require('express');
const router = express.Router();
const empresaController = require('../../controllers/administracion/empresaController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, 'empresa_' + req.params.id + '_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Rutas base: /api/empresas
router.get('/', empresaController.getEmpresas);
router.get('/:id', empresaController.getEmpresaById);
router.post('/', empresaController.createEmpresa);
router.put('/:id', empresaController.updateEmpresa);
router.post('/:id/logo', upload.single('logo'), empresaController.uploadLogo);
router.delete('/:id', empresaController.deleteEmpresa);

module.exports = router;
