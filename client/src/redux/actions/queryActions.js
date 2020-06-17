export default function QUERY_SEQRUN(queryTerms) {
  return (dispatch) => {
    // Build the query terms
    const query = [];

    const {
      assay,
      minReadlen,
      maxReadlen,
      minMbases,
      maxMbases,
      disease,
      tissue,
    } = queryTerms;
    if (assay) query.push(`assay=${assay}`);
    if (minReadlen && maxReadlen)
      query.push(`readlen=${minReadlen},${maxReadlen}`);
    if (minMbases && maxMbases) query.push(`mbases=${minMbases},${maxMbases}`);
    if (disease && disease.length > 0)
      query.push(`disease=${disease.join(',')}`);
    if (tissue && tissue.length > 0) query.push(`tissue=${tissue.join(',')}`);

    const fetchPromise =
      query.length > 0
        ? fetch(`/samples?${query.join('&')}`)
        : fetch(`/samples`);
    return fetchPromise
      .then((response) => response.json())
      .then((payload) => {
        dispatch({
          type: 'QUERY_SEQRUN',
          payload: payload.results,
        });
      });
  };
}
