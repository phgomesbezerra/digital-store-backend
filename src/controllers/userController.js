// userController.js - recebe as requisicoes HTTP dos usuarios
// e devolve as respostas com os codigos certos do enunciado.
const userService = require('../services/userService');

// GET /v1/user/:id - dados do usuario pelo ID.
async function obterPorId(req, res) {
  try {
    const user = await userService.buscarPorId(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(200).json(user);
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// POST /v1/user - cadastro de usuario.
async function cadastrar(req, res) {
  try {
    const resultado = await userService.criar(req.body);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    return res.status(201).json(resultado.user);
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// PUT /v1/user/:id - atualiza dados do usuario.
async function atualizar(req, res) {
  try {
    const resultado = await userService.atualizar(req.params.id, req.body);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    if (resultado.naoEncontrado) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(204).send(); // 204 = sucesso sem corpo de resposta
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// DELETE /v1/user/:id - remove o usuario.
async function deletar(req, res) {
  try {
    const resultado = await userService.deletar(req.params.id);
    if (resultado.naoEncontrado) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    return res.status(204).send();
  } catch (erro) {
    // Se algo inesperado acontecer (ex.: banco fora do ar),
    // a API responde 500 em vez de quebrar.
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

// POST /v1/user/token - gera o token de acesso (login).
async function token(req, res) {
  try {
    const resultado = await userService.gerarToken(req.body);
    if (resultado.erro) {
      return res.status(400).json({ message: resultado.erro });
    }
    return res.status(200).json({ token: resultado.token });
  } catch (erro) {
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

module.exports = { obterPorId, cadastrar, atualizar, deletar, token };
