// app.js - configura o Express: os "middlewares" (funções que preparam cada requisição)
// e as rotas da API. Separar o app do server facilita os testes com Jest depois.
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Permite que a API entenda requisições com corpo em JSON (cadastros, logins etc.)
app.use(express.json());

// Rotas da API (versão 1). Usuários e categorias já funcionam;
// produtos entram na próxima etapa.
app.use('/v1/user', userRoutes);
app.use('/v1/category', categoryRoutes);

// Qualquer endereço que não existir na API cai aqui e responde 404 em JSON.

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

module.exports = app;
