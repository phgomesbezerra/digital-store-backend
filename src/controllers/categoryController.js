// categoryController.js - recebe as requisicoes HTTP das categorias
// e devolve as respostas com os codigos certos do enunciado.
const categoryService = require('../services/categoryService');

// GET /v1/category/search - lista com paginacao e filtros.
async function pesquisar(req, res) {
  try {
    const resultado = await categoryService.buscar(req.query);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    return res.status(200).json(resultado.resultado);
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// GET /v1/category/:id - dados da categoria pelo ID.
async function obterPorId(req, res) {
  try {
    const category = await categoryService.buscarPorId(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    return res.status(200).json(category);
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// POST /v1/category - cadastro de categoria.
async function cadastrar(req, res) {
  try {
    const resultado = await categoryService.criar(req.body);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    return res.status(201).json(resultado.category);
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// PUT /v1/category/:id - atualiza a categoria.
async function atualizar(req, res) {
  try {
    const resultado = await categoryService.atualizar(req.params.id, req.body);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    if (resultado.naoEncontrado) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    return res.status(204).send();
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// DELETE /v1/category/:id - remove a categoria.
async function deletar(req, res) {
  try {
    const resultado = await categoryService.deletar(req.params.id);
    if (resultado.naoEncontrado) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    return res.status(204).send();
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

module.exports = { pesquisar, obterPorId, cadastrar, atualizar, deletar };
