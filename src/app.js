// app.js - configura o Express: os "middlewares" (funções que preparam cada requisição)
// e as rotas da API. Separar o app do server facilita os testes com Jest depois.
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// O filtro option[45]=GG,PP do enunciado precisa chegar com a chave inteira:
// o parser padrao do Express perderia o numero 45. O parser "simples" mantem.
// Precisa vir ANTES de qualquer app.use(), senao o Express ja tera
// preparado o parser antigo.
app.set('query parser', 'simple');

// Permite que a API entenda requisições com corpo em JSON (cadastros, logins etc.).
// O limite de 10mb existe porque as imagens dos produtos chegam em base64
// dentro do JSON - mas sem deixar corpos gigantes derrubarem o servidor.
app.use(express.json({ limit: '10mb' }));

// Rotas da API (versão 1): usuários, categorias e produtos.
app.use('/v1/user', userRoutes);
app.use('/v1/category', categoryRoutes);
app.use('/v1/product', productRoutes);

// As imagens dos produtos ficam na pasta uploads/ e podem ser
// acessadas pelo navegador (ex.: /uploads/nome-do-arquivo.png).
// index: false e dotfiles: deny evitam listar a pasta ou servir arquivos ocultos.
// So imagens entram nessa pasta (o cadastro valida o tipo antes de salvar).
app.use('/uploads', express.static('uploads', { index: false, dotfiles: 'deny' }));

// Qualquer endereço que não existir na API cai aqui e responde 404 em JSON.

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

module.exports = app;
