const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const permisoRoutes = require('./routes/permisoRoutes');
const geografiaRoutes = require('./routes/geografiaRoutes');
const secuenciaRoutes = require('./routes/secuenciaRoutes');
const periodoRoutes = require('./routes/periodoRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const monedaRoutes = require('./routes/monedaRoutes');
const departamentoRoutes = require('./routes/departamentoRoutes');
const centroCostoRoutes = require('./routes/centroCostoRoutes');
const propositoRoutes = require('./routes/propositoRoutes');
const unidadMedidaRoutes = require('./routes/unidadMedidaRoutes');
const conversionUnidadesRoutes = require('./routes/conversionUnidadesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/perfiles', perfilRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/geografia', geografiaRoutes);
app.use('/api/secuencias', secuenciaRoutes);
app.use('/api/periodos', periodoRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/monedas', monedaRoutes);
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/centro-costos', centroCostoRoutes);
app.use('/api/propositos', propositoRoutes);
app.use('/api/unidades-medida', unidadMedidaRoutes);
app.use('/api/conversion-unidades', conversionUnidadesRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
