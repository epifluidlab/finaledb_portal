const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.CFDNA_DB_USER || 'zhu1lx', //'postgres' || 
  host: process.env.CFDNA_DB_HOST ||  'cfdna.cbfjin2vxldo.us-east-2.rds.amazonaws.com', // 'localhost', // '216.68.249.18',
  database: process.env.CFDNA_DB_NAME ||  'cfdna', // 'postgres',
  password: process.env.CFDNA_DB_PASSWORD || 'Chmc3634',
  port: 5432,
});

module.exports = pool;
