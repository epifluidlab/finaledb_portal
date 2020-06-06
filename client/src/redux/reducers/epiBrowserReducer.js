const initialState = {
  // This is a kind of version number for epiBrowser options. WashU Browser is
  // embedded so it isn't at all aware of React. Each time the underlying
  // options are changed, the revision number should also be updated, so that
  // the browser component knows it't time to re-render.
  revision: 1,
  assembly: 'hg38',

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
  // initial display region
  displayRegion: 'chr2:29028122-29057276',
  tracks: [
    {
      entryId: '85723',
      type: 'BAM',
      name: 'BAM (58723)',
      url:
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85723/hg38/EE85723.hg38.mdups.bam',
      assembly: 'hg38',
    },
    {
      entryId: '85723',
      type: 'bigWig',
      name: 'Coverage (85723)',
      url:
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85723/hg38/EE85723.hg38.coverage.bw',
      assembly: 'hg38',
    },
    {
      entryId: '85724',
      type: 'BAM',
      name: 'BAM (58724)',
      url:
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85724/hg38/EE85724.hg38.mdups.bam',
      assembly: 'hg38',
    },
    {
      entryId: '85724',
      type: 'bigWig',
      name: 'Coverage (85724)',
      url:
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85724/hg38/EE85724.hg38.coverage.bw',
      assembly: 'hg38',
    },
    {
      entryId: '85723',
      type: 'BAM',
      name: 'BAM (58723)',
      url:
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85723/hg19/EE85723.hg19.mdups.bam',
      assembly: 'hg19',
    },
    {
      entryId: '85723',
      type: 'bigWig',
      name: 'Coverage (85723)',
      url:
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85723/hg19/EE85723.hg19.coverage.bw',
      assembly: 'hg19',
    },
    {
      entryId: '85724',
      type: 'BAM',
      name: 'BAM (58724)',
      url:
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85724/hg19/EE85724.hg19.mdups.bam',
      assembly: 'hg19',
    },
    {
      entryId: '85724',
      type: 'bigWig',
      name: 'Coverage (85724)',
      url:
        'https://s3.us-east-2.amazonaws.com/cfdnadb.epifluidlab.cchmc.org/entries/EE85724/hg19/EE85724.hg19.coverage.bw',
      assembly: 'hg19',
    },
  ],
};

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
    case 'SET_TRACKS': {
      // Make an immutable copy
      const tracks = action.payload.map((item) => {
        return { ...item };
      });
      newState.tracks = tracks;
      newState.revision += 1;
      break;
    }
    default:
      break;
  }

  return newState;
};
