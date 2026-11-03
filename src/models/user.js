// user.js - model da tabela "users" (Requisito 01 da Secao 01).
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false, // campo obrigatorio
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // vai guardar o hash (bcrypt), nao a senha pura
    },
  }, {
    tableName: 'users',
    timestamps: true,            // o enunciado pede timestamps: true
    createdAt: 'created_at',     // nome da coluna exatamente como no enunciado
    updatedAt: 'updated_at',
  });

  return User;
};
