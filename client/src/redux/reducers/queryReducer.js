const initialState = {
  seqrunQueryTerms: {
    search: '',
    assay: [],
    enableReadlen: false,
    minReadlen: 10,
    maxReadlen: 160,
    enableMbases: false,
    minMbases: 100,
    maxMbases: 10000,
    tissue: [],
    disease: [],
    instrument: [],
    publication: [],
    offset: 0,
  },
  seqrunQueryResults: { total: 0, entries: [], offset: 0 },
  // seqrun entries selected for visualization
  selectedSeqruns: [],
};

export default function queryReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_SEQRUN_QUERY_TERMS': {
      const newState = { ...state, seqrunQueryTerms: action.payload };
      return newState;
    }
    case 'SET_SEQRUN_QUERY_RESULTS': {
      const newState = { ...state, seqrunQueryResults: action.payload };
      return newState;
    }
    // case 'SET_READLEN_INPUT':
    // case 'SET_MBASES_INPUT': {
    //   const { value, isMin } = action.payload;
    //   const { seqrunQueryTerms: queryTerms } = state;
    //   const numValue = parseInt(value, 10);
    //   const updateKey = action.type == 'SET_READLEN_INPUT' ? (isMin ? 'minReadlenInput' : 'maxReadlenInput') : (isMin ? 'minMbasesInput' : 'maxReadlenInput')
    //   return {
    //     ...state,
    //     seqrunQueryTerms: { ...queryTerms, [updateKey]: numValue },
    //   };
    // }
    case 'TOGGLE_SELECTED_SEQRUNS':
      {
        const { entry, isSelected } = action.payload;
        const { selectedSeqruns: prevSelected } = state;

        // Add to the list
        if (
          isSelected &&
          !prevSelected.map((item) => item.id).includes(entry.id)
        ) {
          const newSelected = [...prevSelected, entry].sort(
            (entry1, entry2) => entry1.id - entry2.id
          );
          return { ...state, selectedSeqruns: newSelected };
        }

        // Remove from the list
        if (
          !isSelected &&
          prevSelected.map((item) => item.id).includes(entry.id)
        ) {
          const newSelected = prevSelected
            .filter((item) => item.id !== entry.id)
            .sort((entry1, entry2) => entry1.id - entry2.id);
          return { ...state, selectedSeqruns: newSelected };
        }
      }
      break;
    default:
      break;
  }
  return state;
}
