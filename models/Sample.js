const { Model, DataTypes } = require('sequelize');
const db = require('../db');

class Sample extends Model {
  // static col(attribute) {
  //   const attrOptions = this.rawAttributes[attribute];
  //     const field = (attrOptions && attrOptions.field) || attribute;
  //     return this.sequelize.col(field);
  // }
}

Sample.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  altId: DataTypes.JSON,
  comment: DataTypes.TEXT,
  analysis: DataTypes.JSON
  // publication: {
  //   type: DataTypes.INTEGER,
  //   references: {
  //     model: 'publication',
  //     key: 'id'
  //   }
  // }
  
  // age: DataTypes.NUMBER,
  // sex: DataTypes.STRING,
  // libraryFormat: {
  //   type: DataTypes.STRING,
  //   field: 'library_format',
  // },
  // platform: {
  //   type: DataTypes.STRING,
  //   field: 'instrument',
  // },
  // assayType: {
  //   type: DataTypes.STRING,
  //   field: 'assay_type',
  // },
  // doi: {
  //   type: DataTypes.STRING,
  //   field: 'doi',
  // },
  // mbases: DataTypes.STRING,
  // readLength: DataTypes.NUMBER,
  // mbases: DataTypes.NUMBER,
  // tissue: DataTypes.STRING,
  // other: DataTypes.STRING,
  // disease: DataTypes.STRING,
}, {
  sequelize: db,
  schema: 'dev',
  tableName: 'seqrun',
  underscored: true,
  timestamps: false,
});

module.exports = Sample;
