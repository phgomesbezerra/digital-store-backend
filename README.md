# Digital Store - Backend

API da loja Digital Store, projeto backend do curso Full Stack (Digital College).

## Tecnologias

Node.js, Express, Dotenv, Nodemon, MySQL e Sequelize. Nas próximas etapas entram JWT, bcrypt e Jest.

## Como rodar

1. Instale o Node.js (versão 18 ou superior).
2. Clone este repositório e entre na pasta.
3. Rode `npm install` para baixar as dependências.
4. Copie o arquivo `.env.example` para `.env` e preencha com os dados do seu MySQL local.
5. Crie o banco de dados no MySQL: `CREATE DATABASE digitalcollegebr;`
6. Rode `npx sequelize-cli db:migrate` para criar as tabelas.
8. Rode `npm run dev` para desenvolvimento (reinicia sozinho a cada mudança).

A API sobe em http://localhost:3000.

## Estrutura de pastas

```
src/
  config/       configurações (conexão com o banco)
  controllers/  recebem as requisições e devolvem as respostas
  middleware/   verificações antes da rota (ex.: token JWT)
  migrations/   scripts que criam as tabelas no banco
  models/       tabelas do banco (Sequelize)
  routes/       endereços da API
  services/     regras de negócio
  app.js        configuração do Express
  server.js     liga o servidor
tests/          testes automatizados (Jest)
```

## Etapas do projeto

- [x] Etapa 1 - Estrutura, Express e configuração inicial
- [x] Etapa 2 - Banco de dados e tabelas (MySQL + Sequelize)
- [x] Etapa 3 - CRUD de usuários
- [x] Etapa 4 - CRUD de categorias
- [x] Etapa 5 - CRUD de produtos
- [x] Etapa 6 - Login com JWT
- [ ] Etapa 7 - Documentação (Swagger) e testes

## Banco de dados

O banco se chama `digitalcollegebr` e tem 6 tabelas:

- `users` - usuários do sistema (a senha é guardada como hash, nunca em texto puro)
- `categories` - categorias de produtos (ex.: Tênis, Camisetas)
- `products` - produtos da loja
- `product_images` - imagens de cada produto
- `product_options` - opções de cada produto (ex.: tamanhos 39,40,41 ou cores)
- `product_categories` - ligação entre produtos e categorias (um produto pode estar em várias categorias)

As tabelas são criadas pelas migrations (`npx sequelize-cli db:migrate`). Para desfazer a última: `npx sequelize-cli db:migrate:undo`.

## Endpoints de produtos

| Método | Endereço | O que faz | Respostas |
|--------|----------|-----------|-----------|
| GET | `/v1/product/search` | Lista produtos com paginação e filtros | 200, 400 |
| GET | `/v1/product/:id` | Busca um produto pelo ID | 200, 404 |
| POST | `/v1/product` | Cadastra produto com imagens, opções e categorias | 201, 400 |
| PUT | `/v1/product/:id` | Atualiza o produto (dá para trocar/apagar imagens e opções) | 204, 400, 404 |
| DELETE | `/v1/product/:id` | Remove o produto (e apaga os arquivos de imagem) | 204, 404 |

Filtros da busca: `match` (procura no nome e na descrição), `category_ids=1,2`, `price-range=100-200` e `option[ID]=valor1,valor2` (ex.: `option[45]=GG,PP`). As imagens são enviadas em base64 no cadastro e ficam acessíveis em `/uploads/nome-do-arquivo.png`.

## Endpoints de categorias

| Método | Endereço | O que faz | Respostas |
|--------|----------|-----------|-----------|
| GET | `/v1/category/search` | Lista categorias com paginação e filtros | 200, 400 |
| GET | `/v1/category/:id` | Busca uma categoria pelo ID | 200, 404 |
| POST | `/v1/category` | Cadastra categoria | 201, 400 |
| PUT | `/v1/category/:id` | Atualiza a categoria | 204, 400, 404 |
| DELETE | `/v1/category/:id` | Remove a categoria | 204, 404 |

A busca aceita parâmetros na URL: `limit` (itens por página, `-1` traz todos, padrão 12), `page` (página, padrão 1), `fields` (limita os campos, ex.: `fields=name,slug`) e `use_in_menu=true` (só categorias do menu).

## Endpoints de usuários

| Método | Endereço | O que faz | Respostas |
|--------|----------|-----------|-----------|
| GET | `/v1/user/:id` | Busca um usuário pelo ID | 200, 404 |
| POST | `/v1/user` | Cadastra usuário (senha vira hash) | 201, 400 |
| PUT | `/v1/user/:id` | Atualiza nome e e-mail | 204, 400, 404 |
| DELETE | `/v1/user/:id` | Remove o usuário | 204, 404 |

A senha nunca é salva em texto puro: usamos bcrypt para guardar só o hash. A resposta da API nunca devolve a senha.

**Atenção:** todos os endpoints de escrita (POST, PUT, DELETE) exigem o cabeçalho `Authorization: Bearer <token>`. Para conseguir um token, use o login abaixo. Os endpoints de leitura (GET) são públicos. Observação: este projeto só tem "usuário logado" ou "não logado" - não há papéis (admin, cliente etc.), então qualquer usuário com token pode alterar qualquer dado. Isso é o que o enunciado pede.

## Login (token JWT)

| Método | Endereço | O que faz | Respostas |
|--------|----------|-----------|-----------|
| POST | `/v1/user/token` | Recebe e-mail e senha, devolve o token | 200, 400 |

Use o token no cabeçalho `Authorization: Bearer <token>` em todos os POST, PUT e DELETE. O token vale por 1 dia. Observação: o enunciado se contradiz - a Seção 05 pede status 400 para token ausente/inválido, mas as tabelas dos endpoints dizem 401. Por ora o código responde 400 (Seção 05), mas isso está em confirmação com o monitor; trocar é uma linha em `src/middleware/auth.js`.
