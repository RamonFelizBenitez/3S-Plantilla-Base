const express = require('express');
const infoController = require('../../controllers/recursos_humanos/infoComplementariaController');

const routerFactory = () => express.Router();

const parentescosRouter = routerFactory();
parentescosRouter.get('/', infoController.parentescos.getAll);
parentescosRouter.post('/', infoController.parentescos.create);
parentescosRouter.put('/:id', infoController.parentescos.update);
parentescosRouter.delete('/:id', infoController.parentescos.delete);

const nivelesAcademicosRouter = routerFactory();
nivelesAcademicosRouter.get('/', infoController.nivelesAcademicos.getAll);
nivelesAcademicosRouter.post('/', infoController.nivelesAcademicos.create);
nivelesAcademicosRouter.put('/:id', infoController.nivelesAcademicos.update);
nivelesAcademicosRouter.delete('/:id', infoController.nivelesAcademicos.delete);

const titulosAcademicosRouter = routerFactory();
titulosAcademicosRouter.get('/', infoController.titulosAcademicos.getAll);
titulosAcademicosRouter.post('/', infoController.titulosAcademicos.create);
titulosAcademicosRouter.put('/:id', infoController.titulosAcademicos.update);
titulosAcademicosRouter.delete('/:id', infoController.titulosAcademicos.delete);

const idiomasRouter = routerFactory();
idiomasRouter.get('/', infoController.idiomas.getAll);
idiomasRouter.post('/', infoController.idiomas.create);
idiomasRouter.put('/:id', infoController.idiomas.update);
idiomasRouter.delete('/:id', infoController.idiomas.delete);

const traduccionesRouter = routerFactory();
traduccionesRouter.get('/', infoController.traducciones.getAll);
traduccionesRouter.post('/', infoController.traducciones.create);
traduccionesRouter.put('/:id', infoController.traducciones.update);
traduccionesRouter.delete('/:id', infoController.traducciones.delete);

const actividadesRouter = routerFactory();
actividadesRouter.get('/', infoController.actividades.getAll);
actividadesRouter.post('/', infoController.actividades.create);
actividadesRouter.put('/:id', infoController.actividades.update);
actividadesRouter.delete('/:id', infoController.actividades.delete);

module.exports = {
  parentescosRouter,
  nivelesAcademicosRouter,
  titulosAcademicosRouter,
  idiomasRouter,
  traduccionesRouter,
  actividadesRouter
};
