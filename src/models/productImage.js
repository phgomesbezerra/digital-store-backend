// productImage.js - model da tabela "product_images" (Requisito 04 da Secao 01).
module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define('ProductImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'products', key: 'id' }, // chave estrangeira
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'product_images',
    timestamps: false, // o enunciado nao pede timestamps nesta tabela
  });

  return ProductImage;
};
