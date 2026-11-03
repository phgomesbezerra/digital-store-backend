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
};
