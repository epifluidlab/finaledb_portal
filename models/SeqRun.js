const { Model, DataTypes } = require('sequelize');
const db = require('../db');

class SeqRun extends Model {
  // static col(attribute) {
  //   const attrOptions = this.rawAttributes[attribute];
  //     const field = (attrOptions && attrOptions.field) || attribute;
  //     return this.sequelize.col(field);
  // }
}

SeqRun.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    altId: DataTypes.JSON,
    assay: DataTypes.TEXT,
    mbases: DataTypes.INTEGER,
    analysis: DataTypes.JSON,
    seqConfig: DataTypes.JSON,
    fragNum: DataTypes.JSONB,

    // comment: DataTypes.TEXT,
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
  },
  {
    sequelize: db,
    schema: 'dev',
    tableName: 'seqrun',
    underscored: true,
    timestamps: false,
  }
);

module.exports = SeqRun;
