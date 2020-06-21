import log from 'loglevel';

import { showBAM, s3Bucket } from '../../settings';

const initialState = {
  // This is a kind of version number for epiBrowser options. WashU Browser is
  // embedded so it isn't at all aware of React. Each time the underlying
  // options are changed, the revision number should also be updated, so that
  // the browser component knows it't time to re-render.
  revision: 1,
  assembly: 'hg38',

  // Metadata of all entries, no matter whether displayed or not
  // Key is the entryId
  entries: [],

  // Tracks for the reference genome
  refTracks: [
    {
      type: 'ruler',
      name: 'Ruler',
    },
    {
      type: 'geneAnnotation',
      name: 'refGene',
      genome: 'hg38',
    },
  ],
  tracks: [],
  fragSizeSeries: [],
  dataCache: {},
  // // initial display region
  // displayRegion: 'chr2:29028122-29057276',
  displayRegion: 'chr11:19713334-20121601',
};

// Each entry may have multiple analysis entities, or tracks, however,
// it's possible that none of them will be displayed, according to some
// criteria. "displayedEntryIds" is a list containing all entryIds that
// are displayed in the page
// Criteria: only display bigWig or fragment size distribution files
const getDisplayedEntryIds = (assembly, entries) => {
  return entries.reduce((acc, entry) => {
    // For each entry, look at its analysis field to find bigWig or fragment size
    const {
      analysis: { [assembly]: analysisForAssembly },
    } = entry;
    const shouldDisplay = (analysisForAssembly || []).reduce(
      (flag, item) =>
        flag || item.type === 'bigWig' || item.desc === 'fragment size',
      false
    );
    if (shouldDisplay) acc.push(entry.id);
    return acc;
  }, []);
};

// entries
//   .filter((item) => item.typpe === 'bigWig' || item.desc === 'fragment size')
//   .map((item) => item.id)
//   .filter((item, index, self) => self.indexOf(item) === index);

// Colors that are used to display numeric tracks (such as bigWig)
const getColorMap = (entryIds) => {
  const trackColors = [
    '#4b7bec',
    '#fc5c65',
    '#0fb9b1',
    '#fa8231',
    '#2d98da',
    '#eb3b5a',
    '#f7b731',
    '#a55eea',
    '#20bf6b',
    '#778ca3',

    // '#e41a1c',
    // '#377eb8',
    // '#4daf4a',
    // '#984ea3',
    // '#ff7f00',
    // '#ffff33',
    // '#a65628',
    // '#f781bf',
    // '#999999',

    // '#058DC7',
    // '#FF9655',
    // '#24CBE5',
    // '#DDDF00',
    // '#FFF263',
    // '#6AF9C4',
    // '#50B432',
    // '#ED561B',
    // '#64E572',
  ];
  return entryIds.reduce(
    (colorMap, entryId, index) => ({
      ...colorMap,
      ...{ [entryId]: trackColors[index % trackColors.length] },
    }),
    {}
  );
};

// Extract tracks from entries (right now only bigWig tracks)
// Return an ordered tracks array for WashU browser
const getTracks = (assembly, entries) => {
  log.info(entries);

  const colorMap = getColorMap(getDisplayedEntryIds(assembly, entries));

  return entries.reduce((tracks, entry) => {
    const {
      analysis: { [assembly]: analysisForAssembly },
      id: entryId,
      altId: { SRA: sraId, original: originalId },
      sample: { name: sampleName },
    } = entry;

    const canonicalEntryId = sraId || `EE${entryId}`;
    const canonicalSampleName = sampleName; // || geoId;
    const color = colorMap[entryId];

    // track order: coverage, fragment profile, and WPS
    ['coverage', 'fragment profile'].forEach((desc) => {
      const builtTracks = (analysisForAssembly || [])
        .filter((item) => item.type === 'bigWig' && item.desc === desc)
        .map((track) => {
          // Build the track object for WashU browser
          let trackNamePrefix = '';
          if (desc === 'fragment profile') trackNamePrefix = 'Fragment';
          if (desc === 'coverage') trackNamePrefix = 'Coverage';
          const trackName = `${trackNamePrefix}: ${
            canonicalSampleName
              ? `${canonicalEntryId}/${canonicalSampleName}`
              : canonicalSampleName
          }`;
          const trackUrl = `${s3Bucket}/${track.key}`;
          return {
            type: track.type,
            name: trackName,
            url: trackUrl,
            options: { color, height: 96 },
          };
        });
      if (builtTracks.length > 0) tracks.push(builtTracks[0]);
    });

    const wpsTracks = (analysisForAssembly || [])
      .filter((item) => item.type === 'bigWig' && item.desc === 'WPS')
      .map((track) => {
        // Build the track object for WashU browser
        const trackName = `WPS: ${
          canonicalSampleName
            ? `${canonicalEntryId}/${canonicalSampleName}`
            : canonicalSampleName
        }`;
        const trackUrl = `${s3Bucket}/${track.key}`;
        return {
          type: track.type,
          name: trackName,
          url: trackUrl,
          options: { color: 'gray', color2: color, height: 96 },
        };
      });
    if (wpsTracks.length > 0) tracks.push(wpsTracks[0]);

    return tracks;
  }, []);
};

