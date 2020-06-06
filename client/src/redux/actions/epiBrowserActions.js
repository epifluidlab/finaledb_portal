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

export function setFragmentSizeSeries(seriesOptions) {
  return (dispatch) => {
    const fetches = seriesOptions.map((item) =>
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

export function resetBrowserEntries(assembly, entryIds) {
  return (dispatch, getState) => {
    return fetch(`/samples?ID=${entryIds.join(',')}`)
      .then((response) => response.json())
      .then((samples) => {
        const entries = samples.reduce((acc, entry) => {
          acc[entry.id] = entry;
          return acc;
        }, {});

        dispatch({
          type: 'RESET_BROWSER_ENTRIES',
          payload: { assembly, entries },
        });

        const { fragSizeSeries } = getState().browser;
        setFragmentSizeSeries(fragSizeSeries || [])(dispatch);
      })
      .catch((err) => {
        console.log(err);
      });
  };
}
