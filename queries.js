const Pool = require('pg').Pool
const pool = new Pool({
  user: 'zhu1lx',
  host:  'localhost', // '216.68.249.18',
  database: 'postgres',
  password: 'Chmc3634',
  port: 5432,
})


function getDiseases (rows) {
    // TODO: match with master disease list
    var diseases = new Map();

    for (const row of rows) {
      if ( !diseases.has(row.disease)) {
        diseases.set(row.disease, 0);
      }
      
      diseases.set(row.disease, diseases.get(row.disease) + 1);
      // console.log(row.disease);
      // console.log(diseases.get(row.disease));
    }
    
    return Array.from(diseases);
}


function getPlatforms (rows) {
  // TODO: match with master disease list
  var platforms = new Map();

  for (const row of rows) {
    if ( !platforms.has(row.platform)) {
      platforms.set(row.platform, 0);
    }
    
    platforms.set(row.platform, platforms.get(row.platform) + 1);
    // console.log(row.disease);
    // console.log(diseases.get(row.disease));
  }
  
  return Array.from(platforms);
}


function getLibraryLayouts (rows) {
    // TODO: match with master disease list
    var libraryLayouts = new Map();

    for (const row of rows) {
      if ( !libraryLayouts.has(row.se_pe)) {
        libraryLayouts.set(row.se_pe, 0);
      }
      
      libraryLayouts.set(row.se_pe, libraryLayouts.get(row.se_pe) + 1);
      // console.log(row.disease);
      // console.log(diseases.get(row.disease));
    }
    
    return Array.from(libraryLayouts);
}


function getReadLengths (rows) {
  // TODO: match with master disease list
  var readLengths = new Map();

  for (const row of rows) {
    if ( !readLengths.has(row.read_length)) {
      readLengths.set(row.read_length, 0);
    }
    
    readLengths.set(row.read_length, readLengths.get(row.read_length) + 1);
    // console.log(row.disease);
    // console.log(diseases.get(row.disease));
  }
  
  return Array.from(readLengths);
}

const getData = (request, response) => {
    pool.query('SELECT * FROM metadata', (error, results) => {
      if (error) {
        throw error
      }


      var diseaseList = getDiseases (results.rows);
      var platformList = getPlatforms (results.rows);
      var libraryLayoutList = getLibraryLayouts (results.rows);
      var readLengthList = getReadLengths (results.rows);

      console.log(readLengthList);

      response.status(200).json({ 
        diseases: diseaseList,
        platforms: platformList,
        libraryLayouts: libraryLayoutList,
        readLengths: readLengthList
      });
    })

  }


const getPublications = (request, response) => {
  pool.query('SELECT * FROM publications', (error, results) => {
    if (error) {
      throw error
    }


    var publicationsList = [];

    for (const row of results.rows) {
      var publication = {
        author: row.pub_author,
        year: row.pub_year,
        journal: row.pub_journal,
        pmid: row.pmid,
        doi: row.doi,
        link: row.link,
      };

      publicationsList.push (publication);
    }

    console.log(publicationsList);

    response.status(200).json({ 
      publications: publicationsList,
    });

  });

}


  module.exports = {
    getData,
    getPublications,
  }