export const setQueryTerms = (queryTerms) => ({
  type: 'SET_SEQRUN_QUERY_TERMS',
  payload: queryTerms,
});

export const setReadlenInput = (value, isMin) => ({
  type: 'SET_READLEN_INPUT',
  payload: { value, isMin },
});

export const querySeqrun = (queryTerms) => (dispatch) => {
  // Build the query terms
  const query = [`limit=50`];

  const {
    search,
    assay,
    enableReadlen,
    minReadlen,
    maxReadlen,
    enableFragNum,
    minFragNum,
    maxFragNum,
    disease,
    tissue,
    // gender,
    instrument,
    publication,
    offset,
  } = queryTerms;
  if (search && search.length > 0) query.push(`search=${encodeURI(search)}`);
  if (assay && assay.length > 0)
    query.push(`assay=${encodeURI(assay.join(','))}`);
  if (minReadlen && maxReadlen && enableReadlen)
    query.push(`readlen=${minReadlen},${maxReadlen}`);
  if (minFragNum && maxFragNum && enableFragNum)
    query.push(`frag_num=${minFragNum},${maxFragNum}`);

  // if (minMbases && maxMbases) query.push(`mbases=${minMbases},${maxMbases}`);
  if (disease && disease.length > 0) query.push(`disease=${disease.join(',')}`);
  if (tissue && tissue.length > 0) query.push(`tissue=${tissue.join(',')}`);
  if (instrument && instrument.length > 0)
    query.push(`instrument=${instrument.join(',')}`);
  if (publication && publication.length > 0)
    query.push(`publication=${publication.join(',')}`);

  query.push(`offset=${offset}`);

  const url = `/samples?${query.join('&')}`;
  console.log(url);
  const fetchPromise = fetch(url);
  return fetchPromise
    .then((response) => response.json())
    .then((response) => {
      dispatch({
        type: 'SET_SEQRUN_QUERY_RESULTS',
        payload: {
          entries: response.results,
          offset: response.offset,
          total: response.total,
        },
      });
    });
};

export const toggleSelectedSeqruns = (entry, isSelected) => ({
  type: 'TOGGLE_SELECTED_SEQRUNS',
  payload: { entry, isSelected },
});
