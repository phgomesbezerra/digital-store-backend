// userController.js - recebe as requisicoes HTTP dos usuarios
// e devolve as respostas com os codigos certos do enunciado.
const userService = require('../services/userService');

// GET /v1/user/:id - dados do usuario pelo ID.
async function obterPorId(req, res) {
  const user = await userService.buscarPorId(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  return res.status(200).json(user);
}

// POST /v1/user - cadastro de usuario.
async function cadastrar(req, res) {
  const resultado = await userService.criar(req.body);
  if (resultado.erro) {
    return res.status(400).json({ message: resultado.erro });
  }
  return res.status(201).json(resultado.user);
}

// PUT /v1/user/:id - atualiza dados do usuario.
async function atualizar(req, res) {
  const resultado = await userService.atualizar(req.params.id, req.body);
  if (resultado.erro) {
    return res.status(400).json({ message: resultado.erro });
  }
  if (resultado.naoEncontrado) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  return res.status(204).send(); // 204 = sucesso sem corpo de resposta
}

// DELETE /v1/user/:id - remove o usuario.
async function deletar(req, res) {
  const resultado = await userService.deletar(req.params.id);
  if (resultado.naoEncontrado) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }
  return res.status(204).send();
}

module.exports = { obterPorId, cadastrar, atualizar, deletar };
