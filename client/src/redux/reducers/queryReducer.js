const initialState = {
  seqrunQueryTerms: {
    assay: ['WGS'],
    minReadlen: 10,
    maxReadlen: 160,
    minMbases: 1,
    maxMbases: 3000,
    tissue: ['urine'],
    disease: ['Colorectal cancer', 'Pancreatic cancer'],
  },
  seqrunQueryResults: [],
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
    default:
      break;
  }
  return state;
}
