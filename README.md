# Digital Store - Backend

API da loja Digital Store, projeto backend do curso Full Stack (Digital College).

## Tecnologias

Node.js, Express, Dotenv, Nodemon. Nas próximas etapas entram MySQL, Sequelize, JWT, bcrypt e Jest.

## Como rodar

1. Instale o Node.js (versão 18 ou superior).
2. Clone este repositório e entre na pasta.
3. Rode `npm install` para baixar as dependências.
4. Copie o arquivo `.env.example` para `.env` e ajuste se precisar.
5. Rode `npm run dev` para desenvolvimento (reinicia sozinho a cada mudança).

A API sobe em http://localhost:3000.

## Estrutura de pastas

```
src/
  config/       configurações (banco de dados, etc.)
  controllers/  recebem as requisições e devolvem as respostas
  middleware/   verificações antes da rota (ex.: token JWT)
  models/       tabelas do banco (Sequelize)
  routes/       endereços da API
  services/     regras de negócio
  app.js        configuração do Express
  server.js     liga o servidor
tests/          testes automatizados (Jest)
```

## Etapas do projeto

- [x] Etapa 1 - Estrutura, Express e configuração inicial
- [ ] Etapa 2 - Banco de dados e tabelas (MySQL + Sequelize)
- [ ] Etapa 3 - CRUD de usuários
- [ ] Etapa 4 - CRUD de categorias
- [ ] Etapa 5 - CRUD de produtos
- [ ] Etapa 6 - Login com JWT
- [ ] Etapa 7 - Documentação (Swagger) e testes
