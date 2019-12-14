const { Model, DataTypes } = require('sequelize');
const db = require('../db');

class Sample extends Model { }

Sample.init({
  sampleName: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  sraId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  age: DataTypes.NUMBER,
  sex: DataTypes.STRING,
  libraryFormat: DataTypes.STRING,
  datatype: {
    type: DataTypes.STRING,
    field: 'instrument',
  },
  readLength: DataTypes.NUMBER,
  assayType: DataTypes.STRING,
  mbases: DataTypes.NUMBER,
  tissue: DataTypes.STRING,
  other: DataTypes.STRING,
  disease: {
    type: DataTypes.STRING,
    get() {
      const disease = this.getDataValue('disease');
      return disease.replace(/\(.*\)/g, '').trim();
    },
  },
}, {
  sequelize: db,
  tableName: 'metadata',
  underscored: true,
  timestamps: false,
});

module.exports = Sample;
