// categoryRoutes.js - enderecos do CRUD de categorias (Secao 03 do enunciado).
const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// Atencao: a rota /search vem ANTES de /:id, senao o Express
// acha que "search" e um ID.
router.get('/search', categoryController.pesquisar);   // Requisito 01
router.get('/:id', categoryController.obterPorId);     // Requisito 02
router.post('/', categoryController.cadastrar);        // Requisito 03
router.put('/:id', categoryController.atualizar);      // Requisito 04
router.delete('/:id', categoryController.deletar);     // Requisito 05

module.exports = router;
