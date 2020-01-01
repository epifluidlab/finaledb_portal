const { Router } = require('express');
const { Sequelize, Op } = require('sequelize');
const { Sample } = require('../models');

const router = Router();

const get = async (req, res, next) => {
  try {
    // select * from Sample where [...buildWhereClause] and [...buildBetweenClause];
    const samples = await Sample.findAll({
      where: { ...buildWhereClause(req.query), ...buildBetweenClause(req.query) },
    });
    return res.status(200).json(samples);
  } catch (e) {
    return next(e);
  }
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

const buildWhereClause = (query) => {
  if (!query) {
    return {}
  }

  const attrs = ['platform', 'disease', 'tissue', 'doi', 'libraryFormat', 'assayType', 'sraId'];
  const result = {}

  for (const attr of attrs) {
    if (query[attr] && query[attr].length) {
      result[attr] = { [Op.in]: query[attr].split(',') };
    }
  }

  return result;
}

// [Op.between]: [6, 10],     // BETWEEN 6 AND 10

const buildBetweenClause = (query) => {
  if (!query) {
    return {}
  }

  const attrs = ['readLength', 'mbases'];
  const result = {}

  for (const attr of attrs) {
    if (query[attr] && query[attr].length) {
      // console.log(query[attr]);
      // console.log(query[attr].split(',').map((n) => parseInt(n, 10)));
      const min = parseInt(query[attr].split(',')[0], 10);
      const max = parseInt(query[attr].split(',')[1], 10);
      //console.log(min + ' ' + max)
      if (min && max) {
        result[attr] = { [Op.between]: query[attr].split(',').map((n) => parseInt(n, 10)) };
      }
    }
  }

  return result;
}

const getCountHandler = (attr) => async (req, res, next) => {
  try {
    const counts = await Sample.findAll({
      attributes: [attr, [Sequelize.fn('count', Sample.col(attr)), 'count']],
      group: [attr],
    });

    return res.status(200).json(counts);
  } catch (e) {
    return next(e);
  }
}

const getDiseases = getCountHandler('disease');
const getPlatforms = getCountHandler('platform');
const getLibraryFormats = getCountHandler('libraryFormat');
const getTissues = getCountHandler('tissue');
const getAssayTypes = getCountHandler('assayType');
const getDois = getCountHandler('doi');
const getMBases = getCountHandler('mbases');



const getReadLengths = getCountHandler('readLength');


router.get('/', get);
router.get('/diseases', getDiseases);
router.get('/platforms', getPlatforms);
router.get('/libraryFormats', getLibraryFormats);
router.get('/tissues', getTissues);
router.get('/assayTypes', getAssayTypes);
router.get('/readLengths', getReadLengths);
router.get('/dois', getDois);
router.get('/mbases', getMBases);






module.exports = router;
