// Seeder OPCIONAL de desenvolvimento: cria o primeiro usuario da API.
// Por que ele existe? O enunciado manda proteger TODOS os POST, PUT e DELETE
// com token - inclusive o cadastro de usuario. Sem um primeiro usuario,
// seria impossivel comecar (para ter token precisa de usuario, para criar
// usuario precisa de token). Este seeder quebra esse ciclo.
//
// As credenciais NAO ficam no codigo nem no Git: defina no seu .env local
// (que fica fora do GitHub) antes de rodar:
//   SEED_USER_EMAIL=voce@email.com
//   SEED_USER_PASSWORD=uma-senha-que-so-voce-sabe
//
// Rode com: npx sequelize-cli db:seed:all
'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const email = process.env.SEED_USER_EMAIL;
    const senha = process.env.SEED_USER_PASSWORD;

    if (!email || !senha) {
      throw new Error(
        'Defina SEED_USER_EMAIL e SEED_USER_PASSWORD no seu arquivo .env antes de rodar o seed.'
      );
    }

    const hash = await bcrypt.hash(senha, 10);
    await queryInterface.bulkInsert('users', [{
      firstname: 'Usuario',
      surname: 'de Desenvolvimento',
      email,
      password: hash,
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    console.log('Usuario inicial criado para o e-mail:', email);
  },

  async down(queryInterface) {
    if (process.env.SEED_USER_EMAIL) {
      await queryInterface.bulkDelete('users', { email: process.env.SEED_USER_EMAIL });
    }
  },
};
