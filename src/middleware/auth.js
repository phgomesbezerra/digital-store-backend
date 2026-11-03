// auth.js - middleware que protege as rotas de escrita (POST, PUT, DELETE).
// Ele confere o cabecalho "Authorization: Bearer <token>" e valida o JWT.
//
// ATENCAO: o enunciado se contradiz aqui. A Secao 05 (Requisito 02) manda
// responder 400 quando o token faltar ou for invalido, mas as tabelas de
// cada endpoint dizem 401. Seguimos a Secao 05 (400). Se o monitor pedir
// 401, basta trocar o numero abaixo.
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const cabecalho = req.headers.authorization; // vem como "Bearer <token>"

  if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
    return res.status(400).json({ message: 'Token de autorização não enviado.' });
  }

  const token = cabecalho.slice(7); // tira o "Bearer " do comeco

  // Sem a chave secreta configurada, nao da para validar token nenhum.
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT_SECRET não configurado no servidor.' });
  }

  try {
    // Se a assinatura estiver errada ou o token expirado, cai no catch.
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = dados; // guarda os dados do token para as rotas usarem
    next();
  } catch (erro) {
    return res.status(400).json({ message: 'Token de autorização inválido.' });
  }
}

module.exports = auth;
