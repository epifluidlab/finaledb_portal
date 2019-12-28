const { Router } = require('express');
const { Sequelize, Op } = require('sequelize');
const { Sample } = require('../models');

const router = Router();

const get = async (req, res, next) => {
  try {
    const platformFilter = req.query.platform ? req.query.platform.split(',') : [];

    const samples = await Sample.findAll({
      where: platformFilter.length ? {
        platform: {
          [Op.in]: platformFilter
        }
      } : {}
    });
    return res.status(200).json(samples);
  } catch (e) {
    return next(e);
  }
};

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