const buildFragmentSizeSeries = (assembly, entries, dataCache) => {
  // Merge tracks from entries and only keep those matching the assembly
  // dataPts may be null
  const fragSizeSeries = (entries || []).reduce((acc, entry) => {
    const analysis = (entry.analysis[assembly] || []).find(
      (item) => item.desc === 'fragment size'
    );
    if (!analysis) return acc;

    const {
      id: entryId,
      altId: { SRA: sraId },
      sample: { name: sampleName },
    } = entry;

    const canonicalEntryId = sraId || `EE${entryId}`;
    const canonicalSampleName = sampleName; // || geoId;

    const colorMap = getColorMap(getDisplayedEntryIds(assembly, entries));
    const key = `fragsize.${entryId}.${assembly}`;
    const fragSizeData = {
      entryId,
      assembly,
      key,
      name: canonicalSampleName
        ? `${canonicalEntryId}/${canonicalSampleName}`
        : canonicalSampleName,
      dataUrl: `${s3Bucket}/${analysis.key}`,
      color: colorMap[entry.id],
    };

    // Look at the cache
    const { dataPts: cachedDataPts } = (dataCache || {})[key] || {};
    if (cachedDataPts) {
      console.log(
        `Cache hit for ${key}! First element: ${cachedDataPts[0][0]}: ${cachedDataPts[0][1]}`
      );
      fragSizeData.dataPts = [...cachedDataPts];
    }
    return [...acc, fragSizeData];
  }, []);

  log.info('Successfully building up the frag size series!');
  log.info(fragSizeSeries);

  return fragSizeSeries;
};

const reduceSetFragSizeSeries = (state, payload) => {
  if (!payload || payload.length === 0) return state;
  // payload: fragSizeSeries
  const { fragSizeSeries: prevFragSizeSeries, dataCache } = state;

  // Try update the cache
  payload.forEach((item) => {
    console.log(
      `Update cache at key: ${item.key}. 1st element: ${item.dataPts[0][0]}: ${item.dataPts[0][1]}`
    );
    const dataPtsCopy = item.dataPts.map((pair) => [...pair]);
    const itemCopy = { ...item, dataPts: dataPtsCopy };
    dataCache[item.key] = itemCopy;
  });

  // Only update dataPts where the key matches and for prevFragSizeSeries, dataPts is missing
  let updated = false;

  const newSeries = prevFragSizeSeries.map((item) => {
    // If not complete, try to find the updated version within payload
    if (!item.dataPts) {
      const peer = payload.find((item2) => item2.key === item.key);
      if (peer && peer.dataPts) {
        updated = true;
        return peer;
      }
    }
    return item;
  });

  if (updated) return { ...state, fragSizeSeries: newSeries, dataCache };
  return { ...state, dataCache };
};

// In a nutshell, the reducer sets the assembly, entries, tracks, and cached frag sizes
const reduceResetBrowserEntries = (state, payload) => {
  const {
    assembly: prevAssembly,
    entries: prevEntries,
    revision: prevRevision,
  } = state;
  const { assembly, entries } = payload;

  const prevEntryIds = (prevEntries || []).map((entry) => entry.id).sort();
  const entryIds = (entries || []).map((entry) => entry.id).sort();

  if (
    assembly === prevAssembly &&
    JSON.stringify(entryIds) === JSON.stringify(prevEntryIds)
  ) {
    // Exactly the same, no need to update
    console.log('Exactly the same');
    return state;
  }
  console.log('Not the same');
  console.log(state);
  console.log(payload);

  const refTracks = [
    {
      type: 'ruler',
      name: 'Ruler',
    },
    {
      type: 'geneAnnotation',
      name: 'refGene',
      genome: assembly,
    },
  ];
  const tracks = getTracks(assembly, entries);

  // Calculate the fragment size distribution series based on caching
  const { dataCache } = state;
  const fragSizeSeries = buildFragmentSizeSeries(assembly, entries, dataCache);

  const displayedEntryIds = getDisplayedEntryIds(assembly, entries);

  const newState = {
    ...state,
    assembly,
    entries,
    displayedEntryIds,
    refTracks,
    tracks,
    fragSizeSeries,
    revision: prevRevision + 1,
  };

  const { callback } = payload;
  if (callback) callback(newState);
  return newState;
};

export default (state = initialState, action) => {
  const newState = {
    ...state,
  };

  switch (action.type) {
    // case 'CHANGE_GENOME_ASSEMBLY': {
    //   const assembly = action.payload;
    //   if (state.assembly !== assembly) {
    //     newState.assembly = assembly;
    //     // The new refGene track
    //     const newAssemblyTrack = {
    //       ...state.refTracks[1],
    //       genome: assembly,
    //     };
    //     // [ruler, refGene]
    //     newState.refTracks = [state.refTracks[0], newAssemblyTrack];
    //     newState.displayedEntryIds = getDisplayedEntryIds(
    //       assembly,
    //       newState.entries
    //     );
    //     newState.tracks = getTracks(assembly, newState.entries);
    //     newState.fragSizeSeries = buildFragmentSizeSeries(
    //       assembly,
    //       newState.entries
    //     );
    //     newState.revision += 1;
    //   }
    //   break;
    // }
    case 'RESET_BROWSER_ENTRIES':
      return reduceResetBrowserEntries(state, action.payload);
    case 'SET_FRAGMENT_SIZE_SERIES': {
      return reduceSetFragSizeSeries(state, action.payload);
    }
    case 'SET_DISPLAY_REGION': {
      if (state.displayRegion !== action.payload) {
        newState.displayRegion = action.payload;
        newState.revision += 1;
      }
      break;
    }
    default:
      break;
  }

  return newState;
};
