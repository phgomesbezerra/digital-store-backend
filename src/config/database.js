// database.js - configuracao da conexao com o MySQL.
// Os valores vem do arquivo .env, que NAO vai para o GitHub.
// O sequelize-cli le este arquivo para rodar as migrations.
require('dotenv').config();

module.exports = {
  development: {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    // Nome do banco padronizado do projeto: digitalcollegebr
    database: process.env.DB_NAME || 'digitalcollegebr',
    logging: false,
  },
  // Ambiente usado pelos testes automatizados (Jest).
  // O nome do banco NAO e fixo: cada rodada de teste cria o seu, com nome
  // unico, e apaga so o que ela mesma criou (veja tests/api.test.js).
  test: {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME_TEST || 'digitalcollegebr_test_temporario',
    logging: false,
  },
};
