const { Router } = require('express');
const { Sequelize, Op } = require('sequelize');
const { Sample } = require('../models');

const router = Router();

const get = async (req, res, next) => {
  try {
    const samples = await Sample.findAll({
      where: buildWhereClause(req.query),
    });
    return res.status(200).json(samples);
  } catch (e) {
    return next(e);
  }
};

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

  const attrs = ['platform', 'disease'];
  const result = {}

  for (const attr of attrs) {
    if (query[attr] && query[attr].length) {
      result[attr] = { [Op.in]: query[attr].split(',') };
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

router.get('/', get);
router.get('/diseases', getDiseases);
router.get('/platforms', getPlatforms);
router.get('/libraryFormats', getLibraryFormats);
router.get('/tissues', getTissues);
router.get('/assayTypes', getAssayTypes);



module.exports = router;
