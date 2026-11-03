// index.js - ponto de entrada dos models.
// Cria a conexao com o banco, carrega cada model e define
// como as tabelas se relacionam entre si.
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database').development;

// Cria a conexao (so conecta de verdade quando faz a primeira consulta).
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Carrega os models.
const User = require('./user')(sequelize, DataTypes);
const Category = require('./category')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const ProductImage = require('./productImage')(sequelize, DataTypes);
const ProductOption = require('./productOption')(sequelize, DataTypes);
const ProductCategory = require('./productCategory')(sequelize, DataTypes);

// Associacoes (como as tabelas conversam entre si):
// Um produto tem varias imagens e varias opcoes.
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(ProductOption, { foreignKey: 'product_id', as: 'options' });
ProductOption.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Produto e categoria: relacao muitos-para-muitos pela tabela product_categories.
Product.belongsToMany(Category, { through: ProductCategory, foreignKey: 'product_id', otherKey: 'category_id', as: 'categories' });
Category.belongsToMany(Product, { through: ProductCategory, foreignKey: 'category_id', otherKey: 'product_id', as: 'products' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  ProductOption,
  ProductCategory,
};
