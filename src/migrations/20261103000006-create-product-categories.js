// Migration: cria a tabela "product_categories" (Requisito 06 da Secao 01).
// Tabela de ligacao: um produto pode ter varias categorias e vice-versa.
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_categories', {
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    // Chave primaria composta: o mesmo produto nao entra duas vezes
    // na mesma categoria.
    await queryInterface.addConstraint('product_categories', {
      fields: ['product_id', 'category_id'],
      type: 'primary key',
      name: 'product_categories_pkey',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_categories');
  },
};
