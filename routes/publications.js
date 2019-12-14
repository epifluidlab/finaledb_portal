const { Router } = require('express');
const { Publication } = require('../models');

const router = Router();

const get = async (req, res, next) => {
  try {
    const publications = await Publication.findAll();
    return res.status(200).json(publications);
  } catch (e) {
    // return next(e);
    console.log(e);
    return res.status(500).json(e);
  }
};

router.get('/', get);

module.exports = router;
