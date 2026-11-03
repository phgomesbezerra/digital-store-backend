// api.test.js - testes automatizados da API (Jest + Supertest).
// Rodam num banco separado (digitalcollegebr_test), criado e apagado
// pelos proprios testes - os dados de desenvolvimento nunca sao tocados.
//
// Rode com: npm test
require('dotenv').config();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo_de_teste';

const request = require('supertest');
const mysql = require('mysql2/promise');

let app;
let sequelize;
let db;

// Nome UNICO para o banco desta rodada de testes. Como ele nao existia
// antes (o CREATE DATABASE abaixo falharia se existisse), temos certeza
// de que fomos nos que criamos - e so nos o apagamos no final.
const NOME_BANCO_TESTE = 'digitalcollegebr_test_' + Date.now() + '_' + Math.floor(Math.random() * 100000);

beforeAll(async () => {
  process.env.DB_NAME_TEST = NOME_BANCO_TESTE;
  const config = require('../src/config/database').test;

  // GUARDA 1: os testes so rodam contra um banco LOCAL. Se o .env apontar
  // para um servidor remoto (ex.: producao), os testes se recusam a rodar.
  const host = String(config.host);
  if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
    throw new Error('Testes recusados: o banco configurado nao e local (' + host + ').');
  }

  // GUARDA 2: o nome precisa ter o prefixo de teste - protecao extra contra
  // apontar, por engano, para o banco de desenvolvimento.
  if (!config.database.startsWith('digitalcollegebr_test_')) {
    throw new Error('Testes recusados: nome de banco sem o prefixo de teste.');
  }

  const conexao = await mysql.createConnection({
    host: config.host, port: config.port, user: config.username, password: config.password,
  });
  // CREATE DATABASE (sem IF NOT EXISTS): se ja existir um banco com esse
  // nome, o teste FALHA em vez de mexer em algo que nao foi ele que criou.
  await conexao.query(`CREATE DATABASE \`${config.database}\``);
  await conexao.end();

  db = require('../src/models');
  sequelize = db.sequelize;
  await sequelize.sync({ force: true }); // cria as tabelas no banco novo (vazio)

  app = require('../src/app');

  // Usuario inicial para conseguir o token nos testes.
  await db.User.create({
    firstname: 'Teste', surname: 'Automatizado',
    email: 'teste@local.com',
    password: await require('bcrypt').hash('senha123', 10),
  });
});

afterAll(async () => {
  // Apaga APENAS o banco que esta rodada criou (nome unico, criado
  // pelo CREATE DATABASE acima - identidade comprovada).
  await sequelize.getQueryInterface().dropDatabase(NOME_BANCO_TESTE);
  await sequelize.close();
});

// Um PNG minimo de verdade (1 pixel) para os testes de upload.
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function obterToken() {
  const res = await request(app)
    .post('/v1/user/token')
    .send({ email: 'teste@local.com', password: 'senha123' });
  return res.body.token;
}

