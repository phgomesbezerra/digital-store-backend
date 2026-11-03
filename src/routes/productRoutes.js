// productRoutes.js - enderecos do CRUD de produtos (Secao 04 do enunciado).
const express = require('express');
const auth = require('../middleware/auth');
const productController = require('../controllers/productController');

const router = express.Router();

// A rota /search vem ANTES de /:id, senao o Express acha que "search" e um ID.
router.get('/search', productController.pesquisar);   // Requisito 01
router.get('/:id', productController.obterPorId);     // Requisito 02
router.post('/', auth, productController.cadastrar);        // Requisito 03
router.put('/:id', auth, productController.atualizar);      // Requisito 04
router.delete('/:id', auth, productController.deletar);     // Requisito 05
// Obs.: no enunciado o Requisito 05 desta secao diz "atualizacao" no titulo,
// mas o endereco e DELETE - e o endpoint de remocao mesmo.

module.exports = router;
