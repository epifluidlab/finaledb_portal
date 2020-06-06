// import statesExample from './epiBrowserStatesExample';
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
  entries: {},

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
  // // initial display region
  displayRegion: 'chr2:29028122-29057276',
};

function getDisplayedEntryIds(assembly, entries) {
  const ids = [];
  Object.values(entries || {}).forEach((entry) => {
    (entry.analysis || []).forEach((item) => {
      if (item.assembly !== assembly) return;

      switch (item.type) {
        case 'BAM':
          if (showBAM) ids.push(entry.id);
          break;
        case 'bigWig':
          ids.push(entry.id);
          break;
        default:
      }

      if (item.desc === 'fragment size') ids.push(entry.id);
    });
  });

  return ids.filter((val, idx, self) => self.indexOf(val) === idx);
}

// Colors that are used to display numeric tracks (such as bigWig)
function getColorMap(entryIds) {
  const trackColors = [
    '#058DC7',
    '#FF9655',
    '#24CBE5',
    '#DDDF00',
    '#FFF263',
    '#6AF9C4',
    '#50B432',
    '#ED561B',
    '#64E572',
  ];
  return entryIds.reduce((acc, ele, idx) => {
    acc[ele] = trackColors[idx % trackColors.length];
    return acc;
  }, {});
}

function getTracks(assembly, entries) {
  log.info(entries);

  // Merge tracks from entries and only keep those matching the assembly
  const tracks = Object.values(entries || {}).reduce((arr, entry) => {
    const filteredAnalysis = (entry.analysis || []).filter((val) => {
      if (val.assembly !== assembly) return false;

      switch (val.type) {
        case 'BAM':
          return showBAM;
        case 'bigWig':
          return true;
        default:
          return false;
      }
    });
    // Sample name: original altId or the universal entryId
    const sampleName = (entry.altId || {}).original || `EE${entry.id}`;
    const colorMap = getColorMap(getDisplayedEntryIds(assembly, entries));
    const tracksForEntry = filteredAnalysis.map((analysis) => {
      const url = `${s3Bucket}/${analysis.key}`;
      const name = (() => {
        switch (analysis.desc) {
          case 'BAM':
            return `BAM: ${sampleName}`;
          case 'coverage':
            return `Coverage: ${sampleName}`;
          case 'fragment profile':
            return `Fragments: ${sampleName}`;
          default:
            return '';
        }
      })();
      const { type } = analysis;
      // Each entry will be assigned a color from trackColors, by the natural order.
      const color = colorMap[entry.id];

      return {
        type,
        name,
        url,
        options: { color, height: 96 },
      };
    });

    return arr.concat(tracksForEntry);
  }, []);

  log.info('Successfully building up the tracks!');
  log.info(tracks);

  return tracks;
}

function getFragmentSizeSeries(assembly, entries) {
  // Merge tracks from entries and only keep those matching the assembly
  const tracks = Object.values(entries || {}).reduce((arr, entry) => {
    const filteredAnalysis = (entry.analysis || []).filter(
      (val) => val.assembly === assembly && val.desc === 'fragment size'
    );

    // Sample name: original altId or the universal entryId
    const sampleName = (entry.altId || {}).original || `EE${entry.id}`;
    const colorMap = getColorMap(getDisplayedEntryIds(assembly, entries));

    const series = filteredAnalysis.map((analysis) => ({
      name: sampleName,
      dataUrl: `${s3Bucket}/${analysis.key}`,
      color: colorMap[entry.id],
    }));

    return arr.concat(series);
  }, []);

  log.info('Successfully building up the tracks!');
  log.info(tracks);

  return tracks;
}

export default (state = initialState, action) => {
  const newState = {
    ...state,
  };

  switch (action.type) {
    case 'CHANGE_GENOME_ASSEMBLY': {
      if (state.assembly !== action.payload) {
        newState.assembly = action.payload;
        const newAssemblyTrack = {
          ...state.refTracks[1],
          genome: action.payload,
        };
        newState.refTracks = [state.refTracks[0], newAssemblyTrack];
        newState.revision += 1;
      }
      break;
    }
    case 'RESET_BROWSER_ENTRIES': {
      const { assembly, entries } = action.payload;
      newState.entries = entries;
      newState.displayedEntryIds = getDisplayedEntryIds(assembly, entries);
      newState.tracks = getTracks(assembly, entries);
      newState.fragSizeSeries = getFragmentSizeSeries(assembly, entries);
      newState.revision += 1;
      break;
    }
    case 'SET_FRAGMENT_SIZE_SERIES': {
      newState.fragSizeSeries = action.payload;
      break;
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
