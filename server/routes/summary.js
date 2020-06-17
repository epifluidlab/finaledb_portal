// Return a summary of the whole database, such as number of samples, number of diseases, etc

const { Router } = require('express');
const sequelize = require('../db');
const { Sequelize, Op, QueryTypes } = require('sequelize');
const { SeqRun, Publication, Sample } = require('../models');

const router = Router();

const summarize = async (req, res, next) => {
  const summary = {};
  try {
    let results = await sequelize.query(
      'SELECT COUNT(id) count FROM dev.seqrun WHERE hidden != TRUE',
      { type: QueryTypes.SELECT }
    );
    summary.seqRunCnt = parseInt(results[0].count, 10);

    results = await sequelize.query(
      'SELECT COUNT(DISTINCT dev.sample.name) FROM dev.seqrun \n' +
        'LEFT OUTER JOIN dev.sample ON (dev.seqrun.sample_id = dev.sample.id) \n' +
        'WHERE dev.seqrun.hidden != TRUE',
      {
        type: QueryTypes.SELECT,
      }
    );
    summary.sampleCnt = parseInt(results[0].count, 10);

    results = await sequelize.query(
      'SELECT count(dev.seqrun.id) count, disease FROM dev.seqrun \n' +
        'LEFT OUTER JOIN dev.sample ON (dev.seqrun.sample_id = dev.sample.id) \n' +
        'WHERE dev.seqrun.hidden != TRUE GROUP BY disease',
      { type: QueryTypes.SELECT }
    );
    summary.disease = results.reduce((acc, ele) => {
      if (ele.disease) acc[ele.disease] = parseInt(ele.count, 10);
      // else acc.Others = parseInt(ele.count, 10);
      return acc;
    }, {});

    results = await sequelize.query(
      'SELECT count(dev.seqrun.id) count, tissue FROM dev.seqrun \n' +
        'LEFT OUTER JOIN dev.sample ON (dev.seqrun.sample_id = dev.sample.id) \n' +
        'WHERE dev.seqrun.hidden != TRUE GROUP BY tissue',
      { type: QueryTypes.SELECT }
    );
    summary.tissue = results.reduce((acc, ele) => {
      if (ele.tissue && ele.tissue.indexOf('tumor tissue') === -1)
        acc[ele.tissue] = parseInt(ele.count, 10);
      // else acc.Others = parseInt(ele.count, 10);
      return acc;
    }, {});

    results = await sequelize.query(
      'SELECT COUNT(id) count, assay FROM dev.seqrun WHERE hidden != TRUE GROUP BY assay',
      { type: QueryTypes.SELECT }
    );
    summary.assay = results.reduce((acc, ele) => {
      if (ele.assay) acc[ele.assay] = parseInt(ele.count, 10);
      else acc.Others = parseInt(ele.count, 10);
      return acc;
    }, {});
  } catch (e) {
    return next(e);
  }
  return res.status(200).json(summary);
  // try {
  //   // select * from Sample where [...buildWhereClause] and [...buildBetweenClause];
  //   const whereClause = req.params.sampleId
  //     ? { id: guessSampleId(req.params.sampleId) }
  //     : buildWhereClause(req.query);
  //   const samples = await SeqRun.findAll({
  //     // where: { ...buildWhereClause(req.query), ...buildBetweenClause(req.query) },
  //     // where: Sequelize.and(Sequelize.where(Sequelize.literal('alt_id->>\'original\''), "EGAR00002028223")),
  //     where: whereClause,
  //     include: [
  //       { model: Publication, as: 'publication' },
  //       { model: Sample, as: 'sample' },
  //     ],
  //   });
  //   const payload = samples.map((s) => {
  //     const data = s.toJSON();
  //     data.id = `${s.id}`;

  //     // Additional mapping:
  //     // altId->>original => originalId, altId->>SRA => sraId
  //     data.originalId = (data.altId || {}).original || '';
  //     data.sraId = (data.altId || {}).sraId || '';
  //     delete data.altId;

  //     delete data.sampleId;
  //     delete data.publicationId;
  //     return data;
  //   });
  //   return res.status(200).json(payload);
  // } catch (e) {
  //   return next(e);
  // }
};

router.get('/', summarize);

module.exports = router;
