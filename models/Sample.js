const { Model, DataTypes } = require('sequelize');
const db = require('../db');

class Sample extends Model {
  static col(attribute) {
    const attrOptions = this.rawAttributes[attribute];
      const field = (attrOptions && attrOptions.field) || attribute;
      return this.sequelize.col(field);
  }
}

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
  libraryFormat: {
    type: DataTypes.STRING,
    field: 'library_format',
  },
  platform: {
    type: DataTypes.STRING,
    field: 'instrument',
  },
  assayType: {
    type: DataTypes.STRING,
    field: 'assay_type',
  },
  readLength: DataTypes.NUMBER,
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
