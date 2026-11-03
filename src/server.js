// server.js - o arquivo que liga o servidor de verdade.
// Lê as configurações do arquivo .env e coloca o app para ouvir requisições.
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
