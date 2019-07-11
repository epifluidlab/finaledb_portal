const Pool = require('pg').Pool
const pool = new Pool({
  user: 'zhu1lx',
  host:  'localhost', // '216.68.249.18',
  database: 'postgres',
  password: 'Chmc3634',
  port: 5432,
})




const getUsers = (request, response) => {
    pool.query('SELECT * FROM metadata', (error, results) => {
      if (error) {
        throw error
      }
      
      var diseases = new Map();
      var total = 0;
      for (const row of results.rows) {
        if ( !diseases.has(row.disease)) {
          diseases.set(row.disease, 0);
        }
        
        diseases.set(row.disease, diseases.get(row.disease) + 1);
        total = total + 1;
        console.log(row.disease);
        console.log(diseases.get(row.disease));
      }

      
      var diseasesList = Array.from(diseases);
      console.log(diseasesList);

      //response.send ({ nice: diseases.get('Healthy') });
      response.status(200).json( { nice: diseasesList });
    })
  }


  module.exports = {
    getUsers,
  }