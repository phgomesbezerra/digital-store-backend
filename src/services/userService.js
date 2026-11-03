// userService.js - regras de negocio dos usuarios.
// O controller chama estas funcoes; elas conversam com o banco.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Campos que podem ser devolvidos na resposta (nunca a senha).
const CAMPOS_PUBLICOS = ['id', 'firstname', 'surname', 'email'];

async function buscarPorId(id) {
  // Retorna o usuario sem a senha, ou null se nao existir.
  return User.findByPk(id, { attributes: CAMPOS_PUBLICOS });
}

async function criar(dados) {
  const { firstname, surname, email, password, confirmPassword } = dados;

  // Campos obrigatorios e confirmacao de senha.
  if (!firstname || !surname || !email || !password || !confirmPassword) {
    return { erro: 'Todos os campos são obrigatórios.' };
  }
  if (password !== confirmPassword) {
    return { erro: 'A senha e a confirmação não são iguais.' };
  }

  // A senha nunca e salva em texto puro: guardamos o hash (bcrypt).
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ firstname, surname, email, password: hash });

  return {
    user: {
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
    },
  };
}

async function atualizar(id, dados) {
  const { firstname, surname, email } = dados;

  if (!firstname || !surname || !email) {
    return { erro: 'Todos os campos são obrigatórios.' };
  }

  const user = await User.findByPk(id);
  if (!user) {
    return { naoEncontrado: true };
  }

  await user.update({ firstname, surname, email });
  return { atualizado: true };
}

async function deletar(id) {
  const user = await User.findByPk(id);
  if (!user) {
    return { naoEncontrado: true };
  }
  await user.destroy();
  return { deletado: true };
}

// POST /v1/user/token - gera o token JWT (Requisito 01 da Secao 05).
async function gerarToken(dados) {
  const { email, password } = dados;
  if (!email || !password) {
    return { erro: 'E-mail e senha são obrigatórios.' };
  }

  const user = await User.findOne({ where: { email } });
  // Compara a senha enviada com o hash salvo no banco.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { erro: 'E-mail ou senha incorretos.' };
  }

  // Sem a chave secreta configurada, nao da para assinar token.
  if (!process.env.JWT_SECRET) {
    return { erro: 'JWT_SECRET não configurado no servidor.' };
  }

  // O token carrega o id e o e-mail do usuario e vale por 1 dia.
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  return { token };
}

module.exports = { buscarPorId, criar, atualizar, deletar, gerarToken };
