export const setQueryTerms = (queryTerms) => ({
  type: 'SET_SEQRUN_QUERY_TERMS',
  payload: queryTerms,
});

export const querySeqrun = (queryTerms) => (dispatch) => {
  // Build the query terms
  const query = [`limit=50`];

  const {
    assay,
    minReadlen,
    maxReadlen,
    minMbases,
    maxMbases,
    disease,
    tissue,
    // gender,
    // instrument,
  } = queryTerms;
  if (assay && assay.length > 0) query.push(`assay=${encodeURI(assay.join(','))}`);
  if (minReadlen) query.push(`min_readlen=${minReadlen}`);
  if (maxReadlen) query.push(`max_readlen=${minReadlen}`);
  if (minMbases) query.push(`min_mbases=${minReadlen}`);
  if (maxMbases) query.push(`max_mbases=${minReadlen}`);
  if (disease && disease.length > 0) query.push(`disease=${disease.join(',')}`);
  if (tissue && tissue.length > 0) query.push(`tissue=${disease.join(',')}`);

  const url = `/samples?${query.join('&')}`;
  console.log(url);
  const fetchPromise = fetch(url);
  return fetchPromise
    .then((response) => response.json())
    .then((response) => {
      dispatch({
        type: 'SET_SEQRUN_QUERY_RESULTS',
        payload: response.results,
      });
    });
};
