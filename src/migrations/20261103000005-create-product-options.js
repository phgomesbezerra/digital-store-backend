// Migration: cria a tabela "product_options" (Requisito 05 da Secao 01).
// Depende da tabela "products" (chave estrangeira).
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_options', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shape: {
        type: Sequelize.ENUM('square', 'circle'), // enum: so aceita estes valores
        defaultValue: 'square',
      },
      radius: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      type: {
        type: Sequelize.ENUM('text', 'color'),
        defaultValue: 'text',
      },
      values: {
        type: Sequelize.STRING, // valores separados por virgula, ex.: "39,40,41"
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_options');
  },
};
