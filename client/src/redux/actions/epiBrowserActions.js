export const changeGenomeAssembly = (assembly) => ({
  type: 'CHANGE_GENOME_ASSEMBLY',
  payload: assembly,
});

// export const setBrowserTracks = (tracks) => ({
//   type: 'SET_BROWSER_TRACKS',
//   payload: tracks,
// });

export const setDisplayRegion = (region) => ({
  type: 'SET_DISPLAY_REGION',
  payload: region,
});

// Fetch fragment size distribution files for all incomplete series
export function fetchFragmentSizeSeries(fragSizeSeries) {
  return (dispatch) => {
    const incompleteSeries = fragSizeSeries.filter((item) => !item.dataPts);
    if (incompleteSeries.length === 0) return;
    console.log(`Found ${incompleteSeries.length} incomplete fragSizeSeries`);
    const fetches = incompleteSeries.map((item) =>
      fetch(item.dataUrl)
        .then((response) => response.text())
        .then((rawData) => {
          // Parse the raw data (fragment size) and return data points
          // Return: [[12, 24], [13, 27], ... ]
          const dataPts = rawData
            .trim()
            .split('\n')
            .slice(11)
            .map((v) => {
              const m = /(\d+)(\s+)(\d+)/.exec(v);
              return [m[1], m[3]].map((ele) => parseInt(ele, 10));
            });
          return { ...item, dataPts };
        })
        .catch((err) => {
          console.log(err);
        })
    );
    Promise.all(fetches).then((values) => {
      dispatch({
        type: 'SET_FRAGMENT_SIZE_SERIES',
        payload: values,
      });
    });
  };
}

export const resetBrowserEntries = (assembly, entries, callback) => ({
  type: 'RESET_BROWSER_ENTRIES',
  payload: { assembly, entries, callback },
});

export const setExternalTracks = (externalTracks) => ({
  type: 'SET_EXTERNAL_TRACKS',
  payload: { externalTracks },
});
