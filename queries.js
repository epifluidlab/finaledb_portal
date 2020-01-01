const { Publication, Sample } = require('./models');

const countOccurrences = (rows, key) => rows.reduce((acc, row) => {
  const prop = row[key];
  acc[prop] = acc[prop] ? acc[prop] + 1 : 1;
  return acc;
}, {});

const countsToArray = (counts) => Object.keys(counts).map((key) => [key, counts[key]]);

function getDiseases(rows) {
  // TODO: match with master disease list
  return countsToArray(countOccurrences(rows, 'disease'));
}

function getPlatforms(rows) {
  const counts = countOccurrences(rows, 'instrument');

  return countsToArray(counts);
}

function getLibraryFormats(rows) {
  const counts = countOccurrences(rows, 'libraryFormat');
  counts.SINGLE = 0;

  return countsToArray(counts);
}

function getTissues(rows) {
  return countsToArray(countOccurrences(rows, 'tissue'));
}

function getAssayTypes(rows) {
  return countsToArray(countOccurrences(rows, 'assayType'));
}

function getReadLengthRange(rows) {
  return countsToArray(countOccurrences(rows, 'readLength'));
}

function getDois(rows) {
  return countsToArray(countOccurrences(rows, 'doi'));
}

const getData = async (request, response) => {
  try {
    const samples = await Sample.findAll();

    // get each sample
    const samplesList = samples.map((row) => ({
      ...row.toJSON(),
    }));

    // get metadata stats for all samples
    const diseaseList = getDiseases(samplesList);
    const platformList = getPlatforms(samplesList);
    const libraryFormatList = getLibraryFormats(samplesList);
    const tissueList = getTissues(samplesList);
    const assayTypeList = getAssayTypes(samplesList);
    const doiList = getDois(samplesList);

    const readLengthRange = getReadLengthRange(samplesList);

    console.log(tissueList);
    console.log(assayTypeList);
    console.log(readLengthRange)
    console.log("doi list " + doiList)


    // send data
    response.status(200).json({
      diseases: diseaseList,
      platforms: platformList,
      libraryFormats: libraryFormatList,
      tissues: tissueList,
      assayTypes: assayTypeList,
      dois: doiList,

      readLengths: readLengthRange,

      samples: samplesList,
    });
  } catch (e) {
    response.status(500).json(e);
  }
};


const getPublications = async (request, response) => {
  try {
    const publications = await Publication.findAll();

    response.status(200).json({
      publications,
    });
  } catch (e) {
    response.status(500).json(e);
  }
};


module.exports = {
  getData,
  getPublications,
};
