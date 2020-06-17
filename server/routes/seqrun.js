const { Router } = require('express');
const { Sequelize, Op } = require('sequelize');
const { SeqRun, Publication, Sample } = require('../models');

const router = Router();

const guessSampleId = (idText) => {
  // The sample ID can be either of the two forms: 86009 or EE86009
  // This function always return the trailing digits
  const pattern = /^(EE)?([0-9]+)$/;
  const match = pattern.exec(idText);
  return match ? match[2] : null;
};

/**
 * const obj3 = {
 *  ...obj1,
 *  ...obj2
 * }
 */

/* IN:
//      req: {
//          query: {
//            platform: 'Illumina%20HiSeq%204000,Illumina%20HiSeq%202000,NextSeq%20500',
//            diseases: 'cancer,flu,measles'
//          }
//        }
// OUT:

{
  platform: {
    [Op.in]: [Illumina, Nextseq]
  },
  diseases: {
    [Op.in]: [cancer, flu, measles]
  }
}

*/

// Build the query clause based on sraId, originalId, or canonical Id
// Example: ?sraId=SRR2129993,SRR2129994
function buildIdQueryClause(query) {
  if (!query) return [];

  // Process original ID and SRA IDs
  const idClause = [];
  (query.originalId || '').split(',').forEach((originalId) => {
    if (originalId)
      idClause.push(
        Sequelize.where(Sequelize.literal(`alt_id->>'original'`), originalId)
      );
  });

  (query.sraId || '').split(',').forEach((sraId) => {
    if (sraId)
      idClause.push(
        Sequelize.where(Sequelize.literal(`alt_id->>'SRA'`), sraId)
      );
  });

  (query.ID || '')
    .split(',')
    .map(guessSampleId)
    .forEach((entryId) => {
      if (entryId) idClause.push({ id: entryId });
    });

  if (idClause.length > 0) return [Sequelize.or(...idClause)];
  return [];

  // if (idClause.length > 0) clauses.push(Sequelize.or(...idClause));

  // // for (const originalID of (query['originalId'] || '').split(',')) {
  // //   if (originalID)
  // //     idClause.push(
  // //       Sequelize.where(Sequelize.literal(`alt_id->>'original'`), originalID)
  // //     );
  // // }
  // // if (idClause.length > 0) clauses.push(Sequelize.or(...idClause));

  // idClause = [];

  // if (idClause.length > 0) clauses.push(Sequelize.or(...idClause));

  // // for (const sraID of (query['sraId'] || '').split(',')) {
  // //   if (sraID)
  // //     idClause.push(
  // //       Sequelize.where(Sequelize.literal(`alt_id->>'SRA'`), sraID)
  // //     );
  // // }
  // // if (idClause.length > 0) clauses.push(Sequelize.or(...idClause));

  // idClause = [];
  // (query.ID || '')
  //   .split(',')
  //   .map(guessSampleId)
  //   .forEach((entryId) => {
  //     if (entryId) idClause.push({ id: entryId });
  //   });
  // // for (const entryID of (query['ID'] || '').split(',').map(guessSampleId)) {
  // //   if (entryID) idClause.push({ id: entryID });
  // // }
  // if (idClause.length > 0) clauses.push(Sequelize.or(...idClause));
}

function buildBetweenClause(query) {
  const clauses = [];

  if (!query) return clauses;

  const attrs = ['readlen', 'mbases'];

  attrs.forEach((attr) => {
    if (query[attr] && query[attr].length) {
      // console.log(query[attr]);
      // console.log(query[attr].split(',').map((n) => parseInt(n, 10)));
      const min = parseInt(query[attr].split(',')[0], 10);
      const max = parseInt(query[attr].split(',')[1], 10);
      // console.log(min + ' ' + max)
      if (min && max) {
        switch (attr) {
          case 'readlen':
            clauses.push(
              Sequelize.where(
                Sequelize.literal(`(seq_config->>'readlen')::int`),
                { [Op.between]: [min, max] }
              )
            );
            break;
          case 'mbases':
            clauses.push({
              mbases: {
                [Op.between]: [min, max],
              },
            });
            break;
          default:
            break;
        }
      }
    }
  });

  return clauses;
}

const buildWhereClause = (query) => {
  if (!query) {
    return {};
  }

  const queryIdClauses = buildIdQueryClause(query);
  console.log(queryIdClauses);
  const betweenClauses = buildBetweenClause(query);

  const clauses = Sequelize.and(
    [queryIdClauses, betweenClauses].reduce((acc, ele) => acc.concat(ele), [])
  );

  console.log(clauses);
  // const attrs = ['platform', 'disease', 'tissue', 'doi', 'libraryFormat', 'assayType', 'sraId'];

  return clauses;

  // const result = {}

  // for (const attr of attrs) {
  //   if (query[attr] && query[attr].length) {
  //     result[attr] = { [Op.in]: query[attr].split(',') };
  //   }
  // }

  // return result;
};

// [Op.between]: [6, 10],     // BETWEEN 6 AND 10

const get = async (req, res, next) => {
  // Default limit of query results: 50
  const limit = (req.query || {}).limit || 50;
  const offset = (req.query || {}).offset || 0;
  try {
    // select * from Sample where [...buildWhereClause] and [...buildBetweenClause];
    const whereClause = req.params.sampleId
      ? { id: guessSampleId(req.params.sampleId) }
      : buildWhereClause(req.query);
    const samples = await SeqRun.findAll({
      // where: { ...buildWhereClause(req.query), ...buildBetweenClause(req.query) },
      // where: Sequelize.and(Sequelize.where(Sequelize.literal('alt_id->>\'original\''), "EGAR00002028223")),
      where: whereClause,
      include: [
        { model: Publication, as: 'publication' },
        { model: Sample, as: 'sample' },
      ],
      // TODO
      limit,
      offset,
    });
    const payload = samples.map((s) => {
      const data = s.toJSON();
      data.id = `${s.id}`;

      // Additional mapping:
      // altId->>original => originalId, altId->>SRA => sraId
      data.originalId = (data.altId || {}).original || '';
      data.sraId = (data.altId || {}).SRA || '';
      delete data.altId;

      delete data.sampleId;
      delete data.publicationId;
      return data;
    });
    return res.status(200).json({ count: payload.length, results: payload });
  } catch (e) {
    return next(e);
  }
};

const getCountHandler = (attr) => async (req, res, next) => {
  try {
    const counts = await SeqRun.findAll({
      attributes: [attr, [Sequelize.fn('count', SeqRun.col(attr)), 'count']],
      group: [attr],
    });

    return res.status(200).json(counts);
  } catch (e) {
    return next(e);
  }
};

const getDiseases = getCountHandler('disease');
const getPlatforms = getCountHandler('platform');
const getLibraryFormats = getCountHandler('libraryFormat');
const getTissues = getCountHandler('tissue');
const getAssayTypes = getCountHandler('assayType');
const getDois = getCountHandler('doi');
const getMBases = getCountHandler('mbases');

const getReadLengths = getCountHandler('readLength');

router.get('/', get);
router.get('/:sampleId', get);
router.get('/diseases', getDiseases);
router.get('/platforms', getPlatforms);
router.get('/libraryFormats', getLibraryFormats);
router.get('/tissues', getTissues);
router.get('/assayTypes', getAssayTypes);
router.get('/readLengths', getReadLengths);
router.get('/dois', getDois);
router.get('/mbases', getMBases);

module.exports = router;
