const { Model, DataTypes } = require('sequelize');
const db = require('../db');
const SeqRun = require('./SeqRun');

class Publication extends Model {}

Publication.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    author: DataTypes.JSON,
    journal: DataTypes.TEXT,
    date: DataTypes.DATE,
    identifiers: DataTypes.JSON,
    citeShort: DataTypes.TEXT,
    // pmid: DataTypes.NUMBER,
    // doi: {
    //   type: DataTypes.STRING,
    //   primaryKey: true,
    // },
    // datastore: DataTypes.STRING,
    title: DataTypes.TEXT,
    link: DataTypes.TEXT,
  },
  {
    sequelize: db,
    schema: 'dev',
    tableName: 'publication',
    underscored: true,
    timestamps: false,
  }
);

// Publication.hasMany(Sample, { foreignKey: 'publication', as: 'publication_id'});
// Sample.belongsTo(Publication, { foreignKey: 'publication', as: 'publication_id'});

// Publication.hasMany(SeqRun, { foreignKey: 'publicationId', as: 'publication' });
SeqRun.belongsTo(Publication, {
  foreignKey: 'publicationId',
  as: 'publication',
});

module.exports = Publication;
