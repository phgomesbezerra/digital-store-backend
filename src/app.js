// app.js - configura o Express: os "middlewares" (funções que preparam cada requisição)
// e as rotas da API. Separar o app do server facilita os testes com Jest depois.
const express = require('express');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Permite que a API entenda requisições com corpo em JSON (cadastros, logins etc.)
app.use(express.json());

// Rotas da API (versão 1). Usuários já funcionam; categorias e produtos
// entram nas próximas etapas.
app.use('/v1/user', userRoutes);

// Qualquer endereço que não existir na API cai aqui e responde 404 em JSON.

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

module.exports = app;
