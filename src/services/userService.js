// userService.js - regras de negocio dos usuarios.
// O controller chama estas funcoes; elas conversam com o banco.
const bcrypt = require('bcrypt');
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

module.exports = { buscarPorId, criar, atualizar, deletar };