describe('Login (Seção 05)', () => {
  test('gera token com e-mail e senha corretos', async () => {
    const res = await request(app)
      .post('/v1/user/token')
      .send({ email: 'teste@local.com', password: 'senha123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('recusa senha errada com 400', async () => {
    const res = await request(app)
      .post('/v1/user/token')
      .send({ email: 'teste@local.com', password: 'errada' });
    expect(res.status).toBe(400);
  });

  test('escrita sem token é rejeitada', async () => {
    const res = await request(app).post('/v1/category').send({ name: 'X', slug: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('CRUD de usuários (Seção 02)', () => {
  let token;
  beforeAll(async () => { token = await obterToken(); });

  test('cadastra, consulta, atualiza e remove', async () => {
    const criado = await request(app)
      .post('/v1/user')
      .set('Authorization', 'Bearer ' + token)
      .send({ firstname: 'Ana', surname: 'Souza', email: 'ana@mail.com', password: '123', confirmPassword: '123' });
    expect(criado.status).toBe(201);
    expect(criado.body.password).toBeUndefined(); // senha nunca volta na resposta

    const consulta = await request(app).get('/v1/user/' + criado.body.id);
    expect(consulta.status).toBe(200);
    expect(consulta.body.email).toBe('ana@mail.com');

    const atualiza = await request(app)
      .put('/v1/user/' + criado.body.id)
      .set('Authorization', 'Bearer ' + token)
      .send({ firstname: 'Ana', surname: 'Lima', email: 'ana.lima@mail.com' });
    expect(atualiza.status).toBe(204);

    const remove = await request(app)
      .delete('/v1/user/' + criado.body.id)
      .set('Authorization', 'Bearer ' + token);
    expect(remove.status).toBe(204);

    const sumiu = await request(app).get('/v1/user/' + criado.body.id);
    expect(sumiu.status).toBe(404);
  });

  test('recusa senhas diferentes com 400', async () => {
    const res = await request(app)
      .post('/v1/user')
      .set('Authorization', 'Bearer ' + token)
      .send({ firstname: 'A', surname: 'B', email: 'a@b.com', password: '1', confirmPassword: '2' });
    expect(res.status).toBe(400);
  });
});

describe('CRUD de categorias (Seção 03)', () => {
  let token;
  beforeAll(async () => { token = await obterToken(); });

  test('fluxo completo com busca paginada e filtro', async () => {
    const auth = { Authorization: 'Bearer ' + token };
    await request(app).post('/v1/category').set(auth).send({ name: 'Tênis', slug: 'tenis', use_in_menu: true });
    await request(app).post('/v1/category').set(auth).send({ name: 'Ofertas', slug: 'ofertas' });

    const lista = await request(app).get('/v1/category/search?limit=-1');
    expect(lista.status).toBe(200);
    expect(lista.body.total).toBe(2);

    const soMenu = await request(app).get('/v1/category/search?limit=-1&use_in_menu=true');
    expect(soMenu.body.total).toBe(1);
    expect(soMenu.body.data[0].name).toBe('Tênis');

    const invalido = await request(app).get('/v1/category/search?limit=abc');
    expect(invalido.status).toBe(400);
  });
});

describe('CRUD de produtos (Seção 04)', () => {
  let token;
  let categoriaId;
  beforeAll(async () => {
    token = await obterToken();
    const res = await request(app)
      .post('/v1/category')
      .set('Authorization', 'Bearer ' + token)
      .send({ name: 'Corrida', slug: 'corrida' });
    categoriaId = res.body.id;
  });

  test('cadastra produto com imagem, opção e categoria', async () => {
    const res = await request(app)
      .post('/v1/product')
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: 'Tênis Runner', slug: 'tenis-runner', price: 199.9, price_with_discount: 149.9,
        stock: 5, description: 'Para corrida', category_ids: [categoriaId],
        images: [{ type: 'image/png', content: PNG }],
        options: [{ title: 'Tamanho', values: ['39', '40'] }],
      });
    expect(res.status).toBe(201);
    expect(res.body.images[0].content).toContain('/uploads/');
    expect(res.body.options[0].values).toEqual(['39', '40']);
    expect(res.body.category_ids).toEqual([categoriaId]);
  });

  test('filtros da busca funcionam', async () => {
    const porTexto = await request(app).get('/v1/product/search?limit=-1&match=runner');
    expect(porTexto.body.total).toBe(1);

    const foraDaJanela = await request(app).get('/v1/product/search?limit=-1&price-range=1-50');
    expect(foraDaJanela.body.total).toBe(0);

    const porCategoria = await request(app).get('/v1/product/search?limit=-1&category_ids=' + categoriaId);
    expect(porCategoria.body.total).toBe(1);
  });

  test('recusa imagem que não é imagem de verdade', async () => {
    const falso = Buffer.from('isso é texto').toString('base64');
    const res = await request(app)
      .post('/v1/product')
      .set('Authorization', 'Bearer ' + token)
      .send({
        name: 'Falso', slug: 'falso', price: 1, price_with_discount: 1,
        images: [{ type: 'image/png', content: falso }],
      });
    expect(res.status).toBe(400);
  });
});
