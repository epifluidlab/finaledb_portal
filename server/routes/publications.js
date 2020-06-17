const { Router } = require('express');
const { Publication } = require('../models');

const router = Router();

const get = async (req, res, next) => {
  // Default limit of query results: 50
  const limit = (req.query || {}).limit || 50;
  const offset = (req.query || {}).offset || 0;
  try {
    const publications = await Publication.findAll({ limit, offset });
    return res
      .status(200)
      .json({ count: publications.length, results: publications });
  } catch (e) {
    // return next(e);
    console.log(e);
    return res.status(500).json(e);
  }
};

router.get('/', get);

module.exports = router;
