// productOption.js - model da tabela "product_options" (Requisito 05 da Secao 01).
module.exports = (sequelize, DataTypes) => {
  const ProductOption = sequelize.define('ProductOption', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'products', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shape: {
      type: DataTypes.ENUM('square', 'circle'), // enum: so aceita estes valores
      defaultValue: 'square',
    },
    radius: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM('text', 'color'),
      defaultValue: 'text',
    },
    values: {
      type: DataTypes.STRING, // valores separados por virgula, ex.: "39,40,41"
      allowNull: false,
    },
  }, {
    tableName: 'product_options',
    timestamps: false,
  });

  return ProductOption;
};
