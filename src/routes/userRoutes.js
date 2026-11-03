// userRoutes.js - enderecos do CRUD de usuarios (Secao 02) e do token (Secao 05).
const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:id', userController.obterPorId);      // Requisito 01 (leitura, publica)
router.post('/token', userController.token);         // Secao 05: gera o token (publico)
router.post('/', auth, userController.cadastrar);    // Requisito 02 (protegido)
router.put('/:id', auth, userController.atualizar);  // Requisito 04 (protegido)
router.delete('/:id', auth, userController.deletar); // Requisito 05 (protegido)
// Obs.: o enunciado nao tem Requisito 03 nesta secao (pula do 02 para o 04).

module.exports = router;
