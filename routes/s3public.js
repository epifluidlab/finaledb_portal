// Return a summary of the whole database, such as number of samples, number of diseases, etc

const { Router } = require('express');
const router = Router();

const s3Bucket = process.env.FINALEDB_S3PUBLIC;

const s3public = async (req, res, next) => {
  const s3_url = `${s3Bucket}${req.url}`
  res.redirect(s3_url);
};

router.get('/*', s3public);

module.exports = router;
