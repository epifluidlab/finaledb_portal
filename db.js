const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.CFDNA_DB_USER || 'postgres',
  host: process.env.CFDNA_DB_HOST || 'localhost', // '216.68.249.18',
  database: process.env.CFDNA_DB_NAME || 'cfdna',
  password: process.env.CFDNA_DB_PASSWORD || 'postgres',
  port: 5432,
});

module.exports = pool;
