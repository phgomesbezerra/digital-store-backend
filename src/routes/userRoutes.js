// userRoutes.js - enderecos do CRUD de usuarios (Secao 02 do enunciado).
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/:id', userController.obterPorId);   // Requisito 01
router.post('/', userController.cadastrar);      // Requisito 02
router.put('/:id', userController.atualizar);    // Requisito 04
router.delete('/:id', userController.deletar);   // Requisito 05
// Obs.: o enunciado nao tem Requisito 03 nesta secao (pula do 02 para o 04).

module.exports = router;
