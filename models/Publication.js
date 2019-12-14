const { Model, DataTypes } = require('sequelize');
const db = require('../db');

class Publication extends Model { }

Publication.init({
  author: DataTypes.STRING,
  journal: DataTypes.STRING,
  date: DataTypes.STRING,
  pmid: DataTypes.NUMBER,
  doi: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  datastore: DataTypes.STRING,
  title: DataTypes.STRING,
  link: DataTypes.STRING,
}, {
  sequelize: db,
  tableName: 'publications',
  underscored: true,
  timestamps: false,
});

module.exports = Publication;
