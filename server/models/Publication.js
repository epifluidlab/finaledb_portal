const { Model, DataTypes } = require('sequelize');
const db = require('../db');
const Sample = require('./Sample');

class Publication extends Model { }

Publication.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  author: DataTypes.JSON,
  journal: DataTypes.TEXT,
  date: DataTypes.DATE,
  identifiers: DataTypes.JSON,
  // pmid: DataTypes.NUMBER,
  // doi: {
  //   type: DataTypes.STRING,
  //   primaryKey: true,
  // },
  // datastore: DataTypes.STRING,
  title: DataTypes.TEXT,
  link: DataTypes.TEXT,
}, {
  sequelize: db,
  schema: 'dev',
  tableName: 'publication',
  underscored: true,
  timestamps: false,
});

// Publication.hasMany(Sample, { foreignKey: 'publication', as: 'publication_id'});
// Sample.belongsTo(Publication, { foreignKey: 'publication', as: 'publication_id'});

Publication.hasMany(Sample, {foreignKey: 'publicationId', as: 'publication'});
Sample.belongsTo(Publication, { foreignKey: 'publicationId', as: 'publication'});

module.exports = Publication;