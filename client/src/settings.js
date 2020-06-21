export const s3Prefix =
  'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries';

export const s3Bucket =
  'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org';

export const showBAM = false;

export const defaultSeqrunQueryTerms = {
  search: '',
  assay: [],
  enableReadlen: false,
  minReadlen: 10,
  maxReadlen: 160,
  enableFragNum: false,
  minFragNum: 10e6,
  maxFragNum: 100e6,
  tissue: [],
  disease: [],
  instrument: [],
  publication: [],
  offset: 0,
}