// productController.js - recebe as requisicoes HTTP dos produtos
// e devolve as respostas com os codigos certos do enunciado.
const productService = require('../services/productService');
const { ImagemInvalida } = require('../services/productService');

// GET /v1/product/search - lista com paginacao e filtros.
async function pesquisar(req, res) {
  try {
    const resultado = await productService.buscar(req.query);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    return res.status(200).json(resultado.resultado);
  } catch (erro) {
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// GET /v1/product/:id - dados do produto pelo ID.
async function obterPorId(req, res) {
  try {
    const product = await productService.buscarPorId(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    return res.status(200).json(product);
  } catch (erro) {
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// POST /v1/product - cadastro de produto (com imagens, opcoes e categorias).
async function cadastrar(req, res) {
  try {
    const resultado = await productService.criar(req.body);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    return res.status(201).json(resultado.product);
  } catch (erro) {
    // Imagem invalida (base64 malformado ou conteudo que nao e imagem) = erro do cliente.
    if (erro instanceof ImagemInvalida) {
      return res.status(400).json({ message: erro.message });
    }
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// PUT /v1/product/:id - atualiza o produto.
async function atualizar(req, res) {
  try {
    const resultado = await productService.atualizar(req.params.id, req.body);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    if (resultado.naoEncontrado) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    return res.status(204).send();
  } catch (erro) {
    if (erro instanceof ImagemInvalida) {
      return res.status(400).json({ message: erro.message });
    }
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// DELETE /v1/product/:id - remove o produto.
async function deletar(req, res) {
  try {
    const resultado = await productService.deletar(req.params.id);
    if (resultado.naoEncontrado) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    return res.status(204).send();
  } catch (erro) {
    if (erro instanceof ImagemInvalida) {
      return res.status(400).json({ message: erro.message });
    }
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

module.exports = { pesquisar, obterPorId, cadastrar, atualizar, deletar };
