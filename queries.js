const db = require('./db');

const sanitizeDiseaseName = (name) => name.replace(/\(.*\)/g, '').trim();

const countOccurrences = (rows, key) => rows.reduce((acc, row) => {
  const prop = row[key];
  acc[prop] = acc[prop] ? acc[prop] + 1 : 1;
  return acc;
}, {});

const countsToArray = (counts) => Object.keys(counts).map((key) => [key, counts[key]]);

function getDiseases (rows) {
    // TODO: match with master disease list
    const cleanedRows = rows.map((row) => ({
      ...row,
      disease: sanitizeDiseaseName(row.disease),
    }));

    return countsToArray(countOccurrences(cleanedRows, 'disease'));
}


function getPlatforms (rows) {
  // TODO: match with master disease list
  const counts = countOccurrences(rows, 'instrument');
  counts['Illumina HiSeq 2500'] = 0;
  counts['Illumina HiSeq 4000'] = 0;
  counts['HiSeq X Ten'] = 0;
  counts['NovaSeq 6000'] = 0;
  counts['NextSeq 500'] = 0;

  return countsToArray(counts);
}


function getLibraryLayouts (rows) {
    // TODO: match with master disease list
    const counts = countOccurrences(rows, 'library_format');
    counts['SINGLE'] = 0;

    return countsToArray(counts);
}


function getReadLengths (rows) {
  // TODO: match with master disease list
  return countsToArray(countOccurrences(rows, 'read_length'));
}

function getTissues (rows) {
  // TODO: match with master disease list
  return countsToArray(countOccurrences(rows, 'tissue'));
}

const getData = (request, response) => {
    db.query('SELECT * FROM metadata', (error, results) => {
      if (error) {
        throw error
      }

      // get each sample
      const samplesList = results.rows.map((row) => ({
        sample_name: row.sample_name,
        sra_id: row.sra_id,
        doi: row.doi,
        link: row.link,
        age: row.age,
        sex: row.sex,
        library_format: row.library_format,
        platform: row.instrument,
        read_length: row.read_length,
        datatype: row.assay_type,
        disease: sanitizeDiseaseName(row.disease),
      }));

      // get metadata stats for all samples
      const diseaseList = getDiseases (results.rows);
      const platformList = getPlatforms (results.rows);
      const libraryLayoutList = getLibraryLayouts (results.rows);
      const readLengthList = getReadLengths (results.rows);

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


    const publicationsList = results.rows

    response.status(200).json({
      publications: publicationsList,
    });

  });

}


  module.exports = {
    getData,
    getPublications,
  }