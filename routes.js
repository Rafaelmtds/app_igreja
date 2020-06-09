const express = require('express');


//Controllers
const usuarioController = require('./src/controllers/usuario/UsuarioController');
const admController = require('./src/controllers/adm/AdmController');
const livroController = require('./src/controllers/livro/LivroController');

const routes = express.Router();

//Usuario
routes.post('/api/usuario/criar', usuarioController.create)
routes.post('/api/usuario/login', usuarioController.login)
routes.post('/api/usuario/editar', usuarioController.editar)

//ADM
routes.post('/api/adm/create', admController.create)
routes.post('/api/adm/tornaradm', admController.tornarADM)
routes.post('/api/adm/destituir', admController.destituirADM)
routes.post('/api/adm/login', admController.login)


//LIVRO
routes.post('/api/livro/add', livroController.adicionarLivro)
routes.post('/api/livro/editar', livroController.editarLivro)
routes.delete('/api/livro/remover:id_livro', livroController.removerLivro)
routes.get('/api/livro/mostrarLivros', livroController.mostrarLivros)


module.exports = routes;
