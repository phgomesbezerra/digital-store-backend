// app.js - configura o Express: os "middlewares" (funções que preparam cada requisição)
// e as rotas da API. Separar o app do server facilita os testes com Jest depois.
const express = require('express');

const app = express();

// Permite que a API entenda requisições com corpo em JSON (cadastros, logins etc.)
app.use(express.json());

// As rotas de usuários, categorias e produtos entram aqui nas próximas etapas.
// Exemplo: app.use('/v1/user', require('./routes/userRoutes'));

// Qualquer endereço que não existir na API cai aqui e responde 404 em JSON.
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

module.exports = app;
