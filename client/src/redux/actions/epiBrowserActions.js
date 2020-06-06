export const changeGenomeAssembly = (assembly) => ({
  type: 'CHANGE_GENOME_ASSEMBLY',
  payload: assembly,
});

export const setBrowserTracks = (tracks) => ({
  type: 'SET_BROWSER_TRACKS',
  payload: tracks,
});
