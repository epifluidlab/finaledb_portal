const { Sequelize } = require('sequelize');

const dbName = process.env.FINALEDB_NAME;
const dbUser = process.env.FINALEDB_USER;
const dbPass = process.env.FINALEDB_PASSWORD;
const dbHost = process.env.FINALEDB_HOST;

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;