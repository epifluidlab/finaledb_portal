// Return a summary of the whole database, such as number of samples, number of diseases, etc

const { Router } = require('express');
const router = Router();

const s3Bucket = process.env.FINALEDB_S3PUBLIC;

const misc = async (req, res, next) => {
  return res
      .status(200)
      .json({ s3: s3Bucket });
};

router.get('/*', misc);

module.exports = router;
