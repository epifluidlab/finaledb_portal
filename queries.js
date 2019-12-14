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
  // TODO: match with master disease list
  const counts = countOccurrences(rows, 'instrument');
  counts['Illumina HiSeq 2500'] = 0;
  counts['Illumina HiSeq 4000'] = 0;
  counts['HiSeq X Ten'] = 0;
  counts['NovaSeq 6000'] = 0;
  counts['NextSeq 500'] = 0;

  return countsToArray(counts);
}


function getLibraryLayouts(rows) {
  // TODO: match with master disease list
  const counts = countOccurrences(rows, 'libraryFormat');
  counts.SINGLE = 0;

  return countsToArray(counts);
}


function getReadLengths(rows) {
  // TODO: match with master disease list
  return countsToArray(countOccurrences(rows, 'readLength'));
}

function getTissues(rows) {
  // TODO: match with master disease list
  return countsToArray(countOccurrences(rows, 'tissue'));
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
    const libraryLayoutList = getLibraryLayouts(samplesList);
    const readLengthList = getReadLengths(samplesList);

    // send data
    response.status(200).json({
      diseases: diseaseList,
      platforms: platformList,
      libraryLayouts: libraryLayoutList,
      readLengths: readLengthList,

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
