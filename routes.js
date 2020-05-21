const express = require('express');


//Controllers
const usuarioController = require('./src/controllers/usuario/UsuarioController');

const routes = express.Router();

//Usuario
routes.post('/api/usuario/criar', usuarioController.create)
routes.post('/api/usuario/login', usuarioController.login)
routes.post('/api/usuario/editar', usuarioController.editar)





module.exports = routes;
