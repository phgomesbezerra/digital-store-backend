// app.js - configura o Express: os "middlewares" (funções que preparam cada requisição)
// e as rotas da API. Separar o app do server facilita os testes com Jest depois.
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

const app = express();

// O filtro option[45]=GG,PP do enunciado precisa chegar com a chave inteira:
// o parser padrao do Express perderia o numero 45. O parser "simples" mantem.
// Precisa vir ANTES de qualquer app.use(), senao o Express ja tera
// preparado o parser antigo.
app.set('query parser', 'simple');

// Permite que a API entenda requisições com corpo em JSON (cadastros, logins etc.).
// O limite de 10mb existe porque as imagens dos produtos chegam em base64
// dentro do JSON - mas sem deixar corpos gigantes derrubarem o servidor.
// CORS: permite que o site da loja (React, em outro endereco/porta) chame a API
// direto pelo navegador. Sem isso, o navegador bloqueia a chamada antes de chegar
// aqui. (Alternativa em desenvolvimento: proxy do Vite, que nem precisa de CORS -
// mas o site hospedado chamando a API hospedada sempre precisa.)
// Desenvolvimento: sem CORS_ORIGIN no .env, qualquer origem vale.
// Producao: defina CORS_ORIGIN com o endereco do site (ex.: https://minha-loja.vercel.app)
// e so ele conseguira chamar a API pelo navegador.
const origensPermitidas = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*';
app.use(cors({ origin: origensPermitidas }));

app.use(express.json({ limit: '10mb' }));

// Rotas da API (versão 1): usuários, categorias e produtos.
app.use('/v1/user', userRoutes);
app.use('/v1/category', categoryRoutes);
app.use('/v1/product', productRoutes);

// Documentacao interativa da API (Swagger): http://localhost:3000/docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
