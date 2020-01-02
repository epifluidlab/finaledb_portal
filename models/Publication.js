const { Model, DataTypes } = require('sequelize');
const db = require('../db');
const Sample = require('./Sample');

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

Publication.hasMany(Sample, { foreignKey: 'doi' });
Sample.belongsTo(Publication, { foreignKey: 'doi', as: 'publication' });

module.exports = Publication;
