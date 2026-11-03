// productCategory.js - tabela de ligacao entre produtos e categorias
// (Requisito 06 da Secao 01). Um produto pode ter varias categorias
// e uma categoria pode ter varios produtos (relacao muitos-para-muitos).
module.exports = (sequelize, DataTypes) => {
  const ProductCategory = sequelize.define('ProductCategory', {
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'products', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'categories', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'product_categories',
    timestamps: false,
  });

  return ProductCategory;
};
