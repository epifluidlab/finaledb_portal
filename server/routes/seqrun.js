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

// Filters such as assay, disease, etc
function buildFacetFilterClause(query) {
  if (!query) return {};

  const plainCLauseMap = {};
  const complexClauseList = [];

  const fieldsMap = {
    id: 'id',
    sraId: Sequelize.literal(`"SeqRun".alt_id->>'SRA'`),
    originalId: Sequelize.literal(`SeqRun.alt_id->>'original'`),
    assay: 'assay',
    sample_name: Sequelize.literal('sample.name'),
    disease: Sequelize.literal('sample.disease'),
    tissue: Sequelize.literal('sample.tissue'),
    instrument: Sequelize.literal(`seq_config->>'instrument'`),
    publication: 'publication_id',
  };

  Object.keys(fieldsMap).forEach((filterName) => {
    if (query[filterName] && query[filterName].length > 0) {
      const filterValues = query[filterName].split(',');

      if (
        [
          'instrument',
          'tissue',
          'disease',
          'sample_name',
          'sraId',
          'originalId',
        ].includes(filterName)
      ) {
        complexClauseList.push(
          Sequelize.where(fieldsMap[filterName], {
            [Op.in]: filterValues,
          })
        );
      } else if (filterName === 'id') {
        // Special handling: remove the leading 'EE'
        const entryIdList = filterValues.map((v) =>
          parseInt(v.substring(2), 10)
        );
        plainCLauseMap.id = { [Op.in]: entryIdList };
      } else {
        plainCLauseMap[fieldsMap[filterName]] = { [Op.in]: filterValues };
      }
    }
  });

  const clauses = { ...plainCLauseMap };
  if (complexClauseList.length > 0) {
    clauses[Op.and] = complexClauseList;
  }
  console.log('clauseList');
  console.log(clauses);
  return clauses;
}

function buildRangeClause(query) {
  const plainCLauseMap = {};
  const complexClauseList = [];

  if (!query) return {};

  const attrs = ['readlen', 'mbases'];

  attrs.forEach((attr) => {
    if (query[attr] && query[attr].length > 0) {
      const min = parseInt(query[attr].split(',')[0], 10);
      const max = parseInt(query[attr].split(',')[1], 10);

      switch (attr) {
        case 'readlen':
          complexClauseList.push(
            Sequelize.where(
              Sequelize.literal(`(seq_config->>'readlen')::int`),
              { [Op.between]: [min, max] }
            )
          );
          break;
        case 'mbases':
          plainCLauseMap.mbases = { [Op.between]: [min, max] };
          break;
        default:
          break;
      }
    }
  });

  const clauses = { ...plainCLauseMap };
  if (complexClauseList.length > 0) {
    clauses[Op.and] = complexClauseList;
  }

  return clauses;
}

const buildSearchClause = (query) => {
  const { search } = query;
  if (!search || search.length === 0) return {};

  const clauseList = [];

  const entryIdMatch = search.match(/EE([0-9]+)/);
  if (entryIdMatch) {
    const entryId = parseInt(entryIdMatch[1], 10);
    clauseList.push({ id: entryId });
  }
  if (search.startsWith('SRR')) {
    clauseList.push(
      Sequelize.where(Sequelize.literal(`"SeqRun".alt_id->>'SRA'`), search)
    );
  }
  clauseList.push(Sequelize.where(Sequelize.literal(`"sample".name`), search));

  return { [Op.or]: clauseList };
};

const buildWhereClause = (query) => {
  if (!query) {
    return {};
  }

  // const queryIdClauses = buildIdQueryClause(query);
  // console.log(queryIdClauses);
  // const betweenClauses = buildBetweenClause(query);
  const searchClauses = buildSearchClause(query);
  const rangeClauses = buildRangeClause(query);
  const facetClauses = buildFacetFilterClause(query);

  // const clauses = { [Op.and]: [queryIdClauses, rangeClauses, facetClauses] };
  const clauses = {
    [Op.and]: [searchClauses, rangeClauses, facetClauses],
    hidden: { [Op.ne]: true },
  };
  console.log(clauses);

  // const multiValClauses = buildMultiValueCheckClause(query);

  // const clauses = Sequelize.and(
  //   queryIdClauses.concat(betweenClauses).concat(multiValClauses)
  //   // [queryIdClauses, betweenClauses].reduce((acc, ele) => acc.concat(ele), [])
  // );

  // console.log(clauses);
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
  const limit = parseInt((req.query || {}).limit || 50, 10);
  const offset = parseInt((req.query || {}).offset || 0, 10);
  try {
    // select * from Sample where [...buildWhereClause] and [...buildBetweenClause];
    const whereClause = req.params.sampleId
      ? { id: guessSampleId(req.params.sampleId) }
      : buildWhereClause(req.query);
    const results = await SeqRun.findAndCountAll({
      // where: { ...buildWhereClause(req.query), ...buildBetweenClause(req.query) },
      // where: Sequelize.and(Sequelize.where(Sequelize.literal('alt_id->>\'original\''), "EGAR00002028223")),
      where: whereClause,
      include: [
        { model: Publication, as: 'publication' },
        { model: Sample, as: 'sample' },
      ],
      limit,
      offset,
      order: ['id'],
    });
    const { count: totalCnt, rows: samples } = results;
    const payload = samples.map((s) => {
      const data = s.toJSON();

      delete data.sampleId;
      delete data.publicationId;

      if (!data.sample) delete data.sample;
      if (!data.mbases) delete data.mbases;
      if (!data.altId) delete data.altId;

      // divide "analysis" into two groups: "hg19" and "hg38"
      data.analysis = {
        hg19: (data.analysis || []).filter((item) => item.assembly === 'hg19'),
        hg38: (data.analysis || []).filter((item) => item.assembly === 'hg38'),
      };

      return data;
    });
    return res.status(200).json({
      count: payload.length,
      offset,
      total: totalCnt,
      results: payload,
    });
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
