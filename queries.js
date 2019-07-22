const db = require('./db');

function getDiseases (rows) {
    // TODO: match with master disease list
    var diseases = new Map();

    for (const row of rows) {
      end_index = row.disease.indexOf('(') - 1;
      general_disease = row.disease;

      if (end_index != -1) {
        general_disease = general_disease.substring(0, end_index);
      }

      if ( !diseases.has(general_disease)) {
        diseases.set(general_disease, 0);
      }

      diseases.set(general_disease, diseases.get(general_disease) + 1);
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

    //readLengthsList.push (readLength);
  }
  return Array.from(readLengths);

}

const getData = (request, response) => {
    db.query('SELECT * FROM metadata', (error, results) => {
      if (error) {
        throw error
      }

      // get each sample
      var samplesList = [];

      for (const row of results.rows) {
        var sample = {
          sample_name: row.sample_name,
          sra_id: row.sra_id,
          doi: row.doi,
          link: row.link,
          age: row.age,
          sex: row.sex,
          se_pe: row.se_pe,
          platform: row.platform,
          read_length: row.read_length,
          datatype: row.datatype,
          disease: row.disease,
        };
        samplesList.push (sample);
      }



      // get metadata stats for all samples
      var diseaseList = getDiseases (results.rows);
      var platformList = getPlatforms (results.rows);
      var libraryLayoutList = getLibraryLayouts (results.rows);
      var readLengthList = getReadLengths (results.rows);


      // send data
      response.status(200).json({
        diseases: diseaseList,
        platforms: platformList,
        libraryLayouts: libraryLayoutList,
        readLengths: readLengthList,

        samples: samplesList,
      });
    })

  }


const getPublications = (request, response) => {
  db.query('SELECT * FROM publications', (error, results) => {
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