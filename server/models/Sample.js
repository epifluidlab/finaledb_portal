const { Model, DataTypes } = require('sequelize');
const db = require('../db');
const SeqRun = require('./SeqRun');

class Sample extends Model {}

Sample.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    altId: DataTypes.JSON,
    name: DataTypes.TEXT,
    age: DataTypes.INTEGER,
    gender: DataTypes.TEXT,
    tissue: DataTypes.TEXT,
    disease: DataTypes.TEXT,
    // pathological: DataTypes.JSON,
  },
  {
    sequelize: db,
    schema: 'dev',
    tableName: 'sample',
    underscored: true,
    timestamps: false,
  }
);

// Publication.hasMany(Sample, { foreignKey: 'publication', as: 'publication_id'});
// Sample.belongsTo(Publication, { foreignKey: 'publication', as: 'publication_id'});

// Sample.hasMany(SeqRun, { foreignKey: 'publicationId', as: 'publication' });
SeqRun.belongsTo(Sample, {
  foreignKey: 'sampleId',
  as: 'sample',
});

module.exports = Sample;
