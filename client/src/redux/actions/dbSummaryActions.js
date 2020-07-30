export default function getDbSummary() {
  return (dispatch) => {
    const promiseSummary = fetch('/api/v1/summary').then((response) =>
      response.json()
    );
    const promisePublication = fetch('/api/v1/publication').then((response) =>
      response.json()
    );

    Promise.all([promiseSummary, promisePublication]).then((values) => {
      const summary = values[0];
      const { results: publication } = values[1];
      console.log(values);

      summary.publication = publication;

      dispatch({
        type: 'SET_DB_SUMMARY',
        payload: summary,
      });
    });
  };
}
